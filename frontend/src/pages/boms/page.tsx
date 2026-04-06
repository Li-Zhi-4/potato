import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table-2"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { useEffect } from "react"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { columns } from "./columns"
import { API_BASE } from "@/lib/api"
// import { type PurchaseOrder, createPurchaseOrder, type CreatePurchaseOrderInput } from "@/apis/purchaseOrders"
import { type Bom, createBom, type CreateBomInput } from "@/apis/boms"


export default function Page() {
    const [jobNo, setJobNo] = useState(0)
    const [description, setDescription] = useState("")
    const [createdBy, setCreatedBy] = useState("0")
    const [updatedBy, setUpdatedBy] = useState("0")
    const [data, setData] = useState<Bom[]>([])
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`${API_BASE}/boms`)
            const result = await res.json()
            setData(result)
        }
        fetchData()
    }, [refresh])

    function handleReset() {
        setJobNo(0)
        setDescription("")
    }

    const INPUT: CreateBomInput = {
        job_no: jobNo,
        description: description,

        created_by: createdBy,
        updated_by: updatedBy
    }

    async function handleSubmit() {
        await createBom(INPUT)
        handleReset()
        setRefresh(r => r + 1)
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
            <SiteHeader title="Purchase Orders"/>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-8">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="job-no">Job No.</FieldLabel>
                                    <Input 
                                        id="job-no" 
                                        type="number"
                                        placeholder="" 
                                        value={jobNo} 
                                        onChange={(e) => setJobNo(Number(e.target.value))}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="description">Description</FieldLabel>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Type your description here." 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </Field>

                                <Field orientation="horizontal">
                                    <Button type="reset" variant="outline" onClick={handleReset}>
                                        Reset
                                    </Button>
                                    <Button type="submit" onClick={handleSubmit}>Submit</Button>
                                </Field>
                            </FieldGroup>
                        </div>
                        
                        <div className="px-4 lg:px-6">
                            <DataTable columns={columns} data={data} />
                        </div>
                    </div>
                </div>
            </div>
        </SidebarInset>
        </SidebarProvider>
    )
}