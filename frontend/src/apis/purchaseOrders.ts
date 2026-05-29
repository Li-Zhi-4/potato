import { API_BASE, handle, authFetch } from "../lib/api"

export type PurchaseOrder = {
    po_id: string
    po_no: string
    vendor_id: string
    status: 'draft' | 'sent' | 'received' | 'cancelled'

    created_at: string
    updated_at: string
    created_by: string
    updated_by: string | null
}

// GET /purchase_orders
export async function listPurchaseOrders(token: string): Promise<PurchaseOrder[]> {
    const res = await authFetch(`${API_BASE}/purchase_orders`, token)
    return handle<PurchaseOrder[]>(res)
}

// GET /purchase_orders/:id
export async function getPurchaseOrder(id: string, token: string): Promise<PurchaseOrder> {
    const res = await authFetch(`${API_BASE}/purchase_orders/${id}`, token)
    return handle<PurchaseOrder>(res)
}


export type CreatePurchaseOrderInput = {
    vendor_id: string
    po_no: string
    status: 'draft' | 'sent' | 'received' | 'cancelled'

    created_by: string
    updated_by?: string | null
}

// POST /purchase_orders
export async function createPurchaseOrder(input: CreatePurchaseOrderInput, token: string): Promise<PurchaseOrder> {
    const res = await authFetch(`${API_BASE}/purchase_orders`, token, {
        method: 'POST',
        body: JSON.stringify(input)
    })
    return handle<PurchaseOrder>(res)
}


export type UpdatePurchaseOrderInput = {
    po_no?: string
    vendor_id?: string
    status?: 'draft' | 'sent' | 'received' | 'cancelled'

    updated_by?: string | null
}

// PUT /purchase_orders/:id
export async function updatePurchaseOrder(id: string, input: UpdatePurchaseOrderInput, token: string): Promise<PurchaseOrder> {
    const res = await authFetch(`${API_BASE}/purchase_orders/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(input)
    })
    return handle<PurchaseOrder>(res)
}


// DELETE /purchase_orders/:id
export async function deletePurchaseOrder(id: string, token: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/purchase_orders/${id}`, token, { method: 'DELETE' })
    return handle<void>(res)
}