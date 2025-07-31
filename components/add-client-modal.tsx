"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { addClient, updateClient, testConnection, type Client } from "@/lib/supabase"

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: () => void
  editingClient?: Client | null
}

export default function AddClientModal({ isOpen, onClose, onClientAdded, editingClient }: AddClientModalProps) {
  const [name, setName] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking")

  useEffect(() => {
    if (isOpen) {
      // Test connection when modal opens
      testConnection().then((success) => {
        setConnectionStatus(success ? "connected" : "failed")
      })
    }

    if (editingClient) {
      setName(editingClient.name)
      setHourlyRate(editingClient.hourly_rate.toString())
    } else {
      setName("")
      setHourlyRate("")
    }
    setError("")
  }, [editingClient, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Please enter a client name")
      return
    }

    if (!hourlyRate) {
      setError("Please enter an hourly rate")
      return
    }

    const rate = Number.parseFloat(hourlyRate)
    if (isNaN(rate) || rate <= 0) {
      setError("Please enter a valid hourly rate greater than 0")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("Submitting client:", { name: name.trim(), rate })

      if (editingClient) {
        await updateClient(editingClient.id, name.trim(), rate)
      } else {
        await addClient(name.trim(), rate)
      }

      setName("")
      setHourlyRate("")
      onClientAdded()
      onClose()
    } catch (error: any) {
      console.error("Error in handleSubmit:", error)
      setError(error.message || "Failed to save client. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-black rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black dark:text-white">
            {editingClient ? "Edit Client" : "Add Client"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 active:scale-95 transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Connection Status */}
        <div className="mb-4">
          <div
            className={`text-sm px-3 py-2 rounded-lg ${
              connectionStatus === "connected"
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : connectionStatus === "failed"
                  ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                  : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
            }`}
          >
            {connectionStatus === "checking" && "Checking database connection..."}
            {connectionStatus === "connected" && "✓ Database connected"}
            {connectionStatus === "failed" && "✗ Database connection failed"}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-black dark:text-white mb-1">
              Client Name *
            </label>
            <input
              type="text"
              id="clientName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
              placeholder="Enter client name"
              required
              disabled={isLoading || connectionStatus !== "connected"}
            />
          </div>

          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-black dark:text-white mb-1">
              Hourly Rate *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                id="hourlyRate"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
                placeholder="25.50"
                step="0.01"
                min="0.01"
                required
                disabled={isLoading || connectionStatus !== "connected"}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim() || !hourlyRate || connectionStatus !== "connected"}
            className="w-full bg-[var(--accent-color)] text-white py-2 px-4 rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : editingClient ? "Update Client" : "Save Client"}
          </button>
        </form>

        {connectionStatus === "failed" && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setConnectionStatus("checking")
                testConnection().then((success) => {
                  setConnectionStatus(success ? "connected" : "failed")
                })
              }}
              className="text-[var(--accent-color)] hover:underline text-sm"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
