import {useEffect, useRef, useState} from "react"

import {useCharWidth} from "~/hooks/useCharWidth"
import type {Message} from "~/schemas/message"

interface LCDProps {
    messages: Message[]
    onMessageComplete?: () => void
}

// Block character for empty LCD state
// U+00A9 (COPYRIGHT SIGN) renders as filled dot matrix block in LCD Dot Matrix font
const BLOCK_CHAR = "©"

const LCD = ({messages, onMessageComplete}: LCDProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const charWidth = useCharWidth()
    const [charCount, setCharCount] = useState(40)
    const [offset, setOffset] = useState(0)

    // Always work with the first message in the queue
    const currentMessage = messages[0]

    // Calculate how many characters fit in the container
    useEffect(() => {
        const updateCharCount = () => {
            if (!containerRef.current || charWidth === 0) {
                return
            }

            const containerWidth = containerRef.current.clientWidth
            const wholeChars = Math.floor(containerWidth / charWidth)
            setCharCount(wholeChars)
        }

        updateCharCount()

        window.addEventListener("resize", updateCharCount)
        return () => window.removeEventListener("resize", updateCharCount)
    }, [charWidth])

    // Reset offset when the current message changes
    useEffect(() => {
        setOffset(0)
    }, [currentMessage])

    // Run the scrolling animation
    useEffect(() => {
        if (!currentMessage || charCount === 0) {
            return
        }

        const maxLength = Math.max(
            currentMessage.message.length,
            currentMessage.twitter.length,
        )
        // Total steps: scroll from off-screen right to fully off-screen left
        const totalSteps = charCount + maxLength + 2

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
    }, [currentMessage, charCount, onMessageComplete])

    const emptyLine = BLOCK_CHAR.repeat(charCount)
    const translateX = (charCount + 1 - offset) * charWidth

    return (
        <div
            ref={containerRef}
            className="w-full flex items-center justify-center text-4xl font-lcd"
        >
            <div className="relative leading-none overflow-x-clip">
                {/* Background block characters */}
                <div className="text-blue-950 grid grid-rows-2 gap-1">
                    <div>{emptyLine}</div>
                    <div>{emptyLine}</div>
                </div>

                {/* Scrolling message */}
                {currentMessage && (
                    <div className="absolute inset-0 grid grid-rows-2 gap-1">
                        <div
                            className="whitespace-nowrap text-white leading-none"
                            style={{transform: `translateX(${translateX}px)`}}
                        >
                            {currentMessage.message}
                        </div>
                        <div
                            className="whitespace-nowrap text-white leading-none"
                            style={{transform: `translateX(${translateX}px)`}}
                        >
                            {currentMessage.twitter}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export {LCD}
