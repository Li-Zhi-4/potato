import { API_BASE, handle, authFetch } from "../lib/api"


export type Part = {
    part_id: string
    part_no: string
    description: string | null
    is_assembly: 'part' | 'assembly'

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}

// GET /parts
export async function listParts(token: string): Promise<Part[]> {
    const res = await authFetch(`${API_BASE}/parts`, token)
    return handle<Part[]>(res)
}

// GET /parts/:id
export async function getPart(id: string, token: string): Promise<Part> {
    const res = await authFetch(`${API_BASE}/parts/${id}`, token)
    return handle<Part>(res)
}

// GET /parts?part_no=:part_no
export async function getPartByPartNo(part_no: string, token: string): Promise<Part> {
    const res = await authFetch(`${API_BASE}/parts?part_no=${part_no}`, token)
    return handle<Part>(res)
}


export type CreatePartInput = {
    part_no: string
    description: string | null
    is_assembly: 'part' | 'assembly'

    created_by: string
    updated_by: string | null
}

// POST /parts
export async function createPart(input: CreatePartInput, token: string): Promise<Part> {
    const res = await authFetch(`${API_BASE}/parts`, token, {
        method: 'POST',
        body: JSON.stringify(input)
    })
    return handle<Part>(res)
}


export type UpdatePartInput = {
    part_no?: string | null
    description?: string | null
    is_assembly?: 'part' | 'assembly'

    updated_by: string
}

// PUT /parts/:id
export async function updatePart(id: string, input: UpdatePartInput, token: string): Promise<Part> {
    const res = await authFetch(`${API_BASE}/parts/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(input)
    })
    return handle<Part>(res)
}

// DELETE /parts/:id
export async function deletePart(id: string, token: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/parts/${id}`, token, { method: 'DELETE' })
    return handle<void>(res)
}

// -- tables --

export type PartsTable = {
    part_id: string
    part_no: string
    description: string | null
    is_assembly: 'part' | 'assembly'
    vendor_name: string | null
}

// GET /parts/parts-table
export async function getPartsTable(token: string): Promise<PartsTable[]> {
    const res = await authFetch(`${API_BASE}/parts/parts-table`, token)
    return handle<PartsTable[]>(res)
}


export type VendorTable = {
    vendor_part_id: string
    part_id: string
    vendor_id: string

    name: string
    vendor_name: string
    part_no: string
    description: string
    is_primary: boolean

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}

// GET /parts/vendors-table/:id
export async function getVendorsTable(id: string, token: string): Promise<VendorTable[]> {
    const res = await authFetch(`${API_BASE}/parts/vendors-table/${id}`, token)
    return handle<VendorTable[]>(res)
}


export type SubpartTable = {
    assembly_part_id: string
    subpart_id: string
    subpart_part_no: string
    subpart_description: string
    quantity: number
    uom: string
}

// GET /parts/subparts-table/:id
export async function getSubpartsTable(id: string, token: string): Promise<SubpartTable[]> {
    const res = await authFetch(`${API_BASE}/parts/subparts-table/${id}`, token)
    return handle<SubpartTable[]>(res)
}