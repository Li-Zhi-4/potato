"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type PurchaseOrder } from "@/apis/purchaseOrders"


export const columns: ColumnDef<PurchaseOrder>[] = [
    {
        accessorKey: "purchase_order_no",
        header: "Purchase Order No."
    },
    {
        accessorKey: "vendor_id",
        header: "Vendor Id"
    },
    {
        accessorKey: "status",
        header: "Status"
    },
]