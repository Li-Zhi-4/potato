import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table-2"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createColumns } from "./columns"
import { getVendor, listVendors, updateVendor, type Vendor } from "@/apis/vendors"
import { FormSheet } from "@/components/sheets/FormSheet"
import { CreateVendorForm } from "@/components/forms/create-vendor-form"
import { useAuth } from "@/context/authContext"

export default function Page() {
    const [vendorData, setVendorData] = useState<Vendor[]>([])
    const [refresh, setRefresh] = useState(0)
    const [globalFilter, setGlobalFilter] = useState("")
    const [vendorSheetOpen, setVendorSheetOpen] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState<Vendor>()
    
    const { token } = useAuth()

    useEffect(() => {
        if (!token) return
        async function fetchData() {
            const result = await listVendors(token!)
            setVendorData(result)
        }
        fetchData()
    }, [refresh, token])

    const handleUpdate = () => {
        setRefresh(prev => prev + 1)    // refresh page
        setVendorSheetOpen(false)       // closes sheet
        setSelectedVendor(undefined)
    }

    async function handleDelete(vendorId: string) {
        await updateVendor(vendorId, { "archived_at": "archived" }, token!)
        setRefresh(prev => prev + 1) 
    }

    async function handleEdit(vendorId: string) {
        const v = await getVendor(vendorId, token!)
        setSelectedVendor(v)
        setVendorSheetOpen(true)
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
                <SiteHeader title="Vendors" children={<Button onClick={() => setVendorSheetOpen(true)}>Create a Vendor</Button>}/>
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
                                        
                                    </div>
                                </div>
                                <DataTable 
                                    columns={columns} 
                                    data={vendorData} 

                                    globalFilter={globalFilter}
                                    onGlobalFilterChange={setGlobalFilter}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>

            <FormSheet
                title="Create a Vendor" 
                description="Create a new vendor."
                open={vendorSheetOpen}
                onOpenChange={(open) => { setVendorSheetOpen(open); if (!open) setSelectedVendor(undefined) }} 
                formId="create-vendor-form"
            >
                <CreateVendorForm
                    open={vendorSheetOpen}
                    onUpdate={handleUpdate}
                    formId="create-vendor-form"
                    vendor={selectedVendor}
                />
            </FormSheet>

            
        </SidebarProvider>
    )
}