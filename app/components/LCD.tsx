import {useEffect, useRef, useState} from "react"

import {useCharWidth} from "~/hooks/useCharWidth"

interface LCDProps {
    children?: React.ReactNode
}

// Block character for empty LCD state
// U+00A9 (COPYRIGHT SIGN) renders as filled dot matrix block in LCD Dot Matrix font
const BLOCK_CHAR = "©"

const LCD = ({children}: LCDProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const charWidth = useCharWidth()
    const [charCount, setCharCount] = useState(40) // Default fallback

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

    const emptyLine = BLOCK_CHAR.repeat(charCount)

    return (
        <div
            ref={containerRef}
            className="w-full flex items-center justify-center text-4xl font-lcd"
        >
            {/* Wrapper for blocks + overlay - clips marquee overflow */}
            <div className="relative leading-none overflow-x-clip">
                {/* Background block characters - always visible */}
                <div className="text-blue-950 grid grid-rows-2 gap-1">
                    <div>{emptyLine}</div>
                    <div>{emptyLine}</div>
                </div>

                {/* Marquee content - positioned on top, aligned with blocks */}
                {children && (
                    <div className="absolute inset-0 grid grid-rows-2 gap-1">
                        {children}
                    </div>
                )}
            </div>
        </div>
    )
}

export {LCD}
