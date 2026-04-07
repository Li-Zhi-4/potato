"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type PartSubpart } from "@/apis/part_subpart"


export const columns: ColumnDef<PartSubpart>[] = [
    {
        accessorKey: "part_subpart_id",
        header: "Part/Subpart Id"
    },
    {
        accessorKey: "part_id",
        header: "Part Id"
    },
    {
        accessorKey: "subpart_id",
        header: "Subpart Id"
    },
    {
        accessorKey: "quantity",
        header: "Quantity"
    },
    {
        accessorKey: "uom",
        header: "UOM"
    },
]