import { createContext, useContext, useEffect, useState } from "react"

export type TextSize = "default" | "large" | "xlarge"

type TextSizeProviderProps = {
    children: React.ReactNode
    defaultTextSize?: TextSize
    storageKey?: string
}

type TextSizeProviderState = {
    textSize: TextSize
    setTextSize: (size: TextSize) => void
}

const initialState: TextSizeProviderState = {
    textSize: "default",
    setTextSize: () => null,
}

export const textSizePixelValues: Record<TextSize, string> = {
    default: "18px",
    large: "20px",
    xlarge: "22px",
}

const TextSizeProviderContext = createContext<TextSizeProviderState>(initialState)

export default function TextSizeProvider({
    children,
    defaultTextSize = "default",
    storageKey = "vite-ui-text-size",
    ...props
}: TextSizeProviderProps) {
    const [textSize, setTextSize] = useState<TextSize>(
        () => (localStorage.getItem(storageKey) as TextSize) || defaultTextSize
    )

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--font-size-base",
            textSizePixelValues[textSize]
        )
    }, [textSize])

    const value = {
        textSize,
        setTextSize: (textSize: TextSize) => {
            localStorage.setItem(storageKey, textSize)
            setTextSize(textSize)
        },
    }

    return (
        <TextSizeProviderContext.Provider {...props} value={value}>
            {children}
        </TextSizeProviderContext.Provider>
    )
}

export const useTextSize = () => {
    const context = useContext(TextSizeProviderContext)

    if (context === undefined)
        throw new Error("useTextSize must be used within a TextSizeProvider")

    return context
}
