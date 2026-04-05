import { Button } from "./components/ui/button"
// import { getPart, listParts, createPart, updatePart, deletePart, type CreatePartInput, type UpdatePartInput } from "./apis/parts"
// import { getVendor, listVendors, createVendor, updateVendor, deleteVendor, type CreateVendorInput, type UpdateVendorInput } from "./apis/vendors"
import { getPurchaseOrder, listPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, type CreatePurchaseOrderInput, type UpdatePurchaseOrderInput } from "./apis/purchaseOrders"
import { useEffect } from "react"

const CREATE_INPUT: CreatePurchaseOrderInput = {
  "purchase_order_no": 66666,
  "vendor_id": "946b548e-302d-4bea-9a28-6ecd4393f49e",
  "status": "draft",

  "created_by": "0",
  "updated_by": "0"
}

const UPDATE_INPUT: UpdatePurchaseOrderInput = {
  "purchase_order_no": 7777,
  "vendor_id": "946b548e-302d-4bea-9a28-6ecd4393f49e",
  "status": "sent",
  
  "updated_by": "0"
}

export function App() {
  useEffect(() => {
    async function test() {
      const res = await deletePurchaseOrder("fd0c755b-43f1-4d37-811c-e26b0f44ed6c")
      console.log(res)
    }
    test()
  }, [])
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}

export default App
