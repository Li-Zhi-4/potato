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
import { createColumns } from "./columns"
import { useParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Component } from "lucide-react"
import { type BomTable, getBomByJobNo, getBomsTable, type Bom } from "@/apis/boms"
import { deleteComponent } from "@/apis/components"
import { AddComponentForm } from "@/components/forms/add-component-form"
import { FormSheet } from "@/components/sheets/FormSheet"

export default function Page() {
    const { job_no } = useParams<{ job_no: string }>();
    const [bomData, setBomData] = useState<Bom>()
    const [bomTableData, setBomTableData] = useState<BomTable[]>([])
    const [tabValue, setTabValue] = useState("flattened")
    const [refresh, setRefresh] = useState(0)

    const [sheetOpen, setSheetOpen] = useState(false)
    const [subpartSheetOpen, setSubpartSheetOpen] = useState(false)

    useEffect(() => {
        async function fetchData() {
            if (!job_no) return;

            try {
                const bom = await getBomByJobNo(job_no);
                
                if (!bom || !bom.bom_id) {
                    console.warn("No BOM found for this job number");
                    return; 
                }

                setBomData(bom);

                try {
                    const bomsTable = await getBomsTable(bom.bom_id);
                    setBomTableData(bomsTable || []); // Default to empty array if null
                } catch (tableErr) {
                    console.error("Failed to fetch BOM table data:", tableErr);
                }

            } catch (bomErr) {
                console.error("Failed to fetch BOM record:", bomErr);
            }
        }
        fetchData();
    }, [job_no, refresh]);

    const handleUpdate = () => {
        setRefresh(prev => prev + 1)    // refresh page
        setSheetOpen(false)             // closes sheet
    }

    async function handleDelete(componentId: string) {
        await deleteComponent(componentId)
        setRefresh(prev => prev + 1)
    }

    const columns = createColumns(handleDelete)

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
                <SiteHeader title={`BOMs / ${job_no}`} />
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
                                        <Button onClick={() => setSheetOpen(true)}>Add a Component</Button>
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

            {bomData ? (
                <FormSheet
                    title="Create a Part" 
                    description="Create a new part with a unique part number."
                    open={sheetOpen}
                    onOpenChange={setSheetOpen} 
                    formId="add-component-form"
                >
                    <AddComponentForm
                        open={sheetOpen}
                        onUpdate={handleUpdate}
                        formId="add-component-form"
                        bom={bomData}
                    />
                </FormSheet>
            ) : (
                <p>Loading part info...</p>
            )}
        </SidebarProvider>
    )
}