import {useEffect, useRef, useState} from "react"

import {useCharWidth} from "~/hooks/useCharWidth"

interface MarqueeProps {
    line1: string
    line2: string
    onComplete?: () => void
}

const Marquee = ({line1, line2, onComplete}: MarqueeProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const charWidth = useCharWidth()
    const [offset, setOffset] = useState(0)
    const [containerChars, setContainerChars] = useState(0)

    // Calculate container width in characters
    useEffect(() => {
        const container = containerRef.current

        if (container && charWidth > 0) {
            const containerWidth = container.parentElement?.clientWidth || 0
            const chars = Math.ceil(containerWidth / charWidth)
            setContainerChars(chars)
        }
    }, [charWidth])

    // Run the scrolling animation
    useEffect(() => {
        if (containerChars === 0) {
            return
        }

        const maxLength = Math.max(line1.length, line2.length)
        const totalSteps = containerChars + maxLength + 1

        const interval = setInterval(() => {
            setOffset(prev => {
                const next = prev + 1

                if (next >= totalSteps) {
                    clearInterval(interval)
                    onComplete?.()
                    return prev
                }

                return next
            })
        }, 200) // 200ms per character tick

        return () => clearInterval(interval)
    }, [line1, line2, containerChars, onComplete])

    const translateX = (containerChars + 1 - offset) * charWidth

    return (
        <>
            <div
                ref={containerRef}
                className="whitespace-nowrap text-white text-4xl leading-none font-lcd"
                style={{transform: `translateX(${translateX}px)`}}
            >
                {line1}
            </div>

            <div
                className="whitespace-nowrap text-white text-4xl leading-none font-lcd"
                style={{transform: `translateX(${translateX}px)`}}
            >
                {line2}
            </div>
        </>
    )
}

export {Marquee}
