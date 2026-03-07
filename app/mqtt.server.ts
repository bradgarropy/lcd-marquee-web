import mqtt from "mqtt"

import {env} from "~/env.server"

const TOPIC = "lcd-marquee/messages"

type Message = {
    message: string
    twitter: string
}

const publish = async (data: Message): Promise<void> => {
    const client = await mqtt.connectAsync(env.MQTT_URL, {
        username: env.MQTT_USERNAME,
        password: env.MQTT_PASSWORD,
    })

    await client.publishAsync(TOPIC, JSON.stringify(data))

    await client.endAsync()
}

export {publish}
