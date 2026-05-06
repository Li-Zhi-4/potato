import { API_BASE, handle } from "../lib/api"

export type Vendor = {
    vendor_id: string
    vendor_name: string

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null

    archived_at: string | null
}

// GET /vendors
export async function listVendors(): Promise<Vendor[]> {
    const res = await fetch(`${API_BASE}/vendors`)
    return handle<Vendor[]>(res)
}

// GET /vendors/:id
export async function getVendor(id: string): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors/${id}`)
    return handle<Vendor>(res)
}

export type CreateVendorInput = {
    vendor_name: string

    created_by: string
    updated_by: string | null
}

// POST /vendor
export async function createVendor(input: CreateVendorInput): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<Vendor>(res)
}


export type UpdateVendorInput = {
    vendor_name?: string

    updated_by?: string | null
    archived_at?: string | null
}

// PUT /vendor/:id
export async function updateVendor(id: string, input: UpdateVendorInput): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<Vendor>(res)
}


// DELETE /vendor/:id
export async function deleteVendor(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/vendors/${id}`, { method: 'DELETE' })
    return handle<void>(res)
}