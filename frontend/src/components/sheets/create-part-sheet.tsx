"use client"

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "../ui/button"
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import { useState, useEffect } from "react"
import { type Vendor, listVendors } from "@/apis/vendors"

interface CreatePartSheetProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
}

export function CreatePartSheet({ open, onOpenChange }: CreatePartSheetProps) {
    const [vendors, setVendors] = useState<Vendor[]>([])

    useEffect(() => {
        async function fetchData() {
            const vendorList = await listVendors()
            setVendors(vendorList)
        }
        fetchData()
    }, [])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>

                <SheetHeader className="border-b-1 border-neutral-200">
                    <SheetTitle>Create a Part</SheetTitle>
                    <SheetDescription>Create a part with a unique part number.</SheetDescription>
                </SheetHeader>

                <form id="create-part-form" action="/">
                    <FieldGroup className="p-6">
                        <FieldSet>
                            {/* Include this when more sets are added */}
                            {/* <FieldLegend>Part Info</FieldLegend>
                            <FieldDescription>Describe the part and its relevant information.</FieldDescription> */}
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="part-no">Part No.</FieldLabel>
                                    <Input 
                                        id="part-no"
                                        placeholder="Enter part number"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="description">Description</FieldLabel>
                                    <Textarea 
                                        id="description"
                                        placeholder="Enter part description"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>Primary Vendor</FieldLabel>
                                    <Select defaultValue="none">
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Vendors</SelectLabel>
                                                <SelectItem value="none">None</SelectItem>
                                                {vendors.map((value) => (
                                                    <SelectItem key={value.vendor_id} value={value.name}>{value.name}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field orientation={"horizontal"}>
                                    <Checkbox id="is-assembly" />
                                    <FieldContent>
                                        <FieldLabel htmlFor="is-assembly">Is this an assembly?</FieldLabel>
                                        <FieldDescription>
                                            By clicking this checkbox, this part is considered an assembly.
                                        </FieldDescription>
                                    </FieldContent>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                        {/* <FieldSeparator />
                        <FieldSet>
                            <FieldLegend>Workflow Info</FieldLegend>
                            <FieldDescription>Attach a workflow to this part.</FieldDescription>
                            <FieldGroup>
                                <FieldLabel htmlFor="workflow">Workflow Id</FieldLabel>
                                    <Input 
                                        id="workflow"
                                        placeholder="Enter a workflow id"
                                        required
                                    />
                            </FieldGroup>
                        </FieldSet> */}
                    </FieldGroup>
                </form>

                <SheetFooter className="border-t-1 border-neutral-200">
                    <Button type="submit" form="create-part-form">Save</Button>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}