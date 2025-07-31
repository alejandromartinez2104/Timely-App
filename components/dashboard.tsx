"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { getClients, type Client } from "@/lib/supabase"
import AddClientModal from "./add-client-modal"
import DeleteClientModal from "./delete-client-modal"

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [addButtonClicked, setAddButtonClicked] = useState(false)
  const [error, setError] = useState("")

  const fetchClients = async () => {
    try {
      setError("")
      const data = await getClients()
      setClients(data)
    } catch (error: any) {
      console.error("Error fetching clients:", error)
      setError("Failed to load clients. Please refresh the page.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleClientAdded = () => {
    fetchClients()
    setEditingClient(null)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDeleteClient = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingClient(client)
    setIsDeleteModalOpen(true)
  }

  const handleClientDeleted = () => {
    fetchClients()
    setDeletingClient(null)
  }

  const handleAddButtonClick = () => {
    setAddButtonClicked(true)
    setIsModalOpen(true)
    setTimeout(() => setAddButtonClicked(false), 150)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--accent-color)]">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 pb-24">
        <h1 className="text-2xl font-bold text-[var(--accent-color)] mb-6 text-center">Dashboard</h1>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={fetchClients}
            className="timely-button px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-[var(--accent-color)] mb-6 text-center">Dashboard</h1>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <button
            onClick={handleAddButtonClick}
            className={`w-20 h-20 border-2 border-[var(--accent-color)] rounded-lg flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 mb-4 ${
              addButtonClicked ? "bg-[var(--accent-color)]" : "bg-transparent"
            }`}
          >
            <Plus size={40} className={addButtonClicked ? "text-white" : "text-[var(--accent-color)]"} />
          </button>
          <p className="text-black dark:text-white text-lg text-center">No clients in your dashboard at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleAddButtonClick}
              className={`w-12 h-12 border-2 border-[var(--accent-color)] rounded-lg flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 ${
                addButtonClicked ? "bg-[var(--accent-color)]" : "bg-transparent"
              }`}
            >
              <Plus size={24} className={addButtonClicked ? "text-white" : "text-[var(--accent-color)]"} />
            </button>
          </div>

          <div className="grid gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleEditClient(client)}
                className="timely-card timely-card-interactive p-4 cursor-pointer relative"
              >
                <button
                  onClick={(e) => handleDeleteClient(client, e)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <Trash2 size={18} />
                </button>
                <div className="pr-8">
                  <h3 className="text-lg font-semibold text-black dark:text-white">{client.name}</h3>
                  <p className="text-[var(--accent-color)] font-medium">${client.hourly_rate.toFixed(2)}/hour</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingClient(null)
        }}
        onClientAdded={handleClientAdded}
        editingClient={editingClient}
      />

      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingClient(null)
        }}
        onClientDeleted={handleClientDeleted}
        client={deletingClient}
      />
    </div>
  )
}
