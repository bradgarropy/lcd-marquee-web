import {DurableObject} from "cloudflare:workers"
import mqtt, {type MqttClient} from "mqtt"

import type {Message} from "~/mqtt.server"

const TOPIC = "lcd-marquee/messages"

export class Mqtt extends DurableObject<Env> {
    private connections: Set<WebSocket> = new Set()
    private mqttClient: MqttClient | null = null

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env)

        // Restore hibernated WebSocket connections
        this.ctx.getWebSockets().forEach(ws => {
            this.connections.add(ws)
        })

        // If we have connections, ensure MQTT is connected
        if (this.connections.size > 0) {
            this.connectToMqtt()
        }
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url)

        if (
            url.pathname === "/ws" &&
            request.headers.get("Upgrade") === "websocket"
        ) {
            const pair = new WebSocketPair()
            const [client, server] = [pair[0], pair[1]]

            // Accept with hibernation support
            this.ctx.acceptWebSocket(server)
            this.connections.add(server)

            // Connect to MQTT if this is the first connection
            if (this.connections.size === 1) {
                this.connectToMqtt()
            }

            return new Response(null, {
                status: 101,
                webSocket: client,
            })
        }

        return new Response("Not found", {status: 404})
    }

    webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
        // Handle ping/pong for keepalive
        if (message === "ping") {
            ws.send("pong")
        }
    }

    webSocketClose(ws: WebSocket): void {
        this.connections.delete(ws)

        // Disconnect from MQTT if no more connections
        if (this.connections.size === 0) {
            this.disconnectFromMqtt()
        }
    }

    webSocketError(ws: WebSocket): void {
        this.connections.delete(ws)

        if (this.connections.size === 0) {
            this.disconnectFromMqtt()
        }
    }

    private async connectToMqtt(): Promise<void> {
        if (this.mqttClient) return

        try {
            this.mqttClient = await mqtt.connectAsync(this.env.MQTT_URL, {
                username: this.env.MQTT_USERNAME,
                password: this.env.MQTT_PASSWORD,
            })

            console.log("MQTT connected successfully")

            await this.mqttClient.subscribeAsync(TOPIC)
            console.log("Subscribed to topic:", TOPIC)

            this.mqttClient.on("message", (_topic, payload) => {
                try {
                    const message: Message = JSON.parse(payload.toString())
                    this.broadcastToClients(message)
                } catch {
                    console.error(
                        "Failed to parse MQTT message:",
                        payload.toString(),
                    )
                }
            })

            this.mqttClient.on("close", () => {
                console.log("MQTT connection closed")
                this.mqttClient = null
            })

            this.mqttClient.on("error", error => {
                console.error("MQTT error:", error)
            })
        } catch (error) {
            console.error("Failed to connect to MQTT:", error)
            this.mqttClient = null
        }
    }

    private async disconnectFromMqtt(): Promise<void> {
        if (this.mqttClient) {
            await this.mqttClient.endAsync()
            this.mqttClient = null
            console.log("MQTT disconnected")
        }
    }

    private broadcastToClients(message: Message): void {
        const json = JSON.stringify(message)

        for (const ws of this.connections) {
            try {
                ws.send(json)
            } catch {
                this.connections.delete(ws)
            }
        }
    }
}
