import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table-2"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { useEffect } from "react"
import { deletePart, getPart, getPartsTable, type Part } from "@/apis/parts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    type ColumnFiltersState,
} from "@tanstack/react-table"
import { createColumns } from "./columns"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { listVendors, type Vendor } from "@/apis/vendors"
import { type PartsTable } from "@/apis/parts"
import { FormSheet } from "@/components/sheets/FormSheet"
import { CreatePartForm } from "@/components/forms/create-part-form"


export default function Page() {
    const [partsData, setPartsData] = useState<PartsTable[]>([])
    const [vendorsData, setVendorsData] = useState<Vendor[]>([])
    const [partSheetOpen, setPartSheetOpen] = useState(false)
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [refresh, setRefresh] = useState(0)
    const [selectedPart, setSelectedPart] = useState<Part>()

    useEffect(() => {
        async function fetchData() {
            const [partsTable, vendorsList] = await Promise.all([
                getPartsTable(),
                listVendors()
            ])
            setPartsData(partsTable)
            setVendorsData(vendorsList)
        }
        fetchData()
    }, [refresh])

    const handleUpdate = () => {
        setRefresh(prev => prev + 1)    // refresh page
        setPartSheetOpen(false)         // closes sheet
    }

    async function handleDelete(partId: string) {
        await deletePart(partId)
        setRefresh(prev => prev + 1) 
    }

    async function handleEdit(partId: string) {
        const p = await getPart(partId)
        setSelectedPart(p)
        setPartSheetOpen(true)
    }
    
    const columns = createColumns({ onDelete: handleDelete, onEdit: handleEdit })

    return (
        <SidebarProvider
            style={
                {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Parts" children={<Button onClick={() => setPartSheetOpen(true)}>Create a Part</Button>}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">                            
                            <div className="px-4 lg:px-6 flex flex-col gap-3">

                                <div className="flex flex-row justify-between">
                                    <Input
                                        placeholder="Search parts..."
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        className="w-[30%]"
                                    />
                                    <div className="flex flex-row gap-3">
                                        <Select onValueChange={(value) => setColumnFilters(prev =>
                                            value === "all"
                                                ? prev.filter(f => f.id !== "is_assembly")
                                                : [...prev.filter(f => f.id !== "is_assembly"), { id: "is_assembly", value }]
                                        )}>
                                            <SelectTrigger className="w-fit">
                                                <SelectValue placeholder="Assembly" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="assembly">Assembly</SelectItem>
                                                    <SelectItem value="part">Part</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <Select onValueChange={(value) => setColumnFilters(prev =>
                                            value === "all"
                                                ? prev.filter(f => f.id !== "name")
                                                : [...prev.filter(f => f.id !== "name"), { id: "name", value }]
                                        )}>
                                            <SelectTrigger className="w-fit">
                                                <SelectValue placeholder="Vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">All</SelectItem>
                                                    {vendorsData.map((value) => (
                                                        <SelectItem key={value.vendor_id} value={value.vendor_name}>{value.vendor_name}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DataTable 
                                    columns={columns} 
                                    data={partsData}  

                                    globalFilter={globalFilter}
                                    onGlobalFilterChange={setGlobalFilter}

                                    columnFilters={columnFilters}
                                    onColumnFiltersChange={setColumnFilters}
                                />
                                
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>

            <FormSheet
                title={selectedPart ? "Update a Part" : "Create a Part" }
                description="Create a new part with a unique part number."
                open={partSheetOpen}
                onOpenChange={(open) => { setPartSheetOpen(open); if (!open) setSelectedPart(undefined) }}
                formId="create-part-form"
            >
                <CreatePartForm
                    open={partSheetOpen}
                    onUpdate={handleUpdate}
                    formId="create-part-form"
                    part={selectedPart}
                />
            </FormSheet>
        </SidebarProvider>
    )
}