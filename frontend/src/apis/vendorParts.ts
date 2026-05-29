import { API_BASE, handle, authFetch } from "../lib/api"

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
export async function listVendorParts(token: string): Promise<VendorPart[]> {
    const res = await authFetch(`${API_BASE}/vendor_parts`, token)
    return handle<VendorPart[]>(res)
}

// GET /vendor_parts/:id
export async function getVendorPart(id: string, token: string): Promise<VendorPart> {
    const res = await authFetch(`${API_BASE}/vendor_parts/${id}`, token)
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
export async function createVendorPart(input: CreateVendorPartInput, token: string): Promise<VendorPart> {
    const res = await authFetch(`${API_BASE}/vendor_parts`, token, {
        method: 'POST',
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
export async function updateVendorPart(id: string, input: UpdateVendorPartInput, token: string): Promise<VendorPart> {
    const res = await authFetch(`${API_BASE}/vendor_parts/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(input)
    })
    return handle<VendorPart>(res)
}


// DELETE /vendor_parts/:id
export async function deleteVendorPart(id: string, token: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/vendor_parts/${id}`, token, { method: 'DELETE' })
    return handle<void>(res)
}