import { API_BASE, handle } from "../lib/api"

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
export async function listComponents(): Promise<Component[]> {
    const res = await fetch(`${API_BASE}/components`)
    return handle<Component[]>(res)
}

// GET /components/:id
export async function getComponent(id: string): Promise<Component> {
    const res = await fetch(`${API_BASE}/components/${id}`)
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
export async function createComponent(input: CreateComponentInput): Promise<Component> {
    const res = await fetch(`${API_BASE}/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
export async function updateComponent(id: string, input: UpdateComponentInput): Promise<Component> {
    const res = await fetch(`${API_BASE}/components/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<Component>(res)
}


// DELETE /components/:id
export async function deleteComponent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/components/${id}`, { method: 'DELETE' })
    return handle<void>(res)
}