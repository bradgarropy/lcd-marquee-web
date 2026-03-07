import {useEffect, useState} from "react"
import {Form, useActionData} from "react-router"

import {messageSchema, publish} from "~/mqtt.server"

import type {Route} from "./+types/home"

const action = async ({request}: Route.ActionArgs) => {
    const formData = await request.formData()
    const message = messageSchema.parse(Object.fromEntries(formData))

    await publish(message)

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
    const [message, setMessage] = useState("")
    const [twitter, setTwitter] = useState("")

    useEffect(() => {
        if (actionData?.success) {
            setMessage("")
            setTwitter("")
        }
    }, [actionData])

    const isDisabled = !message || !twitter

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Form method="post" className="flex flex-col gap-4">
                {actionData?.success && (
                    <p className="text-green-600">Message sent!</p>
                )}

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
                    Send
                </button>
            </Form>
        </div>
    )
}

export default Home
export {action, meta}
