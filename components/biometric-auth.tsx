"use client"

import { useState } from "react"

interface BiometricAuthProps {
  onSuccess: () => void
  onError: (error: string) => void
  action: "clock-in" | "clock-out"
}

export default function BiometricAuth({ onSuccess, onError, action }: BiometricAuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const authenticate = async () => {
    setIsAuthenticating(true)

    try {
      // For demonstration purposes, we'll use a simple confirmation
      // In a real app, you'd implement proper WebAuthn registration and authentication
      const confirmed = window.confirm(`Confirm ${action}?`)
      if (confirmed) {
        onSuccess()
      } else {
        onError("Authentication cancelled")
      }
    } catch (error) {
      console.error("Biometric authentication error:", error)
      onError("Authentication failed")
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <button
      onClick={authenticate}
      disabled={isAuthenticating}
      className="timely-button w-full py-3 px-6 rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50"
    >
      {isAuthenticating ? "Authenticating..." : `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`}
    </button>
  )
}
