"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type PartVendor } from "@/apis/part_vendor"


export const columns: ColumnDef<PartVendor>[] = [
    {
        accessorKey: "part_vendor_id",
        header: "Part/Vendor Id"
    },
    {
        accessorKey: "part_id",
        header: "Part Id"
    },
    {
        accessorKey: "vendor_id",
        header: "Vendor Id"
    },
    {
        accessorKey: "part_no",
        header: "Part No."
    },
    {
        accessorKey: "description",
        header: "Description"
    },
    {
        accessorKey: "name",
        header: "Name"
    },
    {
        accessorKey: "is_primary",
        header: "isPrimary"
    },
]