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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createColumns } from "./columns"
import { type PurchaseOrder, listPurchaseOrders, deletePurchaseOrder } from "@/apis/purchaseOrders"
import { type ColumnFiltersState } from "@tanstack/react-table"
import { CreatePurchaseOrderForm } from "@/components/forms/create-purchase-order-form"
import { FormSheet } from "@/components/sheets/FormSheet"
import { useAuth } from "@/context/authContext"


export default function Page() {
    const [purchaseOrderData, setPurchaseOrderData] = useState<PurchaseOrder[]>([])
    const [refresh, setRefresh] = useState(0)
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const [purchaseOrderSheetOpen, setPurchaseOrderSheetOpen] = useState(false)
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | undefined>()
    const { token } = useAuth()

    useEffect(() => {
        if (!token) return
        async function fetchData() {
            const result = await listPurchaseOrders(token!)
            setPurchaseOrderData(result)
        }
        fetchData()
    }, [refresh, token])

    const handleUpdate = () => {
        setRefresh(prev => prev + 1)        // refresh page
        setPurchaseOrderSheetOpen(false)    // closes sheet
        setSelectedPO(undefined)
    }

    async function handleDelete(poId: string) {
        await deletePurchaseOrder(poId, token!)
        setRefresh(prev => prev + 1)
    }

    function handleEdit(po: PurchaseOrder) {
        setSelectedPO(po)
        setPurchaseOrderSheetOpen(true)
    }

    const columns = createColumns({ onDelete: handleDelete, onEdit: handleEdit })

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
                <SiteHeader title="Purchase Orders" children={<Button onClick={() => setPurchaseOrderSheetOpen(true)}>Create a Purchase Order</Button>}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="px-4 lg:px-6 flex flex-col gap-3">
                                <div className="flex flex-row justify-between">
                                    <Input
                                        placeholder="Search purchase orders..."
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        className="w-[30%]"
                                    />
                                    <div className="flex flex-row gap-3">
                                        <Select onValueChange={(value) => setColumnFilters(prev =>
                                            value === "all"
                                                ? prev.filter(f => f.id !== "status")
                                                : [{ id: "status", value }]
                                        )}>
                                            <SelectTrigger className="w-fit">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="sent">Sent</SelectItem>
                                                    <SelectItem value="received">Received</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DataTable 
                                    columns={columns} 
                                    data={purchaseOrderData} 

                                    globalFilter={globalFilter}
                                    onGlobalFilterChange={setGlobalFilter}

                                    columnFilters={columnFilters}
                                    onColumnFiltersChange={setColumnFilters}
                                    />
                            </div>
                        </div>
                    </div>
                </div>

                <FormSheet
                    title={selectedPO ? "Update Purchase Order" : "Create a Purchase Order"}
                    description={selectedPO ? "Edit this purchase order's details." : "Create a new purchase order."}
                    open={purchaseOrderSheetOpen}
                    onOpenChange={(open) => { setPurchaseOrderSheetOpen(open); if (!open) setSelectedPO(undefined) }}
                    formId="create-purchase-order-form"
                >
                    <CreatePurchaseOrderForm
                        open={purchaseOrderSheetOpen}
                        onUpdate={handleUpdate}
                        formId="create-purchase-order-form"
                        purchaseOrder={selectedPO}
                    />
                </FormSheet>
            </SidebarInset>
        </SidebarProvider>
    )
}