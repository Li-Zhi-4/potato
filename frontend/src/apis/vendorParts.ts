import { API_BASE, handle } from "../lib/api"

export type VendorPart = {
    part_vendor_id: string
    part_id: string
    vendor_id: string
    name: string | null
    part_no: string | null
    description: string | null
    is_primary: 0 | 1

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}


// GET /vendor_parts
export async function listVendorParts(): Promise<VendorPart[]> {
    const res = await fetch(`${API_BASE}/vendor_parts`)
    return handle<VendorPart[]>(res)
}

// GET /vendor_parts/:id
export async function getVendorPart(id: string): Promise<VendorPart> {
    const res = await fetch(`${API_BASE}/vendor_parts/${id}`)
    return handle<VendorPart>(res)
}


export type CreateVendorPartInput = {
    part_id: string
    vendor_id: string
    name?: string | null
    part_no?: string | null
    description?: string | null
    is_primary?: boolean

    created_by: string
    updated_by?: string | null
}

// POST /vendor_parts
export async function createVendorPart(input: CreateVendorPartInput): Promise<VendorPart> {
    const res = await fetch(`${API_BASE}/vendor_parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<VendorPart>(res)
}


export type UpdateVendorPartInput = {
    part_id?: string
    vendor_id?: string
    name?: string | null
    part_no?: string | null
    description?: string | null
    is_primary?: boolean

    updated_by?: string | null
}

// PUT /vendor_parts/:id
export async function updateVendorPart(id: string, input: UpdateVendorPartInput): Promise<VendorPart> {
    const res = await fetch(`${API_BASE}/vendor_parts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<VendorPart>(res)
}


// DELETE /vendor_parts/:id
export async function deleteVendorPart(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/vendor_parts/${id}`, { method: 'DELETE' })
    return handle<void>(res)
}