"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ShieldAlert, LayoutDashboard, Settings, LogOut, ChevronRight, User, Bell, ShieldCheck, KeyRound, ArrowRight } from "lucide-react"
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
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Basic check for demo
    const auth = localStorage.getItem("trip-butler-admin")
    const userData = localStorage.getItem("trip-butler-admin-user")
    
    if (!auth && pathname !== "/backoffice/login") {
      router.push("/backoffice/login")
      setIsAuth(false)
    } else {
      setIsAuth(true)
      if (userData) {
        setAdminUser(JSON.parse(userData))
      }
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
    localStorage.removeItem("trip-butler-admin-user")
    router.push("/backoffice/login")
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      toast.error("Password must be at least 4 characters")
      return
    }

    setIsUpdating(true)
    const { error } = await supabase
      .from('admins')
      .update({ password: newPassword })
      .eq('id', adminUser.id)

    if (error) {
      toast.error("Failed to update password")
    } else {
      toast.success("Password updated. Please log in again with your new credentials.")
      setIsPasswordOpen(false)
      setNewPassword("")
      
      // Automatic Logout
      setTimeout(() => {
        handleLogout()
      }, 1500)
    }
    setIsUpdating(false)
  }

  const sidebarLinks = [
    { name: "Dashboard", href: "/backoffice/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, permId: 'dashboard' },
    { name: "Admin Portal", href: "/backoffice/admin", icon: <ShieldAlert className="h-5 w-5" />, permId: 'admin-portal' },
    { name: "Manage Admins", href: "/backoffice/admins", icon: <ShieldCheck className="h-5 w-5" />, permId: 'manage-admins' },
  ]

  // Filter links based on current admin permissions
  const filteredLinks = sidebarLinks.filter(link => 
    adminUser?.permissions?.includes(link.permId)
  )

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
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary font-rounded">
              {adminUser?.role === 'Super Admin' ? 'Full Authority' : 'Restricted Access'}
            </span>
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
                  <AvatarFallback className="bg-primary text-white text-xs font-black uppercase">
                    {adminUser?.username?.[0] ?? "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-white leading-none">{adminUser?.username || "administrator"}</p>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter mt-1">{adminUser?.role || "Admin"}</p>
                </div>
                <ChevronRight className="h-3 w-3 text-zinc-600 rotate-90 group-data-[state=open]:-rotate-90 transition-transform" />
              </button>
            } />
            <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white rounded-2xl shadow-2xl p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-4 py-3">
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Account Settings</p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem onClick={() => router.push("/backoffice/dashboard")} className="rounded-xl p-3 focus:bg-zinc-800 focus:text-white cursor-pointer font-bold text-sm">
                <LayoutDashboard className="mr-3 h-4 w-4" />
                Control Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPasswordOpen(true)} className="rounded-xl p-3 focus:bg-zinc-800 focus:text-white cursor-pointer font-bold text-sm">
                <KeyRound className="mr-3 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem onClick={handleLogout} className="rounded-xl p-3 focus:bg-red-500/10 focus:text-red-500 text-red-400 cursor-pointer font-bold mt-1 text-sm">
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
            {filteredLinks.map((link) => (
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

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md p-10 rounded-[3rem] shadow-2xl backdrop-blur-xl">
          <DialogHeader className="space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-2">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase text-white font-rounded tracking-widest">Update Credentials</DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium">Set a new secure password for <span className="text-white font-bold">{adminUser?.username}</span></DialogDescription>
          </DialogHeader>
          
          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">New Password</Label>
              <Input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white h-14 px-6 rounded-2xl focus-visible:ring-primary/20"
                placeholder="••••••••"
              />
            </div>
            <Button 
              onClick={handleUpdatePassword} 
              disabled={isUpdating}
              className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isUpdating ? "Updating..." : "Update Password"}
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
