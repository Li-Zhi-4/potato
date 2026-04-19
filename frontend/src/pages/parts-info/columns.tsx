"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
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
import { type SubpartTable, type VendorTable } from "@/apis/parts"

export const columns: ColumnDef<VendorTable>[] = [
    {
        accessorKey: "vendor_name",
        header: () => <div className="text-center">Vendor</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue("vendor_name")}</div>
    },
    {
        accessorKey: "part_no",
        header: () => <div className="text-center">Vendor Part No.</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue("part_no")}</div>
    },
    {
        accessorKey: "description",
        header: "Description"
    },
    {
        accessorKey: "is_primary",
        header: () => <div className="text-center">Primary</div>,
        cell: ({ row }) => {
            return (
                <div className="flex justify-center">
                    <Badge variant="outline" >
                        {row.getValue("is_primary") ? (
                            "true"
                        ) : (
                            "false"
                        )}
                    </Badge>
                </div>
            )
        }
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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(part.part_id)}>Copy part ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Update Part</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive">Delete Part</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]


export const subpartsColumns: ColumnDef<SubpartTable>[] = [
    {
        accessorKey: "subpart_part_no",
        header: () => <div className="text-center">Subpart Part No.</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue("subpart_part_no")}</div>
    },
    {
        accessorKey: "subpart_description",
        header: "Description"
    },
    {
        accessorKey: "quantity",
        header: () => <div className="text-center">Quantity</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue("quantity")}</div>
    },
    {
        accessorKey: "uom",
        header: () => <div className="text-center">UOM</div>,
        cell: ({ row }) => {
            return (
                <div className="flex justify-center">
                    <Badge variant="outline" >{row.getValue("uom")}</Badge>
                </div>
            )
        }
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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(part.subpart_id)}>Copy part ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Update Part</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive">Delete Part</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]


