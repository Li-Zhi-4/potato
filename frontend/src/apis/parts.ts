import { API_BASE, handle } from "../lib/api"


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
export async function listParts(): Promise<Part[]> {
    const res = await fetch(`${API_BASE}/parts`)
    return handle<Part[]>(res)
}

// GET /parts/:id
export async function getPart(id: string): Promise<Part> {
    const res = await fetch(`${API_BASE}/parts/${id}`)
    return handle<Part>(res)
}

// GET /parts/:id
export async function getPartByPartNo(part_no: string): Promise<Part> {
    const res = await fetch(`${API_BASE}/parts?part_no=${part_no}`)
    return handle<Part>(res)
}


export type CreatePartInput = {
    part_no: string
    description: string | null
    is_assembly: boolean

    created_by: string
    updated_by: string | null
}

// POST /parts
export async function createPart(input: CreatePartInput): Promise<Part> {
    const res = await fetch(`${API_BASE}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<Part>(res)
}


export type UpdatePartInput = {
    part_no?: string | null
    description?: string | null
    is_assembly?: boolean | null

    updated_by: string
}

// PUT /parts/:id
export async function updatePart(id: string, input: UpdatePartInput): Promise<Part> {
    const res = await fetch(`${API_BASE}/parts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<Part>(res)
}

// DELETE /parts/:id
export async function deletePart(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/parts/${id}`, { method: 'DELETE' })
    return handle<void>(res)
}

// -- tables --

export type PartsTable = {
    // part_id: string
    part_no: string
    description: string | null
    is_assembly: 'part' | 'assembly'
    vendor_name: string | null

    // created_at: string
    // updated_at: string
    // created_by: string
    // updated_by: string | null
}

// GET /parts/table
export async function getPartsTable(): Promise<PartsTable[]> {
    const res = await fetch(`${API_BASE}/parts/parts-table`)
    return handle<PartsTable[]>(res)
}



export type VendorTable = {
    part_vendor_id: string
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

// GET /parts/vendor-table/:id
export async function getVendorsTable(id: string): Promise<VendorTable[]> {
    const res = await fetch(`${API_BASE}/parts/vendors-table/${id}`)
    return handle<VendorTable[]>(res)
}



export type SubpartTable = {
    subpart_id: string
    subpart_part_no: string
    subpart_description: string
    quantity: number
    uom: string
}

// GET /parts/subparts-table/:id
export async function getSubpartsTable(id: string): Promise<SubpartTable[]> {
    const res = await fetch(`${API_BASE}/parts/subparts-table/${id}`)
    return handle<SubpartTable[]>(res)
}