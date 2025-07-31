"use client"

import { useState, useEffect } from "react"
import { Clock, FileText, Home, Palette } from "lucide-react"
import Dashboard from "@/components/dashboard"
import TimeTracker from "@/components/time-tracker"
import ExportTimesheet from "@/components/export-timesheet"
import Themes from "@/components/themes"
import ErrorBoundary from "@/components/error-boundary"
import { ThemeProvider } from "@/hooks/use-theme"

type Tab = "dashboard" | "tracker" | "export" | "themes"

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("tracker")
  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check URL parameters for tab
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get("tab") as Tab
    if (tabParam && ["dashboard", "tracker", "export", "themes"].includes(tabParam)) {
      setActiveTab(tabParam)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    // Update URL without reload
    const newUrl = `${window.location.pathname}?tab=${activeTab}`
    window.history.replaceState({}, "", newUrl)
  }, [activeTab])

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === "accepted") {
        setInstallPrompt(null)
      }
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "tracker":
        return <TimeTracker />
      case "export":
        return <ExportTimesheet />
      case "themes":
        return <Themes />
      default:
        return <TimeTracker />
    }
  }

  // Calculate indicator position - centered on each tab button
  const getIndicatorStyle = () => {
    const tabPositions = {
      dashboard: { left: "6.25%", width: "12.5%" }, // Centered in first 25%
      tracker: { left: "31.25%", width: "12.5%" }, // Centered in second 25%
      export: { left: "56.25%", width: "12.5%" }, // Centered in third 25%
      themes: { left: "81.25%", width: "12.5%" }, // Centered in fourth 25%
    }
    return tabPositions[activeTab]
  }

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-black pb-20">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm z-50">
          You're offline. Some features may be limited.
        </div>
      )}

      {/* Install prompt */}
      {installPrompt && (
        <div className="fixed top-4 left-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg z-40">
          <div className="flex items-center justify-between">
            <span className="text-sm">Install TIMELY for the best experience</span>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium"
              >
                Install
              </button>
              <button onClick={() => setInstallPrompt(null)} className="text-white/80 hover:text-white px-2">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {renderContent()}

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        {/* Centered Tab Indicator */}
        <div className="tab-indicator" style={getIndicatorStyle()} />

        <div className="flex justify-around">
          <button onClick={() => setActiveTab("dashboard")} className="nav-button" aria-label="Go to Dashboard">
            <Home
              size={24}
              fill={activeTab === "dashboard" ? "var(--accent-color)" : "none"}
              color={activeTab === "dashboard" ? "var(--accent-color)" : "currentColor"}
            />
            <span className="nav-button-text">Dashboard</span>
          </button>

          <button onClick={() => setActiveTab("tracker")} className="nav-button" aria-label="Go to Time Tracker">
            <Clock
              size={24}
              fill={activeTab === "tracker" ? "var(--accent-color)" : "none"}
              color={activeTab === "tracker" ? "var(--accent-color)" : "currentColor"}
            />
            <span className="nav-button-text">Time Tracker</span>
          </button>

          <button onClick={() => setActiveTab("export")} className="nav-button" aria-label="Go to Export Timesheet">
            <FileText
              size={24}
              fill={activeTab === "export" ? "var(--accent-color)" : "none"}
              color={activeTab === "export" ? "var(--accent-color)" : "currentColor"}
            />
            <span className="nav-button-text">Export</span>
          </button>

          <button onClick={() => setActiveTab("themes")} className="nav-button" aria-label="Go to Themes">
            <Palette
              size={24}
              fill={activeTab === "themes" ? "var(--accent-color)" : "none"}
              color={activeTab === "themes" ? "var(--accent-color)" : "currentColor"}
            />
            <span className="nav-button-text">Themes</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
