"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type Bom } from "@/apis/boms"


export const columns: ColumnDef<Bom>[] = [
    {
        accessorKey: "job_no",
        header: "Job No."
    },
    {
        accessorKey: "description",
        header: "Description"
    },
    {
        accessorKey: "bom_id",
        header: "BOM Id"
    },
]