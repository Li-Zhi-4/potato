import { useState, useRef, useEffect } from "react"
import type { VendorTable } from "@/apis/parts"
import { EllipsisVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function initials(name: string): string {
    const words = name.trim().split(/\s+/)
    if (words.length === 1) return words[0][0].toUpperCase()
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

interface VendorPartsTableProps {
    data: VendorTable[]
    onDelete: (vendorPartId: string) => void
}

export function VendorPartsTable({ data, onDelete }: VendorPartsTableProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const headerCheckboxRef = useRef<HTMLInputElement>(null)

    const allChecked = data.length > 0 && selected.size === data.length
    const someChecked = selected.size > 0 && !allChecked

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = someChecked
        }
    }, [someChecked])

    function toggleAll() {
        if (allChecked || someChecked) {
            setSelected(new Set())
        } else {
            setSelected(new Set(data.map((r) => r.vendor_part_id)))
        }
    }

    function toggleRow(id: string) {
        setSelected((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    return (
        <table className="w-full border-collapse">
            <thead>
                <tr className="h-12 border-b border-neutral-200">
                    <th className="w-[54px]">
                        <div className="flex items-center justify-center">
                            <input
                                ref={headerCheckboxRef}
                                type="checkbox"
                                checked={allChecked}
                                onChange={toggleAll}
                                className="w-[14px] h-[14px] border border-neutral-300 rounded-none accent-primary cursor-pointer"
                            />
                        </div>
                    </th>
                    <th className="w-[300px] text-left px-4 font-mono font-medium text-[12px] tracking-[2.4px] uppercase text-neutral-500">
                        Vendor
                    </th>
                    <th className="text-left px-4 font-mono font-medium text-[12px] tracking-[2.4px] uppercase text-neutral-500">
                        Vendor Part
                    </th>
                    <th className="w-[54px]" />
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="h-24 text-center font-mono text-[12px] text-neutral-400">
                            No vendors added yet.
                        </td>
                    </tr>
                ) : (
                    data.map((row) => (
                        <tr key={row.vendor_part_id} className="h-16 border-t border-b border-neutral-200">

                            {/* Checkbox */}
                            <td className="w-[54px]">
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={selected.has(row.vendor_part_id)}
                                        onChange={() => toggleRow(row.vendor_part_id)}
                                        className="w-[14px] h-[14px] border border-neutral-300 rounded-none accent-primary cursor-pointer"
                                    />
                                </div>
                            </td>

                            {/* Vendor */}
                            <td className="w-[300px] px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 border border-neutral-300 flex items-center justify-center shrink-0">
                                        <span className="font-mono text-[11px] text-neutral-600 leading-none">
                                            {initials(row.vendor_name)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-[3px]">
                                        <div className="flex items-center gap-2">
                                            <span className="font-serif text-[14px] leading-tight">{row.vendor_name}</span>
                                            {row.is_primary && (
                                                <span className="font-mono text-[10px] tracking-[2px] border border-primary text-primary px-[6px] h-[18px] inline-flex items-center shrink-0">
                                                    PRIMARY
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Vendor Part */}
                            <td className="px-4">
                                {row.part_no ? (
                                    <div className="flex flex-col gap-[3px]">
                                        <span className="font-serif text-[16px] leading-tight">{row.part_no}</span>
                                        {row.description && (
                                            <span className="font-mono text-[10px] text-neutral-400">{row.description}</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="font-serif text-neutral-400">—</span>
                                )}
                            </td>

                            {/* Actions */}
                            <td className="w-[54px]">
                                <div className="flex items-center justify-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 hover:bg-neutral-100 rounded cursor-pointer">
                                                <EllipsisVertical size={16} className="text-neutral-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.vendor_part_id)}>
                                                Copy vendor part ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>Update Part</DropdownMenuItem>
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onClick={() => onDelete(row.vendor_part_id)}
                                            >
                                                Delete Vendor Part
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </td>

                        </tr>
                    ))
                )}
            </tbody>
        </table>
    )
}
