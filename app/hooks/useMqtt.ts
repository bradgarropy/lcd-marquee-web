import {useEffect, useRef, useState} from "react"

import type {Message} from "~/mqtt.server"

interface UseMqttOptions {
    onMessage?: (message: Message) => void
}

const useMqtt = (options: UseMqttOptions = {}) => {
    const {onMessage} = options
    const [isConnected, setIsConnected] = useState(false)
    const onMessageRef = useRef(onMessage)

    useEffect(() => {
        onMessageRef.current = onMessage
    }, [onMessage])

    useEffect(() => {
        let ws: WebSocket | null = null
        let reconnectTimeout: number | null = null
        let shouldReconnect = true

        const connect = () => {
            if (!shouldReconnect || ws) {
                return
            }

            const protocol =
                window.location.protocol === "https:" ? "wss:" : "ws:"
            const wsUrl = `${protocol}//${window.location.host}/ws`
            ws = new WebSocket(wsUrl)

            ws.onopen = () => {
                setIsConnected(true)
            }

            ws.onmessage = event => {
                try {
                    const data: Message = JSON.parse(event.data)
                    onMessageRef.current?.(data)
                } catch {
                    // Ignore non-JSON messages
                }
            }

            ws.onclose = () => {
                setIsConnected(false)
                ws = null

                if (shouldReconnect) {
                    reconnectTimeout = window.setTimeout(connect, 3000)
                }
            }

            ws.onerror = () => {}
        }

        connect()

        return () => {
            shouldReconnect = false
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout)
            }
            ws?.close()
        }
    }, [])

    return {isConnected}
}

export {useMqtt}
