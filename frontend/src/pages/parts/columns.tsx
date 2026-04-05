"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type Part } from "@/apis/parts"


export const columns: ColumnDef<Part>[] = [
    {
        accessorKey: "part_no",
        header: "Part No."
    },
    {
        accessorKey: "description",
        header: "Description"
    },
    {
        accessorKey: "is_assembly",
        header: "Assembly"
    },
    {
        accessorKey: "workflow_id",
        header: "Workflow Id"
    }
]