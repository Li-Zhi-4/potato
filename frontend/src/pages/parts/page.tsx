import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table-2"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { useEffect } from "react"
import { createPart, type CreatePartInput, getPartsTable } from "@/apis/parts"
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
import {
    type ColumnFiltersState,
} from "@tanstack/react-table"
import { columns } from "./columns"
import { type Part } from "@/apis/parts"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { listVendors, type Vendor } from "@/apis/vendors"
import { CreatePartSheet } from "@/components/sheets/create-part-sheet"


export default function Page() {
    const [partNo, setPartNo] = useState("")
    const [description, setDescription] = useState("")
    const [isAssembly, setIsAssembly] = useState(false)
    const [workflowId, setWorkflowId] = useState("")
    const [createdBy, setCreatedBy] = useState("0")
    const [updatedBy, setUpdatedBy] = useState("0")
    const [data, setData] = useState<Part[]>([])
    const [refresh, setRefresh] = useState(0)

    const [globalFilter, setGlobalFilter] = useState("")
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [vendors, setVendors] = useState<Vendor[]>([])

    const [sheetOpen, setSheetOpen] = useState(false)

    useEffect(() => {
        async function fetchData() {
            const result = await getPartsTable()
            setData(result)

            const vendorList = await listVendors()
            setVendors(vendorList)
        }
        fetchData()
    }, [refresh])

    function handleReset() {
        setPartNo("")
        setDescription("")
        setIsAssembly(false)
        setWorkflowId("")
    }

    const INPUT: CreatePartInput = {
        part_no: partNo,
        description: description,
        is_assembly: isAssembly,
        workflow_id: workflowId,

        created_by: createdBy,
        updated_by: updatedBy
    }

    async function handleSubmit() {
        await createPart(INPUT)
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
                <SiteHeader title="Parts" children={<Button onClick={() => setSheetOpen(true)}>test</Button>}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="px-8">
                                <FieldGroup>
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
                                            id="is-assembly"
                                            name="is-assembly"
                                            checked={isAssembly}
                                            onCheckedChange={(checked) => setIsAssembly(checked as boolean)}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor="is-assembly">Is this an assembly?</FieldLabel>
                                            <FieldDescription>
                                                By clicking this checkbox, this part is considered an assembly.
                                            </FieldDescription>
                                        </FieldContent>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="workflow-id">Workflow Id</FieldLabel>
                                        <Input 
                                            id="workflow-id" 
                                            type="text"
                                            placeholder="123" 
                                            value={workflowId} 
                                            onChange={(e) => setWorkflowId(e.target.value)}
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
                            
                            <div className="px-4 lg:px-6 flex flex-col gap-3">
                                <div className="flex flex-row justify-between">
                                    <Input
                                        placeholder="Search parts..."
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        className="w-[30%]"
                                    />
                                    <div className="flex flex-row gap-3">
                                        <Select onValueChange={(value) => setColumnFilters(prev =>
                                            value === "all"
                                                ? prev.filter(f => f.id !== "is_assembly")
                                                : [...prev.filter(f => f.id !== "is_assembly"), { id: "is_assembly", value }]
                                        )}>
                                            <SelectTrigger className="w-fit">
                                                <SelectValue placeholder="Assembly" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="assembly">Assembly</SelectItem>
                                                    <SelectItem value="part">Part</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <Select onValueChange={(value) => setColumnFilters(prev =>
                                            value === "all"
                                                ? prev.filter(f => f.id !== "name")
                                                : [...prev.filter(f => f.id !== "name"), { id: "name", value }]
                                        )}>
                                            <SelectTrigger className="w-fit">
                                                <SelectValue placeholder="Vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">All</SelectItem>
                                                    {vendors.map((value) => (
                                                        <SelectItem key={value.vendor_id} value={value.name}>{value.name}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DataTable 
                                    columns={columns} 
                                    data={data}  

                                    globalFilter={globalFilter}
                                    onGlobalFilterChange={setGlobalFilter}

                                    columnFilters={columnFilters}
                                    onColumnFiltersChange={setColumnFilters}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
            <CreatePartSheet open={sheetOpen} onOpenChange={setSheetOpen}/>
        </SidebarProvider>
    )
}