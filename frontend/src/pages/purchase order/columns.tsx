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
import { type PurchaseOrder } from "@/apis/purchaseOrders"
import { EllipsisVertical } from "lucide-react"


export function createColumns(onDelete: (poId: string) => void): ColumnDef<PurchaseOrder>[] {
    return [
        {
            accessorKey: "po_no",
            header: "Purchase Order No."
        },
        {
            accessorKey: "vendor_id",
            header: "Vendor Id"
        },
        {
            accessorKey: "status",
            header: "Status"
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const po = row.original

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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(po.po_id)}>Copy Purchase Order Id</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(po.po_id)}>Delete Purchase Order</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]
}