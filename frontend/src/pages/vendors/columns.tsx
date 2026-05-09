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

interface createColumnsProp {
    onDelete: (vendorId: string) => void
    onEdit: (vendorId: string) => void
}

export function createColumns({ onDelete, onEdit}: createColumnsProp): ColumnDef<Vendor>[] {
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
                const vendor = row.original

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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(vendor.vendor_id)}>Copy Vendor Id</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(vendor.vendor_id)}>Update Vendor</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(vendor.vendor_id)}>Archive Vendor</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]
}