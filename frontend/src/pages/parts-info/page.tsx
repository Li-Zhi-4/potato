import { AppSidebar } from "@/components/app-sidebar"
import { VendorPartsTable } from "@/components/custom/VendorPartsTable"
import { SubpartsTable } from "@/components/custom/SubpartsTable"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getPartByPartNo, type Part, type VendorTable, getVendorsTable, type SubpartTable, getSubpartsTable } from "@/apis/parts"
import { deleteVendorPart } from "@/apis/vendorParts"
import { deleteAssemblyPart } from "@/apis/assembly_parts"
import { useParams } from "react-router-dom"
import { useAuth } from "@/context/authContext"
import { Store, Component } from "lucide-react"
import { Tabs, TabContent } from "@/components/custom/Tabs"
import { FormSheet } from "@/components/sheets/FormSheet"
import { AddVendorForm } from "@/components/forms/add-vendor-form"
import { AddSubpartForm } from "@/components/forms/add-subpart-form"
import { Separator } from "@/components/ui/separator"
import { CustomBadge } from "@/components/custom/CustomBadge"
import { DataPoint, DataPoint2 } from "@/components/custom/DataPoint"
import { Profile } from "@/components/custom/Profile"
import { InfoBox, InfoBoxGroup, InfoBoxSpecial } from "@/components/custom/InfoBox"
import { SectionHeader } from "@/components/custom/SectionHeader"


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
                            <div className="px-4 lg:px-6 flex flex-col gap-6">
                                
                                {/* Header Content */}
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex flex-col gap-8 pb-3 flex-1 min-w-0">
                                        <div className="flex flex-col gap-2">
                                            {partData && <CustomBadge>{(partData?.is_assembly)?.toUpperCase()}</CustomBadge>}
                                            <h1 className="text-5xl font-serif">{partData?.part_no}</h1>
                                        </div>
                                        <div className="text-xl text-neutral-500 font-serif">{partData?.description}</div>
                                        <Separator />
                                        <div className="flex flex-row justify-between">
                                            <DataPoint label="Owner">
                                                <Profile
                                                    name="John Doe"
                                                    email="john@gmail.com"
                                                ></Profile>
                                            </DataPoint>
                                            <DataPoint2
                                                label="Created At"
                                                value="September 1, 2021"
                                            />
                                            <DataPoint2
                                                label="Updated At"
                                                value="September 1, 2021"
                                            />
                                        </div>
                                    </div>
                                    <InfoBoxGroup>
                                        <InfoBox label="Components" value="12" className="border-r border-b border-neutral-200" />
                                        <InfoBox label="Vendors" value="4" className="border-b border-neutral-200"/>
                                        <InfoBox label="POs" value="2" className="border-r border-neutral-200"/>
                                        <InfoBox label="Status" value="—"/>
                                        <InfoBoxSpecial label="Total Cost" value="$0.00" className="col-span-2 lg:w-full border-t border-neutral-200" />
                                    </InfoBoxGroup>
                                </div>

                                <Tabs
                                    tabs={[
                                        { value: "vendors", label: "Vendors", icon: <Store size={18} className="text-neutral-500" />, count: vendorTableData.length },
                                        { value: "subparts", label: "Subparts", icon: <Component size={18} className="text-neutral-500" />, count: subpartTableData.length },
                                    ]}
                                    value={tabValue}
                                    onValueChange={setTabValue}
                                >
                                    <TabContent value="vendors" activeValue={tabValue}>
                                        <SectionHeader
                                            // label="Vendor Parts"
                                            title="Part"
                                            titleAccent="suppliers"
                                            description="Suppliers qualified to fulfill this part. Compare SKUs, lead times, and pricing; the primary is used by default on new POs."
                                            action={<Button onClick={() => setVendorSheetOpen(true)}>+ New Supplier</Button>}
                                        />
                                        <VendorPartsTable data={vendorTableData} onDelete={handleDeleteVendorPart} />
                                    </TabContent>
                                    <TabContent value="subparts" activeValue={tabValue}>
                                        <SectionHeader
                                            // label="Assembly"
                                            title="Part"
                                            titleAccent="subparts"
                                            description="Child parts that make up this assembly."
                                            action={<Button onClick={() => setSubpartSheetOpen(true)}>+ Add Subpart</Button>}
                                        />
                                        <SubpartsTable data={subpartTableData} onDelete={handleDeleteSubpart} />
                                    </TabContent>
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