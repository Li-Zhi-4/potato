import { API_BASE, handle, authFetch } from "../lib/api"

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
export async function listAssemblyParts(token: string): Promise<AssemblyPart[]> {
    const res = await authFetch(`${API_BASE}/assembly_parts`, token)
    return handle<AssemblyPart[]>(res)
}

// GET /assembly_parts/:id
export async function getAssemblyPart(id: string, token: string): Promise<AssemblyPart> {
    const res = await authFetch(`${API_BASE}/assembly_parts/${id}`, token)
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
export async function createAssemblyPart(input: CreateAssemblyPartInput, token: string): Promise<AssemblyPart> {
    const res = await authFetch(`${API_BASE}/assembly_parts`, token, {
        method: 'POST',
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
export async function updateAssemblyPart(id: string, input: UpdateAssemblyPartInput, token: string): Promise<AssemblyPart> {
    const res = await authFetch(`${API_BASE}/assembly_parts/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(input)
    })
    return handle<AssemblyPart>(res)
}


// DELETE /assembly_parts/:id
export async function deleteAssemblyPart(id: string, token: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/assembly_parts/${id}`, token, { method: 'DELETE' })
    return handle<void>(res)
}