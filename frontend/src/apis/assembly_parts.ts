import { API_BASE, handle } from "../lib/api"

export type AssemblyPart = {
    assembly_part_id: string
    part_id: string
    subpart_id: string
    quantity: number
    uom: string

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}


// GET /assembly_parts
export async function listAssemblyParts(): Promise<AssemblyPart[]> {
    const res = await fetch(`${API_BASE}/assembly_parts`)
    return handle<AssemblyPart[]>(res)
}

// GET /assembly_parts/:id
export async function getAssemblyPart(id: string): Promise<AssemblyPart> {
    const res = await fetch(`${API_BASE}/assembly_parts/${id}`)
    return handle<AssemblyPart>(res)
}


export type CreateAssemblyPartInput = {
    part_id: string
    subpart_id: string
    quantity?: number
    uom?: string

    created_by: string
    updated_by?: string | null
}

// POST /assembly_parts
export async function createAssemblyPart(input: CreateAssemblyPartInput): Promise<AssemblyPart> {
    const res = await fetch(`${API_BASE}/assembly_parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<AssemblyPart>(res)
}


export type UpdateAssemblyPartInput = {
    part_id?: string
    subpart_id?: string
    quantity?: number
    uom?: string

    updated_by?: string | null
}

// PUT /assembly_parts/:id
export async function updateAssemblyPart(id: string, input: UpdateAssemblyPartInput): Promise<AssemblyPart> {
    const res = await fetch(`${API_BASE}/assembly_parts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<AssemblyPart>(res)
}


// DELETE /assembly_parts/:id
export async function deleteAssemblyPart(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/assembly_parts/${id}`, { method: 'DELETE' })
    return handle<void>(res)
}