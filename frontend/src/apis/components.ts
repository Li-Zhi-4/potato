import { API_BASE, handle, authFetch } from "../lib/api"

export type Component = {
    component_id: string
    bom_id: string
    part_id: string
    part_vendor_id: string | null
    po_id: string | null
    quantity: number
    uom: string
    status: string | null

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}


// GET /components
export async function listComponents(token: string): Promise<Component[]> {
    const res = await authFetch(`${API_BASE}/components`, token)
    return handle<Component[]>(res)
}

// GET /components/:id
export async function getComponent(id: string, token: string): Promise<Component> {
    const res = await authFetch(`${API_BASE}/components/${id}`, token)
    return handle<Component>(res)
}


export type CreateComponentInput = {
    bom_id: string
    part_id: string
    po_id?: string | null
    quantity?: number
    uom?: string
    status?: string | null

    created_by: string
    updated_by?: string | null
}

// POST /components
export async function createComponent(input: CreateComponentInput, token: string): Promise<Component> {
    const res = await authFetch(`${API_BASE}/components`, token, {
        method: 'POST',
        body: JSON.stringify(input)
    })
    return handle<Component>(res)
}


export type UpdateComponentInput = {
    bom_id?: string
    part_id?: string
    part_vendor_id?: string | null
    po_id?: string | null
    quantity?: number
    uom?: string
    status?: string | null

    updated_by?: string | null
}

// PUT /components/:id
export async function updateComponent(id: string, input: UpdateComponentInput, token: string): Promise<Component> {
    const res = await authFetch(`${API_BASE}/components/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(input)
    })
    return handle<Component>(res)
}


// DELETE /components/:id
export async function deleteComponent(id: string, token: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/components/${id}`, token, { method: 'DELETE' })
    return handle<void>(res)
}