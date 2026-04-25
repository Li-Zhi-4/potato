"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type Bom } from "@/apis/boms"
import { Link } from "react-router-dom"


export const columns: ColumnDef<Bom>[] = [
    {
        accessorKey: "title",
        header: () => <div className="text-center">Title</div>,
        cell: ({ row }) => <div className="text-center">
            <Link to={`/boms/${row.getValue("job_no")}/info`} className="no-underline hover:underline underline-offset-4 font-medium">
                {row.getValue("title")}
            </Link>
        </div>
    },
    {
        accessorKey: "description",
        header: "Description"
    },
    {
        accessorKey: "job_no",
        header: () => <div className="text-center">Job No.</div>,
        cell: ({ row }) => <div className="text-center">
            {row.getValue("job_no")}
        </div>
    },
]