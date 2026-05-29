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
import { listBoms, deleteBom, type Bom } from "@/apis/boms"
import { FormSheet } from "@/components/sheets/FormSheet"
import { CreateBomForm } from "@/components/forms/create-bom-form"
import { useAuth } from "@/context/authContext"


export default function Page() {
    const [bomsData, setBomsData] = useState<Bom[]>([])
    const [bomSheetOpen, setBomSheetOpen] = useState(false)
    const [selectedBom, setSelectedBom] = useState<Bom | undefined>()
    const [globalFilter, setGlobalFilter] = useState("")
    const [refresh, setRefresh] = useState(0)
    const { token } = useAuth()

    useEffect(() => {
        if (!token) return
        async function fetchData() {
            const boms = await listBoms(token!)
            setBomsData(boms)
        }
        fetchData()
    }, [refresh, token])


    const handleUpdate = () => {
        setRefresh(prev => prev + 1)    // refresh page
        setBomSheetOpen(false)          // closes sheet
        setSelectedBom(undefined)
    }

    async function handleDelete(bomId: string) {
        await deleteBom(bomId, token!)
        setRefresh(prev => prev + 1)
    }

    function handleEdit(bom: Bom) {
        setSelectedBom(bom)
        setBomSheetOpen(true)
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
                <SiteHeader title="BOMs" children={<Button onClick={() => setBomSheetOpen(true)}>Create a BOM</Button>}/>
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
                                </div>

                                <DataTable 
                                    columns={columns} 
                                    data={bomsData} 
                                    
                                    globalFilter={globalFilter}
                                    onGlobalFilterChange={setGlobalFilter}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>

            <FormSheet
                title={selectedBom ? "Update BOM" : "Create a Bill of Materials"}
                description={selectedBom ? "Edit this BOM's details." : "Create a new Bill of Materials."}
                open={bomSheetOpen}
                onOpenChange={(open) => { setBomSheetOpen(open); if (!open) setSelectedBom(undefined) }}
                formId="create-bom-form"
            >
                <CreateBomForm
                    open={bomSheetOpen}
                    onUpdate={handleUpdate}
                    formId="create-bom-form"
                    bom={selectedBom}
                />
            </FormSheet>
        </SidebarProvider>
    )
}