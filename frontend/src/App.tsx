import { Route, Routes } from "react-router-dom"
import Page from "./pages/dashboard/page"
import Parts from "./pages/parts/page"
import Vendors from "./pages/vendors/page"
import PurchaseOrders from "./pages/purchase order/page"
import BOMs from "./pages/boms/page"
import PartVendor from "./pages/part_vendors/pages"
import PartSubpart from "./pages/part_subparts/pages"
import Components from "./pages/components/pages"
import PartsInfo from "./pages/parts-info/page"
import BOMsInfo from "./pages/boms-info/page"

export function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/parts" element={<Parts />} />
        <Route path="/parts/:part_no/info" element={<PartsInfo />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/boms" element={<BOMs />} />
        <Route path="/boms/:job_no/info" element={<BOMsInfo />} />

        <Route path="/part-vendors" element={<PartVendor />} />
        <Route path="/part-subparts" element={<PartSubpart />} />
        <Route path="/components" element={<Components />} />
      </Routes>
    </>
  )
}

export default App
