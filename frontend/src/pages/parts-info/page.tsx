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
import { createVendorColumns, createSubpartColumns } from "./columns"
import { getPartByPartNo, type Part, type VendorTable, getVendorsTable, type SubpartTable, getSubpartsTable } from "@/apis/parts"
import { deleteVendorPart } from "@/apis/vendorParts"
import { deleteAssemblyPart } from "@/apis/assembly_parts"
import { useParams } from "react-router-dom"
import { useAuth } from "@/context/authContext"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Component } from "lucide-react"
import { FormSheet } from "@/components/sheets/FormSheet"
import { AddVendorForm } from "@/components/forms/add-vendor-form"
import { AddSubpartForm } from "@/components/forms/add-subpart-form"


export default function Page() {
    const { part_no } = useParams<{ part_no: string }>();
    const { token } = useAuth()
    const [vendorTableData, setVendorTableData] = useState<VendorTable[]>([])
    const [subpartTableData, setSubpartTableData] = useState<SubpartTable[]>([])
    const [partData, setPartData] = useState<Part>()
    const [tabValue, setTabValue] = useState("vendors")
    const [vendorSheetOpen, setVendorSheetOpen] = useState(false)
    const [subpartSheetOpen, setSubpartSheetOpen] = useState(false)
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        if (!token) return
        async function fetchData() {
            if (!part_no) return
            const part = await getPartByPartNo(part_no, token!)
            const vendorsTable = await getVendorsTable(part.part_id, token!)
            const subpartsTable = await getSubpartsTable(part.part_id, token!)
            setPartData(part)
            setVendorTableData(vendorsTable)
            setSubpartTableData(subpartsTable)
        }
        fetchData()
    }, [refresh, token])

    const handleUpdate = () => {
        setRefresh(prev => prev + 1)    // refresh page
        setVendorSheetOpen(false)       // closes sheet
        setSubpartSheetOpen(false)
    }

    async function handleDeleteVendorPart(vendorPartId: string) {
        await deleteVendorPart(vendorPartId, token!)
        setRefresh(prev => prev + 1)
    }

    async function handleDeleteSubpart(assemblyPartId: string) {
        await deleteAssemblyPart(assemblyPartId, token!)
        setRefresh(prev => prev + 1)
    }

    const vendorColumns = createVendorColumns(handleDeleteVendorPart)
    const subpartColumns = createSubpartColumns(handleDeleteSubpart)

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
                                            columns={vendorColumns}
                                            data={vendorTableData}
                                        />
                                    </TabsContent>
                                    <TabsContent value="subparts" className="flex flex-col gap-3">
                                        <DataTable
                                            columns={subpartColumns}
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
                <FormSheet
                    title="Add a Vendor" 
                    description="Add a vendor for this part."
                    open={vendorSheetOpen}
                    onOpenChange={setVendorSheetOpen} 
                    formId="add-vendor-form"
                >
                    <AddVendorForm
                        open={vendorSheetOpen}
                        onUpdate={handleUpdate}
                        formId="add-vendor-form"
                        part={partData}
                    />
                </FormSheet>
            ) : (
                <p>Loading part info...</p>
            )}

            {partData ? (
                <FormSheet
                    title="Add a Subpart" 
                    description="Attach a subpart to this assembly."
                    open={subpartSheetOpen}
                    onOpenChange={setSubpartSheetOpen} 
                    formId="add-subpart-form"
                >
                    <AddSubpartForm
                        open={subpartSheetOpen}
                        onUpdate={handleUpdate}
                        formId="add-subpart-form"
                        part={partData}
                    />
                </FormSheet>
            ) : (
                <p>Loading part info...</p>
            )}
        </SidebarProvider>
    )
}