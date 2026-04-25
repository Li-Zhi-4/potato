import { API_BASE, handle } from "../lib/api"

export type PurchaseOrder = {
    po_id: string
    po_no: number
    vendor_id: string
    status: 'draft' | 'sent' | 'received' | 'cancelled'

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}

// GET /purchase_orders
export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
    const res = await fetch(`${API_BASE}/purchase_orders`)
    return handle<PurchaseOrder[]>(res)
}

// GET /purchase_orders/:id
export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const res = await fetch(`${API_BASE}/purchase_orders/${id}`)
    return handle<PurchaseOrder>(res)
}


export type CreatePurchaseOrderInput = {
    vendor_id: string
    po_no?: number
    status?: 'draft' | 'sent' | 'received' | 'cancelled'

    created_by: string
    updated_by?: string | null
}

// POST /purchase_orders
export async function createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    const res = await fetch(`${API_BASE}/purchase_orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<PurchaseOrder>(res)
}


export type UpdatePurchaseOrderInput = {
    po_no?: number
    vendor_id?: string
    status?: 'draft' | 'sent' | 'received' | 'cancelled'

    updated_by?: string | null
}

// PUT /purchase_orders/:id
export async function updatePurchaseOrder(id: string, input: UpdatePurchaseOrderInput): Promise<PurchaseOrder> {
    const res = await fetch(`${API_BASE}/purchase_orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<PurchaseOrder>(res)
}


// DELETE /purchase_orders/:id
export async function deletePurchaseOrder(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/purchase_orders/${id}`, { method: 'DELETE' })
    return handle<void>(res)
}