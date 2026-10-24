import * as React from "react"

import { Input } from "@/components/ui/input"

// Native <input type="number"> drops a typed "," outright in most European
// browser locales (it isn't a valid character for that input type), so
// "4,50" is received as the keystrokes "4" then "50" — silently becoming
// "450". This renders as plain text with inputMode="decimal" (still brings
// up the numeric keyboard on mobile) and normalizes "," to "." as the user
// types, so both "4,50" and "4.50" parse correctly downstream.
export function normalizeDecimalInput(raw: string): string {
  const withDot = raw.replace(",", ".")
  // Keep one leading minus, digits, and at most one dot.
  let seenDot = false
  let result = ""
  for (let i = 0; i < withDot.length; i++) {
    const ch = withDot[i]
    if (ch === "-" && i === 0) {
      result += ch
    } else if (ch === "." && !seenDot) {
      seenDot = true
      result += ch
    } else if (ch >= "0" && ch <= "9") {
      result += ch
    }
  }
  return result
}

export type NumberInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "onChange" | "value"> & {
  value: string | number
  onChange: (value: string) => void
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, inputMode = "decimal", ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(normalizeDecimalInput(e.target.value))}
      />
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }
