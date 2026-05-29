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
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldContent
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { columns } from "./columns"
import { type CreateVendorPartInput, createVendorPart, listVendorParts, type VendorPart } from "@/apis/vendorParts"
import { useAuth } from "@/context/authContext"


export default function Page() {
    const [partNo, setPartNo] = useState("")
    const [description, setDescription] = useState("")
    const [partId, setPartId] = useState("")
    const [vendorId, setVendorId] = useState("")
    const [name, setName] = useState("")
    const [isPrimary, setIsPrimary] = useState(false)
    const [createdBy, setCreatedBy] = useState("0")
    const [updatedBy, setUpdatedBy] = useState("0")
    const [data, setData] = useState<VendorPart[]>([])
    const [refresh, setRefresh] = useState(0)
    const { token } = useAuth()

    useEffect(() => {
        if (!token) return
        async function fetchData() {
            const result = await listVendorParts(token!)
            setData(result)
        }
        fetchData()
    }, [refresh, token])

    function handleReset() {
        setPartNo("")
        setDescription("")
        setIsPrimary(false)
        setPartId("")
        setVendorId("")
        setName("")
        setCreatedBy("0")
        setUpdatedBy("0")
    }

    const INPUT: CreateVendorPartInput = {
        part_id: partId,
        vendor_id: vendorId,
        name: name,
        part_no: partNo,
        description: description,
        is_primary: isPrimary,

        created_by: createdBy,
        updated_by: updatedBy
    }

    async function handleSubmit() {
        await createVendorPart(INPUT, token!)
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
            <SiteHeader title="Parts/Vendors"/>
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
                                        <FieldLabel htmlFor="vendor-id">Vendor Id</FieldLabel>
                                        <Input
                                            id="vendor-id"
                                            type="text"
                                            placeholder=""
                                            value={vendorId}
                                            onChange={(e) => setVendorId(e.target.value)}
                                        />
                                    </Field>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="name">Name</FieldLabel>
                                    <Input 
                                        id="name" 
                                        type="text"
                                        placeholder="" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="part-no">Part No.</FieldLabel>
                                    <Input 
                                        id="part-no" 
                                        type="text"
                                        placeholder="part-001" 
                                        value={partNo} 
                                        onChange={(e) => setPartNo(e.target.value)}
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
                                <Field orientation={"horizontal"}>
                                    <Checkbox
                                        id="is-primary"
                                        name="is-primary"
                                        checked={isPrimary}
                                        onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor="is-assembly">Is this the primary vendor?</FieldLabel>
                                        <FieldDescription>
                                            By clicking this checkbox, this vendor is considered the primary vendor.
                                        </FieldDescription>
                                    </FieldContent>
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