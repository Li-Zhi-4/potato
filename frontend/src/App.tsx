import { Route, Routes } from "react-router-dom"
import Page from "./pages/dashboard/page"
import Parts from "./pages/parts/page"
import Vendors from "./pages/vendors/page"
import PurchaseOrders from "./pages/purchase order/page"
import BOMs from "./pages/boms/page"
import VendorPart from "./pages/vendor_parts/pages"
import AssemblyPart from "./pages/assembly_parts/pages"
import PartsInfo from "./pages/parts-info/page"
import BOMsInfo from "./pages/boms-info/page"
import Signup from "./pages/sign-up/page"
import Login from "./pages/login/page"

export function App() {

  return (
    <>
      <Routes>
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Page />} />
        <Route path="/parts" element={<Parts />} />
        <Route path="/parts/:part_no/info" element={<PartsInfo />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/boms" element={<BOMs />} />
        <Route path="/boms/:job_no/info" element={<BOMsInfo />} />

        <Route path="/part-vendors" element={<VendorPart />} />
        <Route path="/part-subparts" element={<AssemblyPart />} />
      </Routes>
    </>
  )
}

export default App
