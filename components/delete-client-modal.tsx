"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteClient, type Client } from "@/lib/supabase"

interface DeleteClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientDeleted: () => void
  client: Client | null
}

export default function DeleteClientModal({ isOpen, onClose, onClientDeleted, client }: DeleteClientModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!client) return

    setIsDeleting(true)
    try {
      await deleteClient(client.id)
      onClientDeleted()
      onClose()
    } catch (error) {
      console.error("Error deleting client:", error)
      alert("Failed to delete client")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !client) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-black rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
        <div className="flex items-center mb-4">
          <Trash2 className="text-red-500 mr-3" size={24} />
          <h2 className="text-xl font-bold text-black dark:text-white">Delete Client</h2>
        </div>

        <p className="text-black dark:text-white mb-6">
          Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}
