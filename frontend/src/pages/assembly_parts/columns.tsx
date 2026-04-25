"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type AssemblyPart } from "@/apis/assembly_parts"


export const columns: ColumnDef<AssemblyPart>[] = [
    {
        accessorKey: "assembly_part_id",
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