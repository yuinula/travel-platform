"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ShieldAlert, LayoutDashboard, Settings, LogOut, ChevronRight, User, Bell, ShieldCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

    // Set page title for backoffice
    document.title = "Trip Butler | 後台系統"
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
    { name: "Manage Admins", href: "/backoffice/admins", icon: <ShieldCheck className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Header - Specialized for Backoffice */}
      <header className="h-20 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50 flex items-center px-8 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group mr-8">
            <Image src="/logo.svg" alt="Logo" width={28} height={28} className="invert transition-transform group-hover:scale-110" />
            <span className="font-black text-lg tracking-[0.2em] font-rounded ai-text-gradient uppercase">
              Trip Butler
            </span>
          </Link>
          <div className="h-8 w-px bg-zinc-800 hidden md:block" />
          <div className="hidden md:flex items-center gap-2 ml-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">System Mode:</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary font-rounded">Full Authority</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-all focus:outline-none group">
                <Avatar className="h-8 w-8 border border-zinc-700">
                  <AvatarFallback className="bg-primary text-white text-xs font-black uppercase">AD</AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-white leading-none">admin01</p>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter mt-1">Super Admin</p>
                </div>
                <ChevronRight className="h-3 w-3 text-zinc-600 rotate-90 group-data-[state=open]:-rotate-90 transition-transform" />
              </button>
            } />
            <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white rounded-2xl shadow-2xl p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-4 py-3">
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Administrator</p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem onClick={() => router.push("/backoffice/dashboard")} className="rounded-xl p-3 focus:bg-zinc-800 focus:text-white cursor-pointer font-bold">
                <LayoutDashboard className="mr-3 h-4 w-4" />
                Control Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="rounded-xl p-3 focus:bg-red-500/10 focus:text-red-500 text-red-400 cursor-pointer font-bold mt-1">
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="w-80 border-r border-zinc-900 flex flex-col p-6 space-y-6 bg-zinc-950">
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

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Node Secure</span>
             </div>
             <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
               Current session is encrypted and monitored for security audit.
             </p>
          </div>
        </aside>

        {/* Main Backoffice Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          <div className="p-8 md:p-12 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
