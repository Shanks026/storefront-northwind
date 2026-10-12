import { createContext, useCallback, useContext, useEffect, useState } from "react"

import { storage } from "@/api/client"
import { STORAGE_KEYS } from "@/lib/constants"

const ThemeContext = createContext(null)
const media = () => window.matchMedia("(prefers-color-scheme: dark)")

/** theme: "light" | "dark" | "system"; resolvedTheme is what's actually applied. */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => storage.get(STORAGE_KEYS.theme, "system"))
  const [systemDark, setSystemDark] = useState(() => media().matches)

  useEffect(() => {
    const mq = media()
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
    document.documentElement.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const setTheme = useCallback((next) => {
    storage.set(STORAGE_KEYS.theme, next)
    setThemeState(next)
  }, [])

  return <ThemeContext value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>")
  return ctx
}
