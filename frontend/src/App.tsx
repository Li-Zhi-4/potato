import { Button } from "./components/ui/button"
import { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import Page from "./pages/dashboard/page"

export function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Page />} />
      </Routes>
    </>
  )
}

export default App
