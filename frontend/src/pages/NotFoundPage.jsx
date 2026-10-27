import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070C16] px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-1 shadow-md">
        <img src="/Upstairs Logo.jpeg" alt="Upstairs Techno" className="h-full w-full object-cover" />
      </div>
      <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 font-heading">404</p>
      <h1 className="mt-4 text-2xl font-black text-white font-heading">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-400">The page or resource you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="btn-primary mt-8 text-sm !px-6 !py-3">
        <Home size={16} /> Back to Home
      </Link>
    </div>
  )
}
