"use client"

import { useState, useEffect } from "react"
import { Download, FileText } from "lucide-react"
import { getClients, getTimeEntries, type Client } from "@/lib/supabase"
import jsPDF from "jspdf"

export default function ExportTimesheet() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastDownload, setLastDownload] = useState<string>("")

  useEffect(() => {
    fetchClients()
    // Set default dates (current week)
    const today = new Date()
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))
    const friday = new Date(today.setDate(today.getDate() - today.getDay() + 5))

    setStartDate(monday.toISOString().split("T")[0])
    setEndDate(friday.toISOString().split("T")[0])
  }, [])

  const fetchClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateDateRange = (start: string, end: string): string[] => {
    const dates: string[] = []
    const startDate = new Date(start)
    const endDate = new Date(end)

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0])
    }

    return dates
  }

  const generateAndDownloadPDF = async () => {
    if (!selectedClientId || !startDate || !endDate) {
      alert("Please fill in all fields")
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date must be before end date")
      return
    }

    setIsGenerating(true)
    try {
      const timeEntries = await getTimeEntries(selectedClientId, startDate, endDate)
      const selectedClient = clients.find((c) => c.id === selectedClientId)

      if (!selectedClient) {
        alert("Selected client not found")
        return
      }

      // Generate all dates in the range
      const allDates = generateDateRange(startDate, endDate)

      // Create a map of time entries by date
      const entriesByDate = new Map()
      timeEntries.forEach((entry) => {
        const entryDate = new Date(entry.clock_in).toISOString().split("T")[0]
        if (!entriesByDate.has(entryDate)) {
          entriesByDate.set(entryDate, [])
        }
        entriesByDate.get(entryDate).push(entry)
      })

      // Create PDF document
      const doc = new jsPDF()

      // Header with TIMELY branding
      doc.setFontSize(24)
      doc.setTextColor(30, 58, 138) // Blue color
      doc.text("TIMELY", 20, 25)

      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text("Timesheet Report", 20, 35)

      // Client and period information
      doc.setFontSize(12)
      doc.text(`Client: ${selectedClient.name}`, 20, 50)
      doc.text(
        `Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
        20,
        60,
      )
      doc.text(`Hourly Rate: $${selectedClient.hourly_rate.toFixed(2)}`, 20, 70)

      // Table headers
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")

      // Header background
      doc.setFillColor(240, 240, 240)
      doc.rect(20, 80, 170, 8, "F")

      doc.text("Date", 22, 86)
      doc.text("Clock In", 55, 86)
      doc.text("Clock Out", 85, 86)
      doc.text("Hours", 120, 86)
      doc.text("Earnings", 150, 86)

      let yPosition = 95
      let totalHours = 0
      let totalEarnings = 0

      doc.setFont("helvetica", "normal")

      // Process each date in the range
      allDates.forEach((date, index) => {
        const dateEntries = entriesByDate.get(date) || []

        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(20, yPosition - 4, 170, 8, "F")
        }

        const formattedDate = new Date(date).toLocaleDateString()

        if (dateEntries.length > 0) {
          // If there are entries for this date, sum them up
          let dayHours = 0
          let dayEarnings = 0
          let clockInTime = ""
          let clockOutTime = ""

          // Find the earliest clock-in and latest clock-out for the day
          let earliestClockIn = null
          let latestClockOut = null

          dateEntries.forEach((entry) => {
            if (entry.clock_out && entry.hours_worked && entry.earnings) {
              dayHours += entry.hours_worked
              dayEarnings += entry.earnings

              const entryClockIn = new Date(entry.clock_in)
              const entryClockOut = new Date(entry.clock_out)

              if (!earliestClockIn || entryClockIn < earliestClockIn) {
                earliestClockIn = entryClockIn
              }

              if (!latestClockOut || entryClockOut > latestClockOut) {
                latestClockOut = entryClockOut
              }
            }
          })

          clockInTime = earliestClockIn
            ? earliestClockIn.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--"

          clockOutTime = latestClockOut
            ? latestClockOut.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--"

          doc.setTextColor(0, 0, 0)
          doc.text(formattedDate, 22, yPosition)
          doc.text(clockInTime, 55, yPosition)
          doc.text(clockOutTime, 85, yPosition)
          doc.text(dayHours.toFixed(2), 120, yPosition)
          doc.text(`$${dayEarnings.toFixed(2)}`, 150, yPosition)

          totalHours += dayHours
          totalEarnings += dayEarnings
        } else {
          // No entries for this date - show empty row
          doc.setTextColor(128, 128, 128) // Gray text for empty days
          doc.text(formattedDate, 22, yPosition)
          doc.text("--:--", 55, yPosition)
          doc.text("--:--", 85, yPosition)
          doc.text("0.00", 120, yPosition)
          doc.text("$0.00", 150, yPosition)
        }

        yPosition += 10

        // Add new page if needed
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 30

          // Re-add headers on new page
          doc.setFont("helvetica", "bold")
          doc.setFillColor(240, 240, 240)
          doc.rect(20, yPosition - 10, 170, 8, "F")
          doc.setTextColor(0, 0, 0)
          doc.text("Date", 22, yPosition - 4)
          doc.text("Clock In", 55, yPosition - 4)
          doc.text("Clock Out", 85, yPosition - 4)
          doc.text("Hours", 120, yPosition - 4)
          doc.text("Earnings", 150, yPosition - 4)
          doc.setFont("helvetica", "normal")
          yPosition += 5
        }
      })

      // Add totals section
      yPosition += 5
      doc.setFillColor(30, 58, 138)
      doc.rect(20, yPosition - 4, 170, 12, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("TOTALS:", 22, yPosition + 4)
      doc.text(`${totalHours.toFixed(2)} hours`, 120, yPosition + 4)
      doc.text(`$${totalEarnings.toFixed(2)}`, 150, yPosition + 4)

      // Add footer
      yPosition += 20
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(128, 128, 128)
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, yPosition)
      doc.text("Powered by TIMELY Time Tracking", 20, yPosition + 8)

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10)
      const clientName = selectedClient.name.replace(/[^a-zA-Z0-9]/g, "_")
      const filename = `TIMELY_${clientName}_${startDate}_to_${endDate}.pdf`

      // Save the PDF directly
      doc.save(filename)

      // Update last download info
      setLastDownload(`${filename} - ${new Date().toLocaleTimeString()}`)

      // Show success notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("TIMELY - PDF Generated", {
          body: `Timesheet for ${selectedClient.name} (${allDates.length} days) has been downloaded`,
          icon: "/icon-192.png",
        })
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please check your data and try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--accent-color)]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-[var(--accent-color)] mb-6 text-center">Export Timesheet</h1>

      <div className="max-w-md mx-auto space-y-6">
        <div className="timely-card p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="client-select" className="block text-sm font-medium text-black dark:text-white mb-2">
                Select Client
              </label>
              <select
                id="client-select"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
              >
                <option value="">Choose a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-black dark:text-white mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-black dark:text-white mb-2">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>

            <button
              onClick={generateAndDownloadPDF}
              disabled={!selectedClientId || !startDate || !endDate || isGenerating}
              className="timely-button w-full py-3 px-6 rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download PDF
                </>
              )}
            </button>

            {lastDownload && (
              <div className="text-center text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                ✓ Last download: {lastDownload}
              </div>
            )}
          </div>
        </div>

        {/* Instructions Card */}
        <div className="timely-card p-4">
          <div className="flex items-start gap-3">
            <FileText size={20} className="text-[var(--accent-color)] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-black dark:text-white mb-1">PDF Export Features:</p>
              <ul className="space-y-1 text-xs">
                <li>• Shows ALL days in date range</li>
                <li>• Empty days display as "--:--" with $0.00</li>
                <li>• Combines multiple entries per day</li>
                <li>• Professional formatting with totals</li>
                <li>• Works offline once data is loaded</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
