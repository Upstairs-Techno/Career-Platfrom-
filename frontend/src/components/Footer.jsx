import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, Sparkles } from 'lucide-react'
import { WhatsAppIcon, WHATSAPP_URL } from './WhatsAppButton'

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200 bg-slate-50 text-slate-600">
      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-0.5 shadow-clay-pill">
                <img
                  src="/Upstairs Logo.jpeg"
                  alt="Upstairs Techno Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="block text-lg font-black tracking-tight text-slate-900 font-heading">UPSTAIRS TECHNO</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-blue-600">Innovate • Integrate • Elevate</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Empowering ambitious students and graduates through hands-on project experience, practical training, and real-world tech exposure.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 clay-pill clay-pill-accent text-xs font-bold font-heading">
              <Sparkles size={13} className="text-blue-600" /> Learn • Build • Grow
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Programs</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li><Link to="/ojt" className="transition hover:text-blue-600">On-the-Job Training (OJT)</Link></li>
              <li><Link to="/internship" className="transition hover:text-blue-600">Industry Internship</Link></li>
              <li><Link to="/ojt/apply" className="transition hover:text-blue-600">Apply for OJT</Link></li>
              <li><Link to="/internship/apply" className="transition hover:text-blue-600">Apply for Internship</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Track Focus</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li><span className="text-slate-700">Full Stack Web (React & Node)</span></li>
              <li><span className="text-slate-700">Java & Spring Boot</span></li>
              <li><span className="text-slate-700">Python, AI & Data Science</span></li>
              <li><span className="text-slate-700">Cybersecurity & Cloud</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Contact & Support</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <span>
                  OJT / Training Enquiries<br />
                  <a href="mailto:hr@upstairstechno.com" className="font-medium text-slate-800 transition hover:text-blue-600">hr@upstairstechno.com</a>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <span>
                  General Enquiries<br />
                  <a href="mailto:contact@upstairstechno.com" className="font-medium text-slate-800 transition hover:text-blue-600">contact@upstairstechno.com</a>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <a href="tel:+919370465576" className="font-medium text-slate-800 transition hover:text-blue-600">+91 9370465576</a>
              </li>
              <li className="flex items-start gap-2.5">
                <WhatsAppIcon className="mt-0.5 shrink-0 text-[#25D366] w-4 h-4" />
                <span>
                  WhatsApp Support<br />
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-slate-800 transition hover:text-[#25D366]"
                  >
                    +91 9370465576 (Chat Now)
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} UPSTAIRS TECHNO. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-500">
            Engineered for student career transformation.
          </p>
        </div>
      </div>
    </footer>
  )
}
