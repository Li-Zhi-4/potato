import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { useEffect } from "react"
import { getPartsTable, type Part } from "@/apis/parts"
import {
    type ColumnFiltersState,
} from "@tanstack/react-table"
import { listVendors, type Vendor } from "@/apis/vendors"
import { useAuth } from "@/context/authContext"
import { type PartsTable } from "@/apis/parts"
import { FormSheet } from "@/components/sheets/FormSheet"
import { CreatePartForm } from "@/components/forms/create-part-form"
import { Button } from "@/components/custom/Button"
import { Plus } from "lucide-react"


export default function Page() {
    const [partsData, setPartsData] = useState<PartsTable[]>([])
    const [vendorsData, setVendorsData] = useState<Vendor[]>([])
    const [partSheetOpen, setPartSheetOpen] = useState(false)
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [refresh, setRefresh] = useState(0)
    const [selectedPart, setSelectedPart] = useState<Part>()

    const { token } = useAuth()

    useEffect(() => {
        if (!token) return
        async function fetchData() {
            const [partsTable, vendorsList] = await Promise.all([
                getPartsTable(token!),
                listVendors(token!)
            ])
            setPartsData(partsTable)
            setVendorsData(vendorsList)
        }
        fetchData()
    }, [refresh, token])

    // refreshes page when user creates/updates a part
    const handleUpdate = () => {
        setRefresh(prev => prev + 1)    // refresh page
        setPartSheetOpen(false)         // closes sheet
        setSelectedPart(undefined)
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
                <SiteHeader title="Parts" />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">                            
                            <div className="px-4 lg:px-6 flex flex-col gap-3">

                                <Button command="K" variant="outline">
                                    <Plus size={18} strokeWidth={1.5}></Plus>
                                    NEW ENTRY
                                </Button>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>

            <FormSheet
                title={selectedPart ? "Update a Part" : "Create a Part" }
                description="Create a new part with a unique part number."
                open={partSheetOpen}
                onOpenChange={(open) => { 
                    setPartSheetOpen(open); 
                    if (!open) setSelectedPart(undefined) 
                }}
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