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
import { columns } from "./columns"
import { CreatePartSheet } from "@/components/sheets/create-part-sheet"
import { getPartByPartNo, type Part, type VendorTable, getVendorTable, type SubpartTable, getSubpartTable } from "@/apis/parts"
import { useParams } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Component } from "lucide-react"
import { AddVendorSheet } from "@/components/sheets/add-vendor-sheet"
import { AddSubpartSheet } from "@/components/sheets/add-subpart-sheet"
import { type BOMTable, getBOMByJobNo, getBOMTable, type Bom } from "@/apis/boms"


export default function Page() {
    const { id } = useParams<{ id: string }>();
    const [refresh, setRefresh] = useState(0)
    const [tabValue, setTabValue] = useState("flattened")

    const [bomData, setBomData] = useState<Bom>()
    const [bomTableData, setBomTableData] = useState<BOMTable[]>([])

    const [sheetOpen, setSheetOpen] = useState(false)
    const [subpartSheetOpen, setSubpartSheetOpen] = useState(false)

    useEffect(() => {
        async function fetchData() {
            if (!id) return
            const bom = await getBOMByJobNo(id)
            const results = await getBOMTable(bom.bom_id)
            console.log("test")
            console.log(results)
            setBomData(bom)
            setBomTableData(results)
        }
        fetchData()
    }, [id, refresh])

    const handlePartCreated = () => {
        setRefresh(prev => prev + 1)
    }
    console.log("Current Table Data Length:", bomTableData.length);
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
                <SiteHeader title={`BOMs / ${id}`} children={<Button onClick={() => setSheetOpen(true)}>Add a Part</Button>}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"> 
                            <div className="px-4 lg:px-6 flex flex-col gap-3">
                                
                                <div className="flex flex-col gap-3 pb-3">
                                    <div className="flex flex-row gap-6 items-center">
                                        <h1 className="text-4xl">{bomData?.job_no}</h1>
                                    </div>
                                    <div className="text-neutral-500">{bomData?.description}</div>
                                </div>

                                <Tabs 
                                    value={tabValue}
                                    onValueChange={setTabValue}
                                    defaultValue="flattened" 
                                    className="flex flex-col gap-3"
                                >
                                    <div className="flex flex-row justify-between items-center">
                                        <TabsList>
                                            <TabsTrigger value="flattened">
                                                <Store />
                                                Flattened
                                            </TabsTrigger>
                                            <TabsTrigger value="exploded">
                                                <Component />
                                                Exploded
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                    <TabsContent value="flattened" className="flex flex-col gap-3">
                                        <DataTable 
                                            columns={columns} 
                                            data={bomTableData}  
                                        />
                                    </TabsContent>
                                    <TabsContent value="exploded" className="flex flex-col gap-3">
                                        test
                                    </TabsContent>
                                </Tabs>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>

            {/* {bomData ? (
                <AddVendorSheet
                    open={sheetOpen}
                    onOpenChange={setSheetOpen} 
                    onPartCreated={handlePartCreated}
                    part={bomData}
                />
            ) : (
                <p>Loading part info...</p>
            )} */}
        </SidebarProvider>
    )
}