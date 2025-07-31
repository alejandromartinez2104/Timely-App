import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with explicit settings to bypass auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,
    },
  },
})

export interface Client {
  id: string
  name: string
  hourly_rate: number
  created_at: string
}

export interface TimeEntry {
  id: string
  client_id: string
  clock_in: string
  clock_out: string | null
  hours_worked: number | null
  earnings: number | null
  created_at: string
  clients?: {
    name: string
    hourly_rate: number
  }
}

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("clients").select("count").limit(1)
    if (error) {
      console.error("Connection test failed:", error)
      return false
    }
    console.log("Supabase connection successful")
    return true
  } catch (error) {
    console.error("Connection test error:", error)
    return false
  }
}

// Client management functions
export async function addClient(name: string, hourlyRate: number): Promise<Client> {
  try {
    console.log("Adding client:", { name, hourlyRate })

    // Test connection first
    const connectionOk = await testConnection()
    if (!connectionOk) {
      throw new Error("Database connection failed")
    }

    const clientData = {
      name: name.trim(),
      hourly_rate: Number(hourlyRate),
    }

    console.log("Inserting client data:", clientData)

    const { data, error } = await supabase.from("clients").insert([clientData]).select().single()

    if (error) {
      console.error("Supabase insert error:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error("No data returned from insert")
    }

    console.log("Client added successfully:", data)
    return data
  } catch (error) {
    console.error("Error in addClient:", error)
    throw error
  }
}

export async function updateClient(id: string, name: string, hourlyRate: number): Promise<Client> {
  try {
    console.log("Updating client:", { id, name, hourlyRate })

    const { data, error } = await supabase
      .from("clients")
      .update({
        name: name.trim(),
        hourly_rate: Number(hourlyRate),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase update error:", error)
      throw new Error(`Failed to update client: ${error.message}`)
    }

    console.log("Client updated successfully:", data)
    return data
  } catch (error) {
    console.error("Error in updateClient:", error)
    throw error
  }
}

export async function deleteClient(id: string): Promise<void> {
  try {
    console.log("Deleting client:", id)

    // First delete all time entries for this client
    const { error: timeEntriesError } = await supabase.from("time_entries").delete().eq("client_id", id)

    if (timeEntriesError) {
      console.error("Error deleting time entries:", timeEntriesError)
      throw new Error(`Failed to delete time entries: ${timeEntriesError.message}`)
    }

    // Then delete the client
    const { error } = await supabase.from("clients").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      throw new Error(`Failed to delete client: ${error.message}`)
    }

    console.log("Client deleted successfully")
  } catch (error) {
    console.error("Error in deleteClient:", error)
    throw error
  }
}

export async function getClients(): Promise<Client[]> {
  try {
    console.log("Fetching clients...")

    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase select error:", error)
      throw new Error(`Failed to fetch clients: ${error.message}`)
    }

    console.log("Clients fetched successfully:", data?.length || 0, "clients")
    return data || []
  } catch (error) {
    console.error("Error in getClients:", error)
    return []
  }
}

// Time tracking functions
export async function clockIn(clientId: string): Promise<TimeEntry> {
  try {
    console.log("Clocking in for client:", clientId)

    const { data, error } = await supabase
      .from("time_entries")
      .insert([
        {
          client_id: clientId,
          clock_in: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase clock in error:", error)
      throw new Error(`Failed to clock in: ${error.message}`)
    }

    console.log("Clocked in successfully:", data)
    return data
  } catch (error) {
    console.error("Error in clockIn:", error)
    throw error
  }
}

export async function clockOut(timeEntryId: string, hourlyRate: number): Promise<TimeEntry> {
  try {
    console.log("Clocking out:", { timeEntryId, hourlyRate })

    const clockOutTime = new Date()

    // Get the time entry to calculate hours worked
    const { data: timeEntry, error: fetchError } = await supabase
      .from("time_entries")
      .select("clock_in")
      .eq("id", timeEntryId)
      .single()

    if (fetchError) {
      console.error("Fetch error:", fetchError)
      throw new Error(`Failed to fetch time entry: ${fetchError.message}`)
    }

    const clockInTime = new Date(timeEntry.clock_in)
    const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
    const earnings = hoursWorked * hourlyRate

    const { data, error } = await supabase
      .from("time_entries")
      .update({
        clock_out: clockOutTime.toISOString(),
        hours_worked: Math.round(hoursWorked * 100) / 100,
        earnings: Math.round(earnings * 100) / 100,
      })
      .eq("id", timeEntryId)
      .select()
      .single()

    if (error) {
      console.error("Supabase clock out error:", error)
      throw new Error(`Failed to clock out: ${error.message}`)
    }

    console.log("Clocked out successfully:", data)
    return data
  } catch (error) {
    console.error("Error in clockOut:", error)
    throw error
  }
}

export async function getTimeEntries(clientId: string, startDate: string, endDate: string): Promise<TimeEntry[]> {
  try {
    console.log("Fetching time entries:", { clientId, startDate, endDate })

    const { data, error } = await supabase
      .from("time_entries")
      .select(`
        *,
        clients (
          name,
          hourly_rate
        )
      `)
      .eq("client_id", clientId)
      .gte("clock_in", startDate)
      .lte("clock_in", endDate)
      .order("clock_in", { ascending: true })

    if (error) {
      console.error("Supabase time entries error:", error)
      throw new Error(`Failed to fetch time entries: ${error.message}`)
    }

    console.log("Time entries fetched successfully:", data?.length || 0, "entries")
    return data || []
  } catch (error) {
    console.error("Error in getTimeEntries:", error)
    return []
  }
}

export async function getCurrentTimeEntry(): Promise<TimeEntry | null> {
  try {
    console.log("Fetching current time entry...")

    const { data, error } = await supabase
      .from("time_entries")
      .select(`
        *,
        clients (
          name,
          hourly_rate
        )
      `)
      .is("clock_out", null)
      .order("clock_in", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Supabase current entry error:", error)
      throw new Error(`Failed to fetch current time entry: ${error.message}`)
    }

    const result = data?.[0] || null
    console.log("Current time entry:", result ? "found" : "none")
    return result
  } catch (error) {
    console.error("Error in getCurrentTimeEntry:", error)
    return null
  }
}
