"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ShieldAlert, LayoutDashboard, Settings, LogOut, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuth, setIsAuth] = useState<boolean | null>(null)

  useEffect(() => {
    // Basic check for demo
    const auth = localStorage.getItem("trip-butler-admin")
    if (!auth && pathname !== "/backoffice/login") {
      router.push("/backoffice/login")
      setIsAuth(false)
    } else {
      setIsAuth(true)
    }
  }, [pathname, router])

  if (pathname === "/backoffice/login") {
    return <>{children}</>
  }

  if (isAuth === null) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-bold tracking-widest uppercase text-xs animate-pulse">Initializing Security...</div>
  }

  const handleLogout = () => {
    localStorage.removeItem("trip-butler-admin")
    router.push("/backoffice/login")
  }

  const sidebarLinks = [
    { name: "Dashboard", href: "/backoffice/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Admin Portal", href: "/backoffice/admin", icon: <ShieldAlert className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Admin Sidebar */}
      <aside className="w-80 border-r border-zinc-900 flex flex-col p-6 space-y-10">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 ai-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
             <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black font-rounded tracking-widest uppercase ai-text-gradient">Ops Center</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Management v1.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl font-bold transition-all group",
                pathname === link.href ? "bg-white text-zinc-950 shadow-xl shadow-white/5" : "text-zinc-500 hover:text-white hover:bg-zinc-900"
              )}
            >
              <div className="flex items-center gap-3">
                {link.icon}
                {link.name}
              </div>
              <ChevronRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity", pathname === link.href && "opacity-100")} />
            </Link>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut className="h-5 w-5" />
          Terminate Session
        </button>
      </aside>

      {/* Main Backoffice Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
