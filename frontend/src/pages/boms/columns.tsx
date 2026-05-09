"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type ColumnDef } from "@tanstack/react-table"
import { type Bom } from "@/apis/boms"
import { Link } from "react-router-dom"
import { EllipsisVertical } from "lucide-react"


interface CreateColumnsProps {
    onDelete: (bomId: string) => void
    onEdit: (bom: Bom) => void
}

export function createColumns({ onDelete, onEdit }: CreateColumnsProps): ColumnDef<Bom>[] {
    return [
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
        {
            id: "actions",
            cell: ({ row }) => {
                const bom = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <EllipsisVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(bom.bom_id)}>Copy BOM Id</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(bom)}>Update BOM</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(bom.bom_id)}>Delete BOM</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]
}
