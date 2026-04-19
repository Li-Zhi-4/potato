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
import { columns, subpartsColumns } from "./columns"
import { CreatePartSheet } from "@/components/sheets/create-part-sheet"
import { getPartByPartNo, type Part, type VendorTable, getVendorTable, type SubpartTable, getSubpartTable } from "@/apis/parts"
import { useParams } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Component } from "lucide-react"
import { AddVendorSheet } from "@/components/sheets/add-vendor-sheet"


export default function Page() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<VendorTable[]>([])
    const [subpartData, setSubpartData] = useState<SubpartTable[]>([])
    const [refresh, setRefresh] = useState(0)
    const [tabValue, setTabValue] = useState("vendors")

    const [partData, setPartData] = useState<Part>()

    const [sheetOpen, setSheetOpen] = useState(false)

    useEffect(() => {
        async function fetchData() {
            if (!id) return
            const part = await getPartByPartNo(id)
            const partResults = await getVendorTable(part.part_id)
            const subpartsResults = await getSubpartTable(part.part_id)
            setData(partResults)
            setPartData(part)
            setSubpartData(subpartsResults)
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
                <SiteHeader title={`Parts / ${partData?.part_no}`}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"> 
                            <div className="px-4 lg:px-6 flex flex-col gap-3">
                                
                                <div className="flex flex-col gap-3 pb-3">
                                    <div className="flex flex-row gap-6 items-center">
                                        <h1 className="text-4xl">{partData?.part_no}</h1>
                                        <Badge variant="outline">{(partData?.is_assembly)?.toUpperCase()}</Badge>
                                    </div>
                                    <div className="text-neutral-500">{partData?.description}</div>
                                </div>

                                <Tabs 
                                    value={tabValue}
                                    onValueChange={setTabValue}
                                    defaultValue="vendors" 
                                    className="flex flex-col gap-3"
                                >
                                    <div className="flex flex-row justify-between items-center">
                                        <TabsList>
                                            <TabsTrigger value="vendors">
                                                <Store />
                                                Vendors
                                            </TabsTrigger>
                                            <TabsTrigger value="subparts">
                                                <Component />
                                                Subparts
                                            </TabsTrigger>
                                        </TabsList>
                                        <div>
                                            {tabValue === "vendors" ? (
                                                <Button onClick={() => setSheetOpen(true)}>Add a Vendor</Button>
                                            ) : (
                                                <Button onClick={() => setSheetOpen(true)}>Add a Subpart</Button>
                                            )}
                                        </div>
                                    </div>
                                    <TabsContent value="vendors" className="flex flex-col gap-3">
                                        <DataTable 
                                            columns={columns} 
                                            data={data}  
                                        />
                                    </TabsContent>
                                    <TabsContent value="subparts" className="flex flex-col gap-3">
                                        <DataTable 
                                            columns={subpartsColumns} 
                                            data={subpartData}  
                                        />
                                    </TabsContent>
                                </Tabs>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>

            {partData ? (
                <AddVendorSheet
                    open={sheetOpen}
                    onOpenChange={setSheetOpen} 
                    onPartCreated={handlePartCreated}
                    part={partData}
                />
            ) : (
                <p>Loading part info...</p>
            )}
        </SidebarProvider>
    )
}