import {z} from "zod"

const messageSchema = z.object({
    message: z.string().min(1),
    twitter: z.string().min(1),
})

type Message = z.infer<typeof messageSchema>

export {messageSchema}
export type {Message}
