import { useState, useRef, useEffect } from "react"
import type { SubpartTable } from "@/apis/parts"
import { EllipsisVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SubpartsTableProps {
    data: SubpartTable[]
    onDelete: (assemblyPartId: string) => void
}

export function SubpartsTable({ data, onDelete }: SubpartsTableProps) {
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
            setSelected(new Set(data.map((r) => r.assembly_part_id)))
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
                    <th className="text-left px-4 font-mono font-medium text-[12px] tracking-[2.4px] uppercase text-neutral-500">
                        Part
                    </th>
                    <th className="w-[120px] text-left px-4 font-mono font-medium text-[12px] tracking-[2.4px] uppercase text-neutral-500">
                        Qty
                    </th>
                    <th className="w-[120px] text-left px-4 font-mono font-medium text-[12px] tracking-[2.4px] uppercase text-neutral-500">
                        UOM
                    </th>
                    <th className="w-[54px]" />
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="h-24 text-center font-mono text-[12px] text-neutral-400">
                            No subparts added yet.
                        </td>
                    </tr>
                ) : (
                    data.map((row) => (
                        <tr key={row.assembly_part_id} className="h-16 border-t border-b border-neutral-200">

                            {/* Checkbox */}
                            <td className="w-[54px]">
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={selected.has(row.assembly_part_id)}
                                        onChange={() => toggleRow(row.assembly_part_id)}
                                        className="w-[14px] h-[14px] border border-neutral-300 rounded-none accent-primary cursor-pointer"
                                    />
                                </div>
                            </td>

                            {/* Part: part no + description */}
                            <td className="px-4">
                                <div className="flex flex-col gap-[3px]">
                                    <span className="font-serif text-[16px] leading-tight">{row.subpart_part_no}</span>
                                    {row.subpart_description && (
                                        <span className="font-mono text-[10px] text-neutral-400">{row.subpart_description}</span>
                                    )}
                                </div>
                            </td>

                            {/* Quantity */}
                            <td className="w-[120px] px-4">
                                <span className="font-mono text-[14px] text-neutral-700">{row.quantity}</span>
                            </td>

                            {/* UOM */}
                            <td className="w-[120px] px-4">
                                <span className="font-mono text-[12px] tracking-[1.5px] uppercase text-neutral-500">{row.uom}</span>
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
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.subpart_id)}>
                                                Copy part ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>Update Part</DropdownMenuItem>
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onClick={() => onDelete(row.assembly_part_id)}
                                            >
                                                Delete Subpart
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
