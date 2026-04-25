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
import { useParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Component } from "lucide-react"
import { type BomTable, getBomByJobNo, getBomsTable, type Bom } from "@/apis/boms"
import { Link } from "react-router-dom"
import { AddComponentSheet } from "@/components/sheets/add-component-sheet"

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
            if (!job_no) return
            const bom = await getBomByJobNo(job_no)
            const bomsTable = await getBomsTable(bom.bom_id)
            setBomData(bom)
            setBomTableData(bomsTable)
        }
        fetchData()
    }, [job_no, refresh])

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
                <SiteHeader title={`BOMs / ${job_no}`} children={<Button onClick={() => setSheetOpen(true)}>Add a Component</Button>}/>
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

            {bomData ? (
                <AddComponentSheet
                    open={sheetOpen}
                    onOpenChange={setSheetOpen} 
                    onUpdate={handleRefresh}
                    bom={bomData}
                />
            ) : (
                <p>Loading part info...</p>
            )}
        </SidebarProvider>
    )
}