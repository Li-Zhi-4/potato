import { API_BASE, handle } from "../lib/api"

export type Bom = {
    bom_id: string
    job_no: number | null
    description: string | null

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}


// GET /boms
export async function listBoms(): Promise<Bom[]> {
    const res = await fetch(`${API_BASE}/boms`)
    return handle<Bom[]>(res)
}

// GET /boms?job_no
export async function getBomByJobNo(job_no: string): Promise<Bom> {
    const res = await fetch(`${API_BASE}/boms?job_no=${job_no}`)
    return handle<Bom>(res)
}

// GET /boms/:id
export async function getBom(id: string): Promise<Bom> {
    const res = await fetch(`${API_BASE}/boms/${id}`)
    return handle<Bom>(res)
}


export type CreateBomInput = {
    job_no?: number | null
    description?: string | null

    created_by: string
    updated_by?: string | null
}

// POST /boms
export async function createBom(input: CreateBomInput): Promise<Bom> {
    const res = await fetch(`${API_BASE}/boms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<Bom>(res)
}


export type UpdateBomInput = {
    job_no?: number | null
    description?: string | null

    updated_by?: string | null
}

// PUT /boms/:id
export async function updateBom(id: string, input: UpdateBomInput): Promise<Bom> {
    const res = await fetch(`${API_BASE}/boms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<Bom>(res)
}


// DELETE /boms/:id
export async function deleteBom(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/boms/${id}`, { method: 'DELETE' })
    return handle<void>(res)
}


// -- tables --


export type BOMTable = {
    part_no: string
    description?: string | null
    status?: string | null
    quantity: number
    uom: string
    purchase_order_no: string
}

// GET /boms/:id
export async function getBOMTable(bom_id: string): Promise<BOMTable[]> {
    const res = await fetch(`${API_BASE}/boms/boms-table/${bom_id}`)
    return handle<BOMTable[]>(res)
}