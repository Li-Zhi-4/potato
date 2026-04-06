import { Button } from "./components/ui/button"
import { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import Page from "./pages/dashboard/page"
import Parts from "./pages/parts/page"
import Vendors from "./pages/vendors/page"
import PurchaseOrders from "./pages/purchase order/page"
import BOMs from "./pages/boms/page"

export function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/parts" element={<Parts />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/boms" element={<BOMs />} />
      </Routes>
    </>
  )
}

export default App
