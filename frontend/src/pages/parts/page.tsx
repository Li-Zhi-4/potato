import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table-2"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { useEffect } from "react"
import { getPartsTable } from "@/apis/parts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    type ColumnFiltersState,
} from "@tanstack/react-table"
import { columns } from "./columns"
import { type Part } from "@/apis/parts"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { listVendors, type Vendor } from "@/apis/vendors"
import { CreatePartSheet } from "@/components/sheets/create-part-sheet"
import { type PartsTable } from "@/apis/parts"


export default function Page() {
    const [data, setData] = useState<PartsTable[]>([])
    const [refresh, setRefresh] = useState(0)

    const [globalFilter, setGlobalFilter] = useState("")
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [vendors, setVendors] = useState<Vendor[]>([])

    const [sheetOpen, setSheetOpen] = useState(false)

    useEffect(() => {
        async function fetchData() {
            const result = await getPartsTable()
            setData(result)
            // console.log("Data", result)

            const vendorList = await listVendors()
            setVendors(vendorList)
        }
        fetchData()
    }, [refresh])

    const handlePartCreated = () => {
        setRefresh(prev => prev + 1)
    }

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
                <SiteHeader title="Parts" children={<Button onClick={() => setSheetOpen(true)}>Create a Part</Button>}/>
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
                                                    {vendors.map((value) => (
                                                        <SelectItem key={value.vendor_id} value={value.name}>{value.name}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DataTable 
                                    columns={columns} 
                                    data={data}  

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

            <CreatePartSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen} 
                onPartCreated={handlePartCreated}
            />
        </SidebarProvider>
    )
}