import { API_BASE, handle, authFetch } from "../lib/api"

export type Bom = {
    bom_id: string
    title: string | null
    job_no: string | null
    description: string | null

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}


// GET /boms
export async function listBoms(token: string): Promise<Bom[]> {
    const res = await authFetch(`${API_BASE}/boms`, token)
    return handle<Bom[]>(res)
}

// GET /boms?job_no
export async function getBomByJobNo(job_no: string, token: string): Promise<Bom> {
    const res = await authFetch(`${API_BASE}/boms?job_no=${job_no}`, token)
    return handle<Bom>(res)
}

// GET /boms/:id
export async function getBom(id: string, token: string): Promise<Bom> {
    const res = await authFetch(`${API_BASE}/boms/${id}`, token)
    return handle<Bom>(res)
}


export type CreateBomInput = {
    title?: string | null
    job_no?: string | null
    description?: string | null

    created_by: string
    updated_by?: string | null
}

// POST /boms
export async function createBom(input: CreateBomInput, token: string): Promise<Bom> {
    const res = await authFetch(`${API_BASE}/boms`, token, {
        method: 'POST',
        body: JSON.stringify(input)
    })
    return handle<Bom>(res)
}


export type UpdateBomInput = {
    title?: string | null
    job_no?: string | null
    description?: string | null

    updated_by?: string | null
}

// PUT /boms/:id
export async function updateBom(id: string, input: UpdateBomInput, token: string): Promise<Bom> {
    const res = await authFetch(`${API_BASE}/boms/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(input)
    })
    return handle<Bom>(res)
}


// DELETE /boms/:id
export async function deleteBom(id: string, token: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/boms/${id}`, token, { method: 'DELETE' })
    return handle<void>(res)
}


// -- tables --


export type BomTable = {
    component_id: string
    part_no: string
    description?: string | null
    status?: string | null
    quantity: number
    uom: string
    po_no: string
}

// GET /boms/boms-table/:bom_id
export async function getBomsTable(bom_id: string, token: string): Promise<BomTable[]> {
    const res = await authFetch(`${API_BASE}/boms/boms-table/${bom_id}`, token)
    return handle<BomTable[]>(res)
}