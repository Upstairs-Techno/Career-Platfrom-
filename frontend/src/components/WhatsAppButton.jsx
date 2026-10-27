import React from 'react'

export const WHATSAPP_NUMBER = '9370465576'
export const WHATSAPP_DISPLAY_PHONE = '+91 9370465576'
export const WHATSAPP_DEFAULT_MESSAGE =
  'Hey I want to do on-job training or internship. Can I know the process and all details?'

export const WHATSAPP_URL = `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_DEFAULT_MESSAGE
)}`

export function WhatsAppIcon({ className = 'w-5 h-5', size }) {
  const dimensionProps = size ? { width: size, height: size } : {}
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...dimensionProps}
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.66 20.16 9.3 19.8 8.1 19.09L7.81 18.92L4.69 19.74L5.52 16.7L5.33 16.4C4.55 15.16 4.14 13.72 4.14 11.91C4.14 7.37 7.84 3.67 12.05 3.67ZM8.73 7.39C8.57 7.39 8.31 7.45 8.08 7.7C7.86 7.95 7.23 8.54 7.23 9.75C7.23 10.96 8.11 12.13 8.24 12.3C8.36 12.47 9.94 14.9 12.39 15.96C14.43 16.84 14.84 16.66 15.29 16.62C15.74 16.58 16.73 16.03 16.94 15.45C17.15 14.86 17.15 14.36 17.08 14.25C17.02 14.15 16.86 14.09 16.62 13.97C16.38 13.85 15.19 13.26 14.97 13.18C14.75 13.1 14.59 13.06 14.43 13.3C14.27 13.55 13.81 14.09 13.67 14.25C13.53 14.41 13.39 14.43 13.15 14.31C12.91 14.19 12.13 13.93 11.21 13.11C10.5 12.48 10.02 11.7 9.9 11.49C9.78 11.29 9.89 11.17 10.01 11.05C10.12 10.94 10.26 10.76 10.38 10.62C10.5 10.48 10.54 10.38 10.62 10.21C10.7 10.05 10.66 9.91 10.6 9.79C10.54 9.67 10.08 8.54 9.89 8.08C9.7 7.64 9.51 7.7 9.37 7.69C9.23 7.69 9.07 7.39 8.73 7.39Z" />
    </svg>
  )
}

/**
 * Inline button for banners, contact cards, and call-to-actions.
 */
export function WhatsAppChatButton({
  label = 'Chat on WhatsApp',
  className = '',
  size = 'md',
}) {
  const sizeClasses =
    size === 'sm'
      ? 'px-3.5 py-2 text-xs gap-1.5'
      : size === 'lg'
      ? 'px-6 py-3.5 text-base gap-2.5 font-bold'
      : 'px-4 py-2.5 text-sm gap-2 font-semibold'

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with UPSTAIRS TECHNO on WhatsApp"
      className={`inline-flex items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm transition-all duration-200 hover:bg-[#20ba5a] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 ${sizeClasses} ${className}`}
    >
      <WhatsAppIcon className="shrink-0" size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
      <span>{label}</span>
    </a>
  )
}

/**
 * Floating WhatsApp button in the corner of student-facing pages.
 */
export function WhatsAppFloatingButton() {
  return (
    <aside aria-label="WhatsApp Contact Support" className="fixed bottom-6 right-6 z-40 group flex items-center">
      <div className="mr-3 hidden items-center rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-lg backdrop-blur-md sm:flex pointer-events-none opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-x-1">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
        Chat with us on WhatsApp
      </div>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with UPSTAIRS TECHNO on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-900/20 transition-all duration-300 hover:scale-110 hover:bg-[#20ba5a] hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        <WhatsAppIcon className="h-7 w-7" />
        <span className="sr-only">Chat on WhatsApp</span>
      </a>
    </aside>
  )
}

export default WhatsAppChatButton
