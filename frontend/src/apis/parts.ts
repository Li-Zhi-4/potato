import { API_BASE, handle } from "../lib/api"


export type Part = {
    part_id: string
    part_no: string
    description: string | null
    is_assembly: 'part' | 'assembly'
    workflow_id: string | null

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


export type CreatePartInput = {
    part_no: string
    description: string | null
    is_assembly: boolean
    workflow_id: string | null

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
    workflow_id?: string | null

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


export type PartsTable = {
    part_id: string
    part_no: string
    description: string | null
    is_assembly: 'part' | 'assembly'
    workflow_id: string | null
    vendor_name: string | null

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}

// GET /parts/table
export async function getPartsTable(): Promise<PartsTable[]> {
    const res = await fetch(`${API_BASE}/parts/table`)
    return handle<PartsTable[]>(res)
}