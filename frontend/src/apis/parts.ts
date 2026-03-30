const API_BASE = '/api'



// returns the {"error": "error message"} or the res in a pre-defined interface
async function handle<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error((err as { error?: string }).error || res.statusText)
    }
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
}

export function getHealth(): Promise<{ status: string }> {
    return fetch(`${API_BASE}/health`).then((r) => handle<{ status: string }>(r))
}

// GET /parts
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

export async function listParts(): Promise<Part[]> {
    const res = await fetch(`${API_BASE}/parts`)
    return handle<Part[]>(res)
}

// POST /parts
export type CreatePartInput = {
  name: string
  description?: string | null
  part_number?: string | null
  is_assembly?: boolean
}

export function createPart(input: CreatePartInput): Promise<Part> {
  return fetch(`${API_BASE}/parts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => handle<Part>(r))
}


export type Bom = {
  id: number
  name: string
  description: string | null
  created_at?: string
}

export function listBoms(): Promise<Bom[]> {
  return fetch(`${API_BASE}/boms`).then((r) => handle<Bom[]>(r))
}

export function createBom(input: {
  name: string
  description?: string | null
}): Promise<Bom> {
  return fetch(`${API_BASE}/boms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => handle<Bom>(r))
}

export type BomLine = {
  id: number
  bom_id: number
  part_id: number
  quantity: number
  uom: string
  notes: string | null
  sort_order: number
  part_name: string
  part_number: string | null
}

export function listBomLines(bomId: number): Promise<BomLine[]> {
  return fetch(`${API_BASE}/boms/${bomId}/lines`).then((r) =>
    handle<BomLine[]>(r),
  )
}

export function addBomLine(
  bomId: number,
  input: {
    part_id: number
    quantity: number
    uom?: string
    notes?: string | null
    sort_order?: number
  },
): Promise<BomLine> {
  return fetch(`${API_BASE}/boms/${bomId}/lines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => handle<BomLine>(r))
}