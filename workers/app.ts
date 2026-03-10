import {createRequestHandler} from "react-router"

export {Mqtt} from "~/workers/mqtt"

declare module "react-router" {
    interface AppLoadContext {
        cloudflare: {
            env: Env
            ctx: ExecutionContext
        }
    }
}

const requestHandler = createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE,
)

export default {
    fetch(request, env, ctx) {
        const url = new URL(request.url)

        // Handle WebSocket connections at /ws
        if (url.pathname === "/ws") {
            const upgradeHeader = request.headers.get("Upgrade")

            if (upgradeHeader?.toLowerCase() !== "websocket") {
                return new Response("Expected WebSocket", {status: 426})
            }

            const id = env.MQTT.idFromName("singleton")
            const stub = env.MQTT.get(id)
            return stub.fetch(request)
        }

        // Handle all other requests with React Router
        return requestHandler(request, {
            cloudflare: {env, ctx},
        })
    },
} satisfies ExportedHandler<Env>
