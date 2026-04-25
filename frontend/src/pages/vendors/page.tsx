import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table-2"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { useEffect } from "react"
import { createVendor, type CreateVendorInput } from "@/apis/vendors"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { columns } from "./columns"
import { API_BASE } from "@/lib/api"
import { type Vendor } from "@/apis/vendors"


export default function Page() {
    const [vendorName, setVendorName] = useState("")
    const [createdBy, setCreatedBy] = useState("0")
    const [updatedBy, setUpdatedBy] = useState("0")
    const [data, setData] = useState<Vendor[]>([])
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`${API_BASE}/vendors`)
            const result = await res.json()
            setData(result)
        }
        fetchData()
    }, [refresh])

    function handleReset() {
        setVendorName("")
    }

    const INPUT: CreateVendorInput = {
        vendor_name: vendorName,

        created_by: createdBy,
        updated_by: updatedBy
    }

    async function handleSubmit() {
        await createVendor(INPUT)
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
            <SiteHeader title="Vendors"/>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-8">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="name">Name</FieldLabel>
                                    <Input 
                                        id="name" 
                                        type="text"
                                        placeholder="" 
                                        value={vendorName} 
                                        onChange={(e) => setVendorName(e.target.value)}
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