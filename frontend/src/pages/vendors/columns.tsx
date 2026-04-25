"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type Vendor } from "@/apis/vendors"


export const columns: ColumnDef<Vendor>[] = [
    {
        accessorKey: "vendor_name",
        header: "Vendor Name"
    },
    {
        accessorKey: "vendor_id",
        header: "Vendor Id"
    },
]