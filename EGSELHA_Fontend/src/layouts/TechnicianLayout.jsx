import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../component/Sidebar'
import Topbar from '../component/Topbar'
import Footer from '../component/Footer'
import Toast from '../component/Toast'
import { useTech } from '../context/TechnicianContext'

export default function TechnicianLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { dark } = useTech()

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="main">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <div className="content">
          <Outlet />
        </div>
        <Footer />
      </main>

      <Toast />
    </div>
  )
}
