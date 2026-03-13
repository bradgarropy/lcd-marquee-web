import {useEffect, useState} from "react"

import {useCharWidth} from "~/hooks/useCharWidth"
import type {Message} from "~/schemas/message"

interface MessageWithId extends Message {
    id: string
}

interface LCDProps {
    messages: MessageWithId[]
    onMessageComplete?: () => void
}

// Block character for empty LCD state
// U+00A9 (COPYRIGHT SIGN) renders as filled dot matrix block in LCD Dot Matrix font
const BLOCK_CHAR = "©"

// Fixed 16x2 LCD display like a real LCD module
const CHAR_COUNT = 16

const LCD = ({messages, onMessageComplete}: LCDProps) => {
    const charWidth = useCharWidth()
    const [offset, setOffset] = useState(0)
    const [isComplete, setIsComplete] = useState(false)

    // Always work with the first message in the queue
    const currentMessage = messages[0]
    // Use the message ID to detect when we move to next message
    const messageId = currentMessage?.id ?? null

    // Calculate total steps for the current message
    const maxLength = currentMessage
        ? Math.max(currentMessage.message.length, currentMessage.twitter.length)
        : 0
    // Total steps: scroll from off-screen right to fully off-screen left
    const totalSteps = CHAR_COUNT + maxLength + 2

    // Reset state when the current message changes
    useEffect(() => {
        setOffset(0)
        setIsComplete(false)
    }, [messageId])

    // Effect 1: Run the scrolling animation (only depends on messageId)
    useEffect(() => {
        if (!currentMessage || isComplete) {
            return
        }

        const interval = setInterval(() => {
            setOffset(prev => (prev < totalSteps ? prev + 1 : prev))
        }, 200)

        return () => {
            clearInterval(interval)
        }
    }, [messageId, currentMessage, isComplete, totalSteps])

    // Effect 2: Detect completion and notify parent (depends on offset)
    useEffect(() => {
        if (!currentMessage || isComplete) {
            return
        }

        if (offset >= totalSteps) {
            setIsComplete(true)
            onMessageComplete?.()
        }
    }, [offset, totalSteps, currentMessage, isComplete, onMessageComplete])

    const emptyLine = BLOCK_CHAR.repeat(CHAR_COUNT)
    const translateX = (CHAR_COUNT + 1 - offset) * charWidth

    return (
        <div className="bg-green-700 p-2 rounded grid grid-cols-[auto_auto_auto] grid-rows-[auto_auto_auto] gap-1 items-center justify-items-center text-4xl font-lcd shadow-xl/40">
            {/* Top-left corner */}
            <div className="w-5 h-5 rounded-full bg-white border-4 border-yellow-500"></div>
            {/* Top-center (empty) */}
            <div></div>
            {/* Top-right corner */}
            <div className="w-5 h-5 rounded-full bg-white border-4 border-yellow-500"></div>

            {/* Middle-left (empty) */}
            <div></div>
            {/* Center - LCD display */}
            <div className="border-12 border-black rounded p-2 bg-blue-600">
                {/* Background block characters */}
                <div className="relative text-blue-950 overflow-hidden">
                    <p>{emptyLine}</p>
                    <p>{emptyLine}</p>

                    {/* Scrolling message */}
                    {currentMessage && (
                        <div
                            className="absolute inset-0 whitespace-nowrap text-white"
                            style={{
                                transform: `translateX(${translateX}px)`,
                            }}
                        >
                            <p>{currentMessage.message}</p>
                            <p>{currentMessage.twitter}</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Middle-right (empty) */}
            <div></div>

            {/* Bottom-left corner */}
            <div className="w-5 h-5 rounded-full bg-white border-4 border-yellow-500"></div>
            {/* Bottom-center (empty) */}
            <div></div>
            {/* Bottom-right corner */}
            <div className="w-5 h-5 rounded-full bg-white border-4 border-yellow-500"></div>
        </div>
    )
}

export {LCD}
export type {MessageWithId}
