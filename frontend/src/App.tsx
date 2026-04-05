import { Button } from "./components/ui/button"
// import { getPart, listParts, createPart, updatePart, deletePart, type CreatePartInput, type UpdatePartInput } from "./apis/parts"
import { getVendor, listVendors, createVendor, updateVendor, deleteVendor, type CreateVendorInput, type UpdateVendorInput } from "./apis/vendors"
import { useEffect } from "react"

const CREATE_INPUT: CreateVendorInput = {
  "name": "The Rock Company",

  "created_by": "0",
  "updated_by": "0"
}

const UPDATE_INPUT: UpdateVendorInput = {
    "name": "The Wood Company",
    
    "updated_by": "0"
}

export function App() {
  useEffect(() => {
    async function test() {
      const res = await getVendor("d5be2712-415f-4b99-830f-205b923a636f")
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
