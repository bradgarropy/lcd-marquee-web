import mqtt, {type MqttClient} from "mqtt"

const TOPIC = "lcd-marquee/messages"

export class Mqtt implements DurableObject {
    private state: DurableObjectState
    private env: Env
    private mqttClient: MqttClient | null = null

    constructor(state: DurableObjectState, env: Env) {
        this.state = state
        this.env = env
    }

    async fetch(request: Request): Promise<Response> {
        const upgradeHeader = request.headers.get("Upgrade")

        if (upgradeHeader?.toLowerCase() !== "websocket") {
            return new Response("Expected WebSocket", {status: 426})
        }

        if (!this.env.MQTT_URL) {
            return new Response("MQTT not configured", {status: 503})
        }

        const pair = new WebSocketPair()
        const [client, server] = Object.values(pair)

        this.state.acceptWebSocket(server)

        if (!this.mqttClient) {
            this.connectMqtt()
        }

        return new Response(null, {status: 101, webSocket: client})
    }

    private connectMqtt(): void {
        this.mqttClient = mqtt.connect(this.env.MQTT_URL, {
            username: this.env.MQTT_USERNAME,
            password: this.env.MQTT_PASSWORD,
            reconnectPeriod: 5000,
        })

        this.mqttClient.on("connect", () => {
            this.mqttClient?.subscribe(TOPIC)
        })

        this.mqttClient.on("message", (_topic, payload) => {
            this.broadcast(payload.toString())
        })
    }

    private broadcast(message: string): void {
        for (const ws of this.state.getWebSockets()) {
            try {
                ws.send(message)
            } catch {
                // Client disconnected
            }
        }
    }

    private disconnectMqtt(): void {
        this.mqttClient?.end()
        this.mqttClient = null
    }

    webSocketClose(): void {
        if (this.state.getWebSockets().length === 0) {
            this.disconnectMqtt()
        }
    }

    webSocketError(): void {
        if (this.state.getWebSockets().length === 0) {
            this.disconnectMqtt()
        }
    }
}
