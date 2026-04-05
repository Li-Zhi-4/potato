import { Button } from "./components/ui/button"
import { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import Page from "./pages/dashboard/page"
import Parts from "./pages/parts/page"

export function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/parts" element={<Parts />} />
      </Routes>
    </>
  )
}

export default App
