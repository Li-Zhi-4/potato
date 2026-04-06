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

import { columns } from "./columns"
import { API_BASE } from "@/lib/api"
import { type PurchaseOrder, createPurchaseOrder, type CreatePurchaseOrderInput } from "@/apis/purchaseOrders"


export default function Page() {
    const [purchaseOrderNo, setPurchaseOrderNo] = useState(0)
    const [vendorId, setVendorId] = useState("")
    const [status, setStatus] = useState<'draft' | 'sent' | 'received' | 'cancelled'>("draft")
    const [createdBy, setCreatedBy] = useState("0")
    const [updatedBy, setUpdatedBy] = useState("0")
    const [data, setData] = useState<PurchaseOrder[]>([])
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`${API_BASE}/purchase_orders`)
            const result = await res.json()
            setData(result)
        }
        fetchData()
    }, [refresh])

    function handleReset() {
        setPurchaseOrderNo(0)
        setVendorId("")
        setStatus("draft")
    }

    const INPUT: CreatePurchaseOrderInput = {
        purchase_order_no: purchaseOrderNo,
        vendor_id: vendorId,
        status: status,

        created_by: createdBy,
        updated_by: updatedBy
    }

    async function handleSubmit() {
        await createPurchaseOrder(INPUT)
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
                                    <FieldLabel htmlFor="purchase-order-no">Purchase Order No.</FieldLabel>
                                    <Input 
                                        id="purchase-order-no" 
                                        type="number"
                                        placeholder="" 
                                        value={purchaseOrderNo} 
                                        onChange={(e) => setPurchaseOrderNo(Number(e.target.value))}
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
                                <Field>
                                    <Select value={status} onValueChange={(value) => setStatus(value as "draft" | "sent" | "received" | "cancelled")}>
                                        <SelectTrigger className="w-full max-w-48">
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                            <SelectLabel>Status</SelectLabel>
                                            <SelectItem value="draft">draft</SelectItem>
                                            <SelectItem value="sent">sent</SelectItem>
                                            <SelectItem value="received">received</SelectItem>
                                            <SelectItem value="cancelled">cancelled</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
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