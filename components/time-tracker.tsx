"use client"

import { useState, useEffect } from "react"
import { Play, Square } from "lucide-react"
import { getClients, clockIn, clockOut, getCurrentTimeEntry, type Client, type TimeEntry } from "@/lib/supabase"
import BiometricAuth from "./biometric-auth"

export default function TimeTracker() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showBiometric, setShowBiometric] = useState(false)
  const [biometricAction, setBiometricAction] = useState<"clock-in" | "clock-out">("clock-in")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentEntry) {
      interval = setInterval(() => {
        const clockInTime = new Date(currentEntry.clock_in).getTime()
        const now = new Date().getTime()
        setElapsedTime(Math.floor((now - clockInTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentEntry])

  const fetchData = async () => {
    try {
      const [clientsData, currentEntryData] = await Promise.all([getClients(), getCurrentTimeEntry()])
      setClients(clientsData)
      setCurrentEntry(currentEntryData)
      if (currentEntryData) {
        setSelectedClientId(currentEntryData.client_id)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockIn = () => {
    if (!selectedClientId) {
      alert("Please select a client")
      return
    }
    setBiometricAction("clock-in")
    setShowBiometric(true)
  }

  const handleClockOut = () => {
    setBiometricAction("clock-out")
    setShowBiometric(true)
  }

  const handleBiometricSuccess = async () => {
    setShowBiometric(false)
    try {
      if (biometricAction === "clock-in") {
        const entry = await clockIn(selectedClientId)
        setCurrentEntry({
          ...entry,
          clients: clients.find((c) => c.id === selectedClientId)!,
        })
      } else {
        const selectedClient = clients.find((c) => c.id === selectedClientId)
        if (currentEntry && selectedClient) {
          await clockOut(currentEntry.id, selectedClient.hourly_rate)
          setCurrentEntry(null)
          setElapsedTime(0)
        }
      }
    } catch (error) {
      console.error("Error with clock action:", error)
      alert("Failed to complete action")
    }
  }

  const handleBiometricError = (error: string) => {
    setShowBiometric(false)
    console.error("Biometric error:", error)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateEarnings = () => {
    if (!currentEntry || !currentEntry.clients) return 0
    const hours = elapsedTime / 3600
    return hours * currentEntry.clients.hourly_rate
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--accent-color)]">Loading...</div>
      </div>
    )
  }

  if (showBiometric) {
    return (
      <div className="p-4 pb-24">
        <h1 className="text-2xl font-bold text-[var(--accent-color)] mb-6 text-center">Time Tracker</h1>
        <div className="max-w-md mx-auto">
          <BiometricAuth onSuccess={handleBiometricSuccess} onError={handleBiometricError} action={biometricAction} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-[var(--accent-color)] mb-6 text-center">Time Tracker</h1>

      {currentEntry ? (
        <div className="max-w-md mx-auto space-y-6">
          <div className="timely-card p-6 text-center">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              {currentEntry.clients?.name || "Unknown Client"}
            </h2>
            <p className="text-black dark:text-white mb-4">{new Date().toLocaleDateString()}</p>

            <div className="text-4xl font-mono font-bold text-[var(--accent-color)] mb-4">
              {formatTime(elapsedTime)}
            </div>

            <div className="text-lg text-green-600 font-semibold mb-6">${calculateEarnings().toFixed(2)}</div>

            <button
              onClick={handleClockOut}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-red-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Square size={20} />
              Clock Out
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-6">
          <div className="timely-card p-6">
            <label htmlFor="client-select" className="block text-sm font-medium text-black dark:text-white mb-2">
              Select Client
            </label>
            <select
              id="client-select"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent mb-4 bg-white dark:bg-gray-800 text-black dark:text-white"
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - ${client.hourly_rate.toFixed(2)}/hr
                </option>
              ))}
            </select>

            <button
              onClick={handleClockIn}
              disabled={!selectedClientId}
              className="timely-button w-full py-3 px-6 rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Clock In
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
