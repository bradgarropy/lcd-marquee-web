import {useEffect, useState} from "react"
import {Form, useActionData, useNavigation} from "react-router"

import {useMqtt} from "~/hooks/useMqtt"
import {publish} from "~/mqtt.server"
import {messageSchema} from "~/schemas/message"

import type {Route} from "./+types/home"

const action = async ({request, context}: Route.ActionArgs) => {
    const formData = await request.formData()
    const message = messageSchema.parse(Object.fromEntries(formData))

    await publish(message, context.cloudflare.env)

    return {success: true}
}

const meta = () => {
    return [
        {title: "New React Router App"},
        {name: "description", content: "Welcome to React Router!"},
    ]
}

const Home = () => {
    const actionData = useActionData<typeof action>()
    const navigation = useNavigation()
    const [message, setMessage] = useState("")
    const [twitter, setTwitter] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)

    const isSubmitting = navigation.state !== "idle"

    useMqtt({
        onMessage: msg => console.log("[MQTT Message]", msg),
    })

    useEffect(() => {
        if (actionData?.success) {
            setMessage("")
            setTwitter("")
            setShowSuccess(true)

            const timeout = setTimeout(() => {
                setShowSuccess(false)
            }, 3000)

            return () => clearTimeout(timeout)
        }
    }, [actionData])

    const isDisabled = !message || !twitter

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Form method="post" aria-busy={isSubmitting}>
                <p
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="mb-4 min-h-6 text-green-600"
                >
                    {showSuccess && "Message sent!"}
                </p>

                <fieldset
                    disabled={isSubmitting}
                    className="m-0 flex flex-col gap-4 border-0 p-0"
                >
                    <div className="flex flex-col">
                        <label htmlFor="message">Message</label>
                        <input
                            type="text"
                            id="message"
                            name="message"
                            className="w-80 border border-black px-4 py-2"
                            required
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="twitter">Twitter Handle</label>
                        <input
                            type="text"
                            id="twitter"
                            name="twitter"
                            className="w-80 border border-black px-4 py-2"
                            required
                            value={twitter}
                            onChange={e => setTwitter(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isDisabled}
                        className="cursor-pointer bg-black text-white px-4 py-2 hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {isSubmitting ? "Sending..." : "Send"}
                    </button>
                </fieldset>
            </Form>
        </div>
    )
}

export default Home
export {action, meta}
