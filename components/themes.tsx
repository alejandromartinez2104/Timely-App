"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

export default function Themes() {
  const { theme, toggleTheme, accentColors, setAccentColor, availableColors, defaultColors } = useTheme()

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-[var(--accent-color)] mb-6 text-center">Themes</h1>

      <div className="max-w-md mx-auto space-y-6">
        {/* Theme Toggle */}
        <div className="timely-card p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Theme Mode</h2>
          <button
            onClick={toggleTheme}
            className="timely-button w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all duration-200"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            Switch to {theme === "light" ? "Dark" : "Light"} Mode
          </button>
        </div>

        {/* Accent Color Selection */}
        <div className="timely-card p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Accent Color ({theme === "light" ? "Light" : "Dark"} Mode)
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                className={`w-full h-12 rounded-lg border-2 transition-all duration-200 active:scale-95 ${
                  accentColors[theme] === color
                    ? "border-gray-400 shadow-lg scale-105"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
                style={{ backgroundColor: color }}
              >
                {accentColors[theme] === color && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">Current: {accentColors[theme]}</p>
        </div>

        {/* Color Preview */}
        <div className="timely-card p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Preview</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: accentColors[theme] }}></div>
              <span className="text-black dark:text-white">Accent Color</span>
            </div>
            <button className="timely-button w-full py-2 px-4 rounded-lg" disabled>
              Sample Button
            </button>
            <div className="text-[var(--accent-color)] font-semibold">Sample Accent Text</div>
          </div>
        </div>
      </div>
    </div>
  )
}
