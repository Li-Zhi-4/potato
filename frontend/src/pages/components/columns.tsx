"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type Component } from "@/apis/components"


export const columns: ColumnDef<Component>[] = [
    {
        accessorKey: "bom_id",
        header: "BOM Id"
    },
    {
        accessorKey: "component_id",
        header: "Component Id"
    },
    {
        accessorKey: "part_id",
        header: "Part Id"
    },
    {
        accessorKey: "part_vendor_id",
        header: "Part/Vendor Id"
    },
    {
        accessorKey: "po_id",
        header: "PO Id"
    },
    {
        accessorKey: "quantity",
        header: "Quantity"
    },
    {
        accessorKey: "uom",
        header: "UOM"
    },
    {
        accessorKey: "status",
        header: "Status"
    },
]