import {useCallback, useEffect, useState} from "react"
import {Form, useActionData, useNavigation} from "react-router"

import {LCD} from "~/components/LCD"
import {useMqtt} from "~/hooks/useMqtt"
import {publish} from "~/mqtt.server"
import {type Message, messageSchema} from "~/schemas/message"

import type {Route} from "./+types/home"

const action = async ({request, context}: Route.ActionArgs) => {
    const formData = await request.formData()
    const message = messageSchema.parse(Object.fromEntries(formData))

    await publish(message, context.cloudflare.env)

    return {success: true}
}

const meta = () => {
    return [
        {title: "LCD Marquee"},
        {
            name: "description",
            content: "Send messages to the LCD marquee display",
        },
    ]
}

const Home = () => {
    const actionData = useActionData<typeof action>()
    const navigation = useNavigation()
    const [message, setMessage] = useState("")
    const [twitter, setTwitter] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])

    const isSubmitting = navigation.state !== "idle"

    const handleMqttMessage = useCallback((msg: Message) => {
        setMessages(prev => [...prev, msg])
    }, [])

    const handleMessageComplete = useCallback(() => {
        setMessages(prev => prev.slice(1))
    }, [])

    useMqtt({
        onMessage: handleMqttMessage,
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
        <div className="flex h-screen flex-col">
            {/* Form Section - gradient from white to blue-600 */}
            <div className="h-1/2 bg-linear-to-b/oklch from-white from-50% to-blue-600 p-6">
                <Form
                    method="post"
                    aria-busy={isSubmitting}
                    className="max-w-md mx-auto"
                >
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
                            <label
                                htmlFor="message"
                                className="text-gray-800 mb-1"
                            >
                                Message
                            </label>
                            <input
                                type="text"
                                id="message"
                                name="message"
                                className="w-full border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded focus:border-blue-500 focus:outline-none"
                                required
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label
                                htmlFor="twitter"
                                className="text-gray-800 mb-1"
                            >
                                Twitter Handle
                            </label>
                            <input
                                type="text"
                                id="twitter"
                                name="twitter"
                                className="w-full border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded focus:border-blue-500 focus:outline-none"
                                required
                                value={twitter}
                                onChange={e => setTwitter(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="cursor-pointer bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Sending..." : "Send"}
                        </button>
                    </fieldset>
                </Form>
            </div>

            {/* LCD Screen Section - solid blue-600 */}
            <div className="h-1/2 flex items-center p-6 bg-blue-600">
                <LCD
                    messages={messages}
                    onMessageComplete={handleMessageComplete}
                />
            </div>
        </div>
    )
}

export default Home
export {action, meta}
