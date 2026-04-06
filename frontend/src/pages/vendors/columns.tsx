"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type Vendor } from "@/apis/vendors"


export const columns: ColumnDef<Vendor>[] = [
    {
        accessorKey: "name",
        header: "Name"
    },
    {
        accessorKey: "vendor_id",
        header: "Vendor Id"
    },
]