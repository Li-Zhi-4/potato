import { API_BASE, handle, authFetch } from "../lib/api"


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
export async function listVendors(token: string): Promise<Vendor[]> {
    const res = await authFetch(`${API_BASE}/vendors`, token)
    return handle<Vendor[]>(res)
}

// GET /vendors/:id
export async function getVendor(id: string, token: string): Promise<Vendor> {
    const res = await authFetch(`${API_BASE}/vendors/${id}`, token)
    return handle<Vendor>(res)
}

export type CreateVendorInput = {
    vendor_name: string

    created_by: string
    updated_by: string | null
}

// POST /vendor
export async function createVendor(input: CreateVendorInput, token: string): Promise<Vendor> {
    const res = await authFetch(`${API_BASE}/vendors`, token, {
        method: 'POST',
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
export async function updateVendor(id: string, input: UpdateVendorInput, token: string): Promise<Vendor> {
    const res = await authFetch(`${API_BASE}/vendors/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(input)
    })
    return handle<Vendor>(res)
}


// DELETE /vendor/:id
export async function deleteVendor(id: string, token: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/vendors/${id}`, token, { method: 'DELETE' })
    return handle<void>(res)
}