"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { EllipsisVertical } from "lucide-react"
import type { BomTable } from "@/apis/boms"

export const columns: ColumnDef<BomTable>[] = [
    {
        accessorKey: "part_no",
        header: () => <div className="text-center">Part No.</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue("part_no")}</div>
    },
    {
        accessorKey: "description",
        header: "Description"
    },
    {
        accessorKey: "status",
        header: "Status"
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
        accessorKey: "po_no",
        header: "Purchase Order No."
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const part = row.original

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(part.part_no)}>Copy part ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Update Part</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive">Delete Part</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]

