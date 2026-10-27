import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { WhatsAppFloatingButton } from '../components/WhatsAppButton'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800 selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  )
}
