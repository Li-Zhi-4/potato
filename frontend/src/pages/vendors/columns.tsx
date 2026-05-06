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
import { type Vendor } from "@/apis/vendors"
import { EllipsisVertical } from "lucide-react"


export function createColumns(onDelete: (partId: string) => void): ColumnDef<Vendor>[] {
    return [
        {
            accessorKey: "vendor_name",
            header: "Vendor Name"
        },
        {
            accessorKey: "vendor_id",
            header: "Vendor Id"
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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(part.vendor_id)}>Copy Vendor Id</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Update Part</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(part.vendor_id)}>Delete Vendor</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]
}