"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

type AccentColors = {
  light: string
  dark: string
}

const defaultAccentColors: AccentColors = {
  light: "#1E3A8A", // Default blue
  dark: "#2cff05", // Default green
}

const availableColors = ["#FF5C00", "#341539", "#4c3228", "#00F0FF", "#E42278"]

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  accentColors: AccentColors
  setAccentColor: (color: string) => void
  availableColors: string[]
  defaultColors: AccentColors
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [accentColors, setAccentColors] = useState<AccentColors>(defaultAccentColors)

  useEffect(() => {
    const savedTheme = localStorage.getItem("timely-theme") as Theme
    const savedAccentColors = localStorage.getItem("timely-accent-colors")

    if (savedTheme) {
      setTheme(savedTheme)
    }

    if (savedAccentColors) {
      setAccentColors(JSON.parse(savedAccentColors))
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.setProperty("--accent-color", accentColors[theme])
  }, [theme, accentColors])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("timely-theme", newTheme)
  }

  const setAccentColor = (color: string) => {
    const newAccentColors = { ...accentColors, [theme]: color }
    setAccentColors(newAccentColors)
    localStorage.setItem("timely-accent-colors", JSON.stringify(newAccentColors))
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        accentColors,
        setAccentColor,
        availableColors: [...availableColors, defaultAccentColors[theme]],
        defaultColors: defaultAccentColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
