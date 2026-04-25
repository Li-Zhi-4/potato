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
import { vendorsTableColumns, subpartsTableColumns } from "./columns"
import { getPartByPartNo, type Part, type VendorTable, getVendorsTable, type SubpartTable, getSubpartsTable } from "@/apis/parts"
import { useParams } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Component } from "lucide-react"
import { AddVendorSheet } from "@/components/sheets/add-vendor-sheet"
import { AddSubpartSheet } from "@/components/sheets/add-subpart-sheet"


export default function Page() {
    const { part_no } = useParams<{ part_no: string }>();
    const [vendorTableData, setVendorTableData] = useState<VendorTable[]>([])
    const [subpartTableData, setSubpartTableData] = useState<SubpartTable[]>([])
    const [partData, setPartData] = useState<Part>()
    const [tabValue, setTabValue] = useState("vendors")
    const [vendorSheetOpen, setVendorSheetOpen] = useState(false)
    const [subpartSheetOpen, setSubpartSheetOpen] = useState(false)
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        async function fetchData() {
            if (!part_no) return
            const part = await getPartByPartNo(part_no)
            const vendorsTable = await getVendorsTable(part.part_id)
            const subpartsTable = await getSubpartsTable(part.part_id)
            setPartData(part)
            setVendorTableData(vendorsTable)
            setSubpartTableData(subpartsTable)
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
                                                <Button onClick={() => setVendorSheetOpen(true)}>Add a Vendor</Button>
                                            ) : (
                                                <Button onClick={() => setSubpartSheetOpen(true)}>Add a Subpart</Button>
                                            )}
                                        </div>
                                    </div>
                                    <TabsContent value="vendors" className="flex flex-col gap-3">
                                        <DataTable 
                                            columns={vendorsTableColumns} 
                                            data={vendorTableData}  
                                        />
                                    </TabsContent>
                                    <TabsContent value="subparts" className="flex flex-col gap-3">
                                        <DataTable 
                                            columns={subpartsTableColumns} 
                                            data={subpartTableData}  
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
                    open={vendorSheetOpen}
                    onOpenChange={setVendorSheetOpen} 
                    onUpdate={handleRefresh}
                    part={partData}
                />
            ) : (
                <p>Loading part info...</p>
            )}

            {partData ? (
                <AddSubpartSheet
                    open={subpartSheetOpen}
                    onOpenChange={setSubpartSheetOpen} 
                    onUpdate={handleRefresh}
                    part={partData}
                />
            ) : (
                <p>Loading part info...</p>
            )}
        </SidebarProvider>
    )
}