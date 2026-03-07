import mqtt from "mqtt"
import {z} from "zod"

import {env} from "~/env.server"

const TOPIC = "lcd-marquee/messages"

const messageSchema = z.object({
    message: z.string().min(1),
    twitter: z.string().min(1),
})

type Message = z.infer<typeof messageSchema>

const publish = async (data: Message): Promise<void> => {
    const client = await mqtt.connectAsync(env.MQTT_URL, {
        username: env.MQTT_USERNAME,
        password: env.MQTT_PASSWORD,
    })

    await client.publishAsync(TOPIC, JSON.stringify(data))

    await client.endAsync()
}

export {messageSchema, publish}
