import {z} from "zod"

const envSchema = z.object({
    MQTT_URL: z.url("MQTT_URL must be a valid URL"),
    MQTT_USERNAME: z.string().min(1, "MQTT_USERNAME cannot be empty"),
    MQTT_PASSWORD: z.string().min(1, "MQTT_PASSWORD cannot be empty"),
})

const env = envSchema.parse(process.env)

export {env}
