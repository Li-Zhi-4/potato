"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type Part } from "@/apis/parts"
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



export const columns: ColumnDef<Part>[] = [
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
        accessorKey: "is_assembly",
        header: () => <div className="text-center">Assembly</div>,
        cell: ({ row }) => {
            return (
                <div className="flex justify-center">
                    <Badge variant="outline" >{row.getValue("is_assembly")}</Badge>
                </div>
            )
        }
    },
    {
        accessorKey: "name",
        header: () => <div className="text-center">Vendor</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue("name") || "N/A"}</div>
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

