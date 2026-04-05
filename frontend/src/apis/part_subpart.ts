import { API_BASE, handle } from "../lib/api"

export type PartSubpart = {
    part_subpart_id: string
    part_id: string
    subpart_id: string
    quantity: number
    uom: string

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}


// GET /part_subparts
export async function listPartSubparts(): Promise<PartSubpart[]> {
    const res = await fetch(`${API_BASE}/part_subparts`)
    return handle<PartSubpart[]>(res)
}

// GET /part_subparts/:id
export async function getPartSubpart(id: string): Promise<PartSubpart> {
    const res = await fetch(`${API_BASE}/part_subparts/${id}`)
    return handle<PartSubpart>(res)
}


export type CreatePartSubpartInput = {
    part_id: string
    subpart_id: string
    quantity?: number
    uom?: string

    created_by: string
    updated_by?: string | null
}

// POST /part_subparts
export async function createPartSubpart(input: CreatePartSubpartInput): Promise<PartSubpart> {
    const res = await fetch(`${API_BASE}/part_subparts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<PartSubpart>(res)
}


export type UpdatePartSubpartInput = {
    part_id?: string
    subpart_id?: string
    quantity?: number
    uom?: string

    updated_by?: string | null
}

// PUT /part_subparts/:id
export async function updatePartSubpart(id: string, input: UpdatePartSubpartInput): Promise<PartSubpart> {
    const res = await fetch(`${API_BASE}/part_subparts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<PartSubpart>(res)
}


// DELETE /part_subparts/:id
export async function deletePartSubpart(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/part_subparts/${id}`, { method: 'DELETE' })
    return handle<void>(res)
}