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
import { API_BASE } from "@/lib/api"
import { type Bom } from "@/apis/boms"
import { CreateBOMSheet } from "@/components/sheets/create-bom-sheet"


export default function Page() {
    const [data, setData] = useState<Bom[]>([])
    const [refresh, setRefresh] = useState(0)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [globalFilter, setGlobalFilter] = useState("")

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`${API_BASE}/boms`)
            const result = await res.json()
            setData(result)
        }
        fetchData()
    }, [refresh])


    const handleBOMCreated = () => {
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
                <SiteHeader title="Purchase Orders" children={<Button onClick={() => setSheetOpen(true)}>Create a BOM</Button>}/>
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
                                    data={data} 
                                    
                                    globalFilter={globalFilter}
                                    onGlobalFilterChange={setGlobalFilter}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>

            <CreateBOMSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen} 
                onPartCreated={handleBOMCreated}
            />
        </SidebarProvider>
    )
}