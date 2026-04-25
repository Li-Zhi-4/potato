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
import { columns } from "./columns"
import { listBoms, type Bom } from "@/apis/boms"
import { CreateBomSheet } from "@/components/sheets/create-bom-sheet"


export default function Page() {
    const [bomsData, setBomsData] = useState<Bom[]>([])
    const [bomSheetOpen, setBomSheetOpen] = useState(false)
    const [globalFilter, setGlobalFilter] = useState("")
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        async function fetchData() {
            const boms = await listBoms()
            setBomsData(boms)
        }
        fetchData()
    }, [refresh])


    const handleRefresh = () => {
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
                <SiteHeader title="Purchase Orders" children={<Button onClick={() => setBomSheetOpen(true)}>Create a BOM</Button>}/>
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

            <CreateBomSheet
                open={bomSheetOpen}
                onOpenChange={setBomSheetOpen} 
                onUpdate={handleRefresh}
            />
        </SidebarProvider>
    )
}