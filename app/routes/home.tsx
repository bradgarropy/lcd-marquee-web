import {useCallback, useEffect, useState} from "react"
import {useFetcher} from "react-router"

import {LCD} from "~/components/LCD"
import {useMqtt} from "~/hooks/useMqtt"
import {publish} from "~/mqtt.server"
import {type Message, messageSchema} from "~/schemas/message"

import type {Route} from "./+types/home"

const action = async ({request, context}: Route.ActionArgs) => {
    const formData = await request.formData()
    const twitter = formData.get("twitter") as string
    formData.set("twitter", `@${twitter}`)
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
    const fetcher = useFetcher<typeof action>()
    const [message, setMessage] = useState("")
    const [twitter, setTwitter] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])

    const isSubmitting = fetcher.state !== "idle"

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
        if (fetcher.data?.success) {
            setMessage("")
            setTwitter("")
            setShowSuccess(true)

            const timeout = setTimeout(() => {
                setShowSuccess(false)
            }, 3000)

            return () => clearTimeout(timeout)
        }
    }, [fetcher.data])

    const isDisabled = !message || !twitter

    return (
        <main className="flex h-screen flex-col items-center justify-center bg-white">
            {/* Success Message */}
            {showSuccess && (
                <p
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="fixed top-4 right-4 text-green-600 font-lcd bg-green-50 px-4 py-2 rounded border border-green-200"
                >
                    &gt; message sent
                </p>
            )}

            {/* Hero Section */}
            <header className="text-center max-w-lg mb-18">
                <h1 className="text-5xl font-lcd text-blue-600 mb-4 uppercase">
                    LCD Marquee
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                    Type a message, hit send, and watch it scroll across the
                    screen below. Everyone sees the same thing, live.
                </p>
            </header>

            {/* Form Section */}
            <fetcher.Form
                method="post"
                aria-busy={isSubmitting}
                className="max-w-md w-full mb-18"
            >
                <fieldset
                    disabled={isSubmitting}
                    className="m-0 flex flex-col gap-4 border-0 p-0"
                >
                    <div className="flex flex-col">
                        <label htmlFor="message" className="text-gray-800 mb-1">
                            Message
                        </label>
                        <input
                            type="text"
                            id="message"
                            name="message"
                            className="w-full border border-gray-300 bg-white text-black font-lcd px-4 py-2 rounded focus:border-blue-500 focus:outline-none"
                            required
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="twitter" className="text-gray-800 mb-1">
                            Twitter
                        </label>
                        <div className="flex border border-gray-300 rounded focus-within:border-blue-500">
                            <span className="bg-gray-100 text-black font-lcd px-4 py-2 border-r border-gray-300">
                                @
                            </span>
                            <input
                                type="text"
                                id="twitter"
                                name="twitter"
                                className="w-full bg-white text-black font-lcd pl-2 pr-4 py-2 rounded-r focus:outline-none"
                                required
                                value={twitter}
                                onChange={e => setTwitter(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isDisabled}
                        className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-950 disabled:cursor-not-allowed disabled:bg-blue-600/50"
                    >
                        {isSubmitting ? "Sending..." : "Send"}
                    </button>
                </fieldset>
            </fetcher.Form>

            {/* LCD Callout */}
            <div className="text-center mb-1">
                <p className="text-gray-500 italic">
                    This is a real LCD on my desk.
                    <br />
                    I&apos;ll see your message too.
                </p>
                <p className="text-gray-500 text-2xl animate-subtle-bounce">
                    ⇣
                </p>
            </div>

            {/* LCD Screen */}
            <LCD
                messages={messages}
                onMessageComplete={handleMessageComplete}
            />
        </main>
    )
}

export default Home
export {action, meta}
