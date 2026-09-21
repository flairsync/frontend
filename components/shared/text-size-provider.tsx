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

/**
 * Root font size per step, split by screen width.
 *
 * `html { font-size: var(--font-size-base) }`, and Tailwind sizes everything in rem, so
 * this value scales the whole UI — not just type.
 *
 * Phones get 16px: the browser/OS default that every design system treats as the body
 * baseline, and the threshold below which iOS Safari zooms the page when a form field is
 * focused. The previous 18px made every class one notch larger than its name suggests
 * (`text-lg` rendered at 20.25px), which is what left headings and menu names truncating
 * at 360px. Wider screens keep 18px, which is the deliberate house style.
 *
 * Each step still moves the same two notches on both, so "Large"/"Extra Large" remain a
 * real accessibility escape hatch on a phone rather than just restoring the old default.
 */
const ROOT_FONT_SIZES: Record<TextSize, { mobile: string; desktop: string }> = {
    default: { mobile: "16px", desktop: "18px" },
    large: { mobile: "18px", desktop: "20px" },
    xlarge: { mobile: "20px", desktop: "22px" },
}

// One below Tailwind's `sm` (640px), so this flips at exactly the same width as every
// `sm:` utility in the app. Keep the two in step if the breakpoint ever changes.
const MOBILE_QUERY = "(max-width: 639px)"

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
        const mediaQuery = window.matchMedia(MOBILE_QUERY)

        // Re-applied on breakpoint changes (rotating a tablet, resizing a desktop window),
        // not just when the user picks a new size.
        const apply = () => {
            document.documentElement.style.setProperty(
                "--font-size-base",
                ROOT_FONT_SIZES[textSize][mediaQuery.matches ? "mobile" : "desktop"]
            )
        }

        apply()
        mediaQuery.addEventListener("change", apply)
        return () => mediaQuery.removeEventListener("change", apply)
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
