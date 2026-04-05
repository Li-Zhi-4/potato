import { Button } from "./components/ui/button"
import { getPart, listParts, createPart, updatePart, deletePart, type CreatePartInput } from "./apis/parts"
import { useEffect } from "react"

const CREATE_INPUT: CreatePartInput = {
  "part_no": "test-part-3",
  "description": "Vacuum pump",
  "is_assembly": false,
  "workflow_id": "WF-1",
  "created_by": "0",
  "updated_by": "0"
}

export function App() {
  useEffect(() => {
    async function test() {
      const res = await createPart(CREATE_INPUT)
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
