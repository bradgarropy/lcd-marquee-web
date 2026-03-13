import {useEffect, useState} from "react"

import {useCharWidth} from "~/hooks/useCharWidth"
import type {Message} from "~/schemas/message"

interface LCDProps {
    messages: Message[]
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

    // Always work with the first message in the queue
    const currentMessage = messages[0]

    // Reset offset when the current message changes
    useEffect(() => {
        setOffset(0)
    }, [currentMessage])

    // Run the scrolling animation
    useEffect(() => {
        if (!currentMessage) {
            return
        }

        const maxLength = Math.max(
            currentMessage.message.length,
            currentMessage.twitter.length,
        )
        // Total steps: scroll from off-screen right to fully off-screen left
        const totalSteps = CHAR_COUNT + maxLength + 2

        let timeoutId: ReturnType<typeof setTimeout> | null = null

        const interval = setInterval(() => {
            setOffset(prev => {
                const next = prev + 1

                if (next > totalSteps) {
                    clearInterval(interval)
                    // Defer the callback to avoid updating parent state during render
                    timeoutId = setTimeout(() => onMessageComplete?.(), 0)
                    return prev
                }

                return next
            })
        }, 200)

        return () => {
            clearInterval(interval)
            if (timeoutId !== null) {
                clearTimeout(timeoutId)
            }
        }
    }, [currentMessage, onMessageComplete])

    const emptyLine = BLOCK_CHAR.repeat(CHAR_COUNT)
    const translateX = (CHAR_COUNT + 1 - offset) * charWidth

    return (
        <div className="bg-green-700 p-2 rounded grid grid-cols-[auto_auto_auto] grid-rows-[auto_auto_auto] gap-1 items-center justify-items-center text-4xl font-lcd">
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
