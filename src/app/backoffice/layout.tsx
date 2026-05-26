"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ShieldAlert, LayoutDashboard, Settings, LogOut, ChevronRight, User, Bell, ShieldCheck, KeyRound, ArrowRight, MapPin, Briefcase, Sun, Moon } from "lucide-react"
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
import { useTranslations } from "next-intl"

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Backoffice")
  const router = useRouter()
  const pathname = usePathname()
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const supabase = createClient()

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem("backoffice-theme") as "light" | "dark"
    if (savedTheme) setTheme(savedTheme)

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

  const toggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme)
    localStorage.setItem("backoffice-theme", newTheme)
  }

  if (pathname === "/backoffice/login") {
    return <>{children}</>
  }

  if (isAuth === null) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-bold tracking-widest uppercase text-xs animate-pulse">Initializing Security...</div>
  }

  const handleLogout = async () => {
    if (adminUser) {
      await supabase.from('system_log').insert([{
        admin_username: adminUser.username,
        action_type: 'LOGOUT',
        description: `Administrator ${adminUser.username} logged out.`
      }])
    }
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
      // Record log
      await supabase.from('system_log').insert([{
        admin_username: adminUser.username,
        action_type: 'CHANGE_PASSWORD',
        description: `Administrator ${adminUser.username} changed their own password.`
      }])

      toast.success("Password updated. Please log in again.")
      setIsPasswordOpen(false)
      setNewPassword("")
      
      setTimeout(() => {
        handleLogout()
      }, 1500)
    }
    setIsUpdating(false)
  }

  const sidebarLinks = [
    { name: t('sidebar.dashboard'), href: "/backoffice/dashboard", icon: <LayoutDashboard className="h-6 w-6" />, permId: 'dashboard' },
    { name: t('sidebar.adminPortal'), href: "/backoffice/admin", icon: <ShieldAlert className="h-6 w-6" />, permId: 'admin-portal' },
    { name: t('sidebar.manageLandmarks'), href: "/backoffice/landmarks", icon: <MapPin className="h-6 w-6" />, permId: 'manage-admins' },
    { name: t('sidebar.manageGuides'), href: "/backoffice/guides", icon: <Briefcase className="h-6 w-6" />, permId: 'manage-admins' },
    { name: t('sidebar.manageAdmins'), href: "/backoffice/admins", icon: <ShieldCheck className="h-6 w-6" />, permId: 'manage-admins' },
    { name: t('sidebar.systemLogs'), href: "/backoffice/logs", icon: <Settings className="h-6 w-6" />, permId: 'manage-admins' },
  ]

  const filteredLinks = sidebarLinks.filter(link => 
    adminUser?.permissions?.includes(link.permId) || adminUser?.role === 'Super Admin'
  )

  const isDark = theme === "dark"

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans transition-colors duration-300",
      isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Top Header */}
      <header className={cn(
        "h-24 border-b sticky top-0 z-50 flex items-center px-12 justify-between transition-colors",
        isDark ? "border-zinc-900 bg-zinc-950/50 backdrop-blur-xl" : "border-zinc-200 bg-white/80 backdrop-blur-xl"
      )}>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group mr-8">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} className={cn(isDark && "invert")} />
            <span className="font-black text-xl tracking-[0.2em] font-rounded ai-text-gradient uppercase">
              Trip Butler
            </span>
          </Link>
          <div className={cn("h-10 w-px hidden md:block", isDark ? "bg-zinc-800" : "bg-zinc-200")} />
          <div className="hidden md:flex items-center gap-3 ml-4">
            <span className={cn("text-xs font-black uppercase tracking-[0.3em]", isDark ? "text-zinc-500" : "text-zinc-400")}>{t('header.systemMode')}</span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary font-rounded">
              {adminUser?.role === 'Super Admin' ? t('header.fullAuthority') : t('header.restrictedAccess')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Theme Toggle */}
          <div className={cn("flex items-center p-1.5 rounded-full border shadow-inner", isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200")}>
             <button 
              onClick={() => toggleTheme("light")}
              className={cn("p-2 rounded-full transition-all", theme === "light" ? "bg-white text-primary shadow-md" : "text-zinc-500 hover:text-zinc-400")}
             >
                <Sun className="h-5 w-5" />
             </button>
             <button 
              onClick={() => toggleTheme("dark")}
              className={cn("p-2 rounded-full transition-all", theme === "dark" ? "bg-zinc-800 text-primary shadow-md" : "text-zinc-500 hover:text-zinc-700")}
             >
                <Moon className="h-5 w-5" />
             </button>
          </div>

          <Button variant="ghost" size="icon" className={cn("rounded-full h-12 w-12", isDark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-zinc-900")}>
            <Bell className="h-6 w-6" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className={cn(
                "flex items-center gap-4 pl-3 pr-6 py-2 rounded-full border transition-all focus:outline-none group shadow-lg",
                isDark ? "border-zinc-800 bg-zinc-900 hover:bg-zinc-800" : "border-zinc-200 bg-white hover:bg-zinc-50"
              )}>
                <Avatar className="h-10 w-10 border border-zinc-700">
                  <AvatarFallback className="bg-primary text-white text-sm font-black uppercase">
                    {adminUser?.username?.[0] ?? "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className={cn("text-sm font-black leading-none", isDark ? "text-white" : "text-zinc-900")}>{adminUser?.username || "administrator"}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mt-1.5">{adminUser?.role || "Admin"}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400 rotate-90 group-data-[state=open]:-rotate-90 transition-transform" />
              </button>
            } />
            <DropdownMenuContent align="end" className={cn(
              "w-64 rounded-[2rem] shadow-2xl p-3 border",
              isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
            )}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-5 py-4">
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">{t('header.accountSettings')}</p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className={isDark ? "bg-zinc-800" : "bg-zinc-100"} />
              <DropdownMenuItem onClick={() => router.push("/backoffice/dashboard")} className="rounded-2xl p-4 focus:bg-primary/10 focus:text-primary cursor-pointer font-bold text-base transition-colors">
                <LayoutDashboard className="mr-4 h-5 w-5" />
                {t('header.controlCenter')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPasswordOpen(true)} className="rounded-2xl p-4 focus:bg-primary/10 focus:text-primary cursor-pointer font-bold text-base transition-colors">
                <KeyRound className="mr-4 h-5 w-5" />
                {t('header.changePassword')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className={isDark ? "bg-zinc-800" : "bg-zinc-100"} />
              <DropdownMenuItem onClick={handleLogout} className="rounded-2xl p-4 focus:bg-red-500/10 focus:text-red-500 text-red-500 cursor-pointer font-bold mt-1 text-base transition-colors">
                <LogOut className="mr-4 h-5 w-5" />
                {t('header.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar */}
        <aside className={cn(
          "w-80 border-r flex flex-col p-8 space-y-8 transition-colors",
          isDark ? "border-zinc-900 bg-zinc-950" : "border-zinc-200 bg-white"
        )}>
          <nav className="flex-1 space-y-3">
            {filteredLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center justify-between p-5 rounded-[1.5rem] font-black text-base transition-all group",
                  pathname === link.href 
                    ? (isDark ? "bg-white text-zinc-950 shadow-white/5" : "bg-zinc-900 text-white shadow-xl") 
                    : (isDark ? "text-zinc-500 hover:text-white hover:bg-zinc-900" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100")
                )}
              >
                <div className="flex items-center gap-4">
                  {link.icon}
                  {link.name}
                </div>
                <ChevronRight className={cn("h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity", pathname === link.href && "opacity-100")} />
              </Link>
            ))}
          </nav>

          <div className={cn(
            "p-6 rounded-[2rem] border space-y-4 shadow-inner",
            isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-100"
          )}>
             <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{t('sidebar.nodeSecure')}</span>
             </div>
             <p className="text-[11px] text-zinc-500 font-bold leading-relaxed">
               {t('sidebar.securityAudit')}
             </p>
          </div>
        </aside>

        {/* Main Backoffice Content */}
        <main className={cn("flex-1 overflow-y-auto transition-colors", isDark ? "bg-zinc-950" : "bg-zinc-50")}>
          <div className="p-10 md:p-16 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className={cn(
          "max-w-lg p-12 rounded-[3.5rem] shadow-2xl backdrop-blur-xl border",
          isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}>
          <DialogHeader className="space-y-6">
            <div className="h-16 w-16 rounded-[2rem] bg-zinc-800 flex items-center justify-center mb-2">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase font-rounded tracking-widest">{t('header.changePassword')}</DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium text-lg">
              {t('header.accountSettings')} - <span className="text-primary font-bold">{adminUser?.username}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-10 space-y-8">
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">New Password</Label>
              <Input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={cn(
                  "h-16 px-8 rounded-2xl focus-visible:ring-primary/20 text-lg font-bold border",
                  isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                )}
                placeholder="••••••••"
              />
            </div>
            <Button 
              onClick={handleUpdatePassword} 
              disabled={isUpdating}
              className="w-full h-20 rounded-[1.5rem] font-black text-2xl shadow-xl shadow-primary/20 scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isUpdating ? "Updating..." : t('header.changePassword')}
              <ArrowRight className="ml-3 h-8 w-8" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
