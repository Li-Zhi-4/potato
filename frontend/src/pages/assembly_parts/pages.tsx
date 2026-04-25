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

import { columns } from "./columns"
import { API_BASE } from "@/lib/api"
import { type CreateAssemblyPartInput, createAssemblyPart, type AssemblyPart } from "@/apis/assembly_parts"


export default function Page() {
    const [partId, setPartId] = useState("")
    const [subpartId, setSubpartId] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [uom, setUOM] = useState("each")
    const [createdBy, setCreatedBy] = useState("0")
    const [updatedBy, setUpdatedBy] = useState("0")
    const [data, setData] = useState<AssemblyPart[]>([])
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`${API_BASE}/assembly_parts`)
            const result = await res.json()
            setData(result)
        }
        fetchData()
    }, [refresh])

    function handleReset() {
        setPartId("")
        setSubpartId("")
        setQuantity(1)
        setUOM("each")
        setCreatedBy("0")
        setUpdatedBy("0")
    }

    const INPUT: CreateAssemblyPartInput = {
        part_id: partId,
        subpart_id: subpartId,
        quantity: quantity,
        uom: uom,

        created_by: createdBy,
        updated_by: updatedBy
    }

    async function handleSubmit() {
        await createAssemblyPart(INPUT)
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
            <SiteHeader title="Parts/Subparts"/>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-8">
                            <FieldGroup>
                                <div className="flex flex-row gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="part-id">Part Id</FieldLabel>
                                        <Input
                                            id="part-id"
                                            type="text"
                                            placeholder=""
                                            value={partId}
                                            onChange={(e) => setPartId(e.target.value)}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="subpart-id">Subpart Id</FieldLabel>
                                        <Input
                                            id="subpart-id"
                                            type="text"
                                            placeholder=""
                                            value={subpartId}
                                            onChange={(e) => setSubpartId(e.target.value)}
                                        />
                                    </Field>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                                    <Input 
                                        id="quantity" 
                                        type="number"
                                        placeholder="" 
                                        value={quantity} 
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="uom">UOM</FieldLabel>
                                    <Input 
                                        id="uom" 
                                        type="text"
                                        placeholder="" 
                                        value={uom} 
                                        onChange={(e) => setUOM(e.target.value)}
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