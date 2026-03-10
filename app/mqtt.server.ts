import mqtt from "mqtt"

import type {Message} from "~/schemas/message"

const TOPIC = "lcd-marquee/messages"

const publish = async (data: Message, env: Env): Promise<void> => {
    const client = await mqtt.connectAsync(env.MQTT_URL, {
        username: env.MQTT_USERNAME,
        password: env.MQTT_PASSWORD,
    })

    await client.publishAsync(TOPIC, JSON.stringify(data))

    await client.endAsync()
}

export {publish}
