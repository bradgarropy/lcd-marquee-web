import {z} from "zod"

const envSchema = z.object({
    MQTT_URL: z.string(),
    MQTT_USERNAME: z.string(),
    MQTT_PASSWORD: z.string(),
})

const env = envSchema.parse(process.env)

export {env}
