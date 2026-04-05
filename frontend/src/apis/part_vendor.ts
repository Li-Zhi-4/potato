import { API_BASE, handle } from "../lib/api"

export type PartVendor = {
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


// GET /part_vendors
export async function listPartVendors(): Promise<PartVendor[]> {
    const res = await fetch(`${API_BASE}/part_vendors`)
    return handle<PartVendor[]>(res)
}

// GET /part_vendors/:id
export async function getPartVendor(id: string): Promise<PartVendor> {
    const res = await fetch(`${API_BASE}/part_vendors/${id}`)
    return handle<PartVendor>(res)
}


export type CreatePartVendorInput = {
    part_id: string
    vendor_id: string
    name?: string | null
    part_no?: string | null
    description?: string | null
    is_primary?: boolean

    created_by: string
    updated_by?: string | null
}

// POST /part_vendors
export async function createPartVendor(input: CreatePartVendorInput): Promise<PartVendor> {
    const res = await fetch(`${API_BASE}/part_vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<PartVendor>(res)
}


export type UpdatePartVendorInput = {
    part_id?: string
    vendor_id?: string
    name?: string | null
    part_no?: string | null
    description?: string | null
    is_primary?: boolean

    updated_by?: string | null
}

// PUT /part_vendors/:id
export async function updatePartVendor(id: string, input: UpdatePartVendorInput): Promise<PartVendor> {
    const res = await fetch(`${API_BASE}/part_vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<PartVendor>(res)
}


// DELETE /part_vendors/:id
export async function deletePartVendor(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/part_vendors/${id}`, { method: 'DELETE' })
    return handle<void>(res)
}