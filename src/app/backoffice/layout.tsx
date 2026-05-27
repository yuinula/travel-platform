"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ShieldAlert, LayoutDashboard, Settings, LogOut, ChevronRight, User, Bell, ShieldCheck, KeyRound, ArrowRight, MapPin, Briefcase, Sun, Moon, Receipt, PanelLeftClose, PanelLeftOpen } from "lucide-react"
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

// Create Theme Context for sub-pages
const BackofficeThemeContext = createContext<{ theme: "light" | "dark"; toggleTheme: (v: "light" | "dark") => void }>({
  theme: "dark",
  toggleTheme: () => {},
})

export const useBackofficeTheme = () => useContext(BackofficeThemeContext)

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("backoffice-sidebar-collapsed")
    if (savedCollapsed === "true") setIsSidebarCollapsed(true)

    const savedTheme = localStorage.getItem("backoffice-theme") as "light" | "dark"
    if (savedTheme) setTheme(savedTheme)

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

    document.title = "Trip Butler | 後台系統"
  }, [pathname, router])

  const handleToggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme)
    localStorage.setItem("backoffice-theme", newTheme)
  }

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem("backoffice-sidebar-collapsed", newState.toString())
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
    { name: t('sidebar.dashboard'), href: "/backoffice/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, permId: 'dashboard' },
    { name: t('sidebar.manageOrders'), href: "/backoffice/orders", icon: <Receipt className="h-5 w-5" />, permId: 'admin-portal' },
    { name: t('sidebar.manageLandmarks'), href: "/backoffice/landmarks", icon: <MapPin className="h-5 w-5" />, permId: 'manage-admins' },
    { name: t('sidebar.manageGuides'), href: "/backoffice/guides", icon: <Briefcase className="h-5 w-5" />, permId: 'manage-admins' },
    { name: t('sidebar.manageAdmins'), href: "/backoffice/admins", icon: <ShieldCheck className="h-5 w-5" />, permId: 'manage-admins' },
    { name: t('sidebar.systemLogs'), href: "/backoffice/logs", icon: <Settings className="h-5 w-5" />, permId: 'manage-admins' },
  ]

  const filteredLinks = sidebarLinks.filter(link => 
    adminUser?.permissions?.includes(link.permId) || adminUser?.role === 'Super Admin'
  )

  const isDark = theme === "dark"

  return (
    <BackofficeThemeContext.Provider value={{ theme, toggleTheme: handleToggleTheme }}>
      <div className={cn(
        "min-h-screen flex flex-col font-sans overscroll-none",
        isDark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
      )}>
        {/* Top Header - Specialized for Backoffice */}
        <header className={cn(
          "h-16 border-b sticky top-0 z-50 flex items-center px-6 justify-between",
          isDark ? "border-zinc-900 bg-zinc-950/50 backdrop-blur-xl" : "border-zinc-200 bg-white/80 backdrop-blur-xl"
        )}>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className={cn("h-10 w-10 text-zinc-500 hover:text-zinc-900 transition-colors", isDark && "hover:text-white")}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
            <Link href="/" className="flex items-center gap-2 mr-4">
              <Image src="/logo.svg" alt="Logo" width={24} height={24} className={cn(isDark && "invert")} />
              {!isSidebarCollapsed && (
                <span className="font-black text-lg tracking-[0.1em] font-rounded ai-text-gradient uppercase whitespace-nowrap">
                  Trip Butler
                </span>
              )}
            </Link>
            <div className={cn("h-6 w-px hidden md:block", isDark ? "bg-zinc-800" : "bg-zinc-200")} />
            {!isSidebarCollapsed && (
              <div className="hidden md:flex items-center gap-3 ml-4">
                <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDark ? "text-zinc-500" : "text-zinc-400")}>{t('header.systemMode')}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary font-rounded">
                  {adminUser?.role === 'Super Admin' ? t('header.fullAuthority') : t('header.restrictedAccess')}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className={cn("flex items-center p-1 rounded-full border shadow-inner", isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200")}>
               <button 
                onClick={() => handleToggleTheme("light")}
                className={cn("p-1.5 rounded-full transition-all", theme === "light" ? "bg-white text-primary shadow-md" : "text-zinc-500 hover:text-zinc-400")}
               >
                  <Sun className="h-4 w-4" />
               </button>
               <button 
                onClick={() => handleToggleTheme("dark")}
                className={cn("p-1.5 rounded-full transition-all", theme === "dark" ? "bg-zinc-800 text-primary shadow-md" : "text-zinc-500 hover:text-zinc-700")}
               >
                  <Moon className="h-4 w-4" />
               </button>
            </div>

            <Button variant="ghost" size="icon" className={cn("rounded-full h-10 w-10", isDark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-zinc-900")}>
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className={cn(
                  "flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border transition-all focus:outline-none group shadow-md",
                  isDark ? "border-zinc-800 bg-zinc-900 hover:bg-zinc-800" : "border-zinc-200 bg-white hover:bg-zinc-50"
                )}>
                  <Avatar className="h-8 w-8 border border-zinc-700">
                    <AvatarFallback className="bg-primary text-white text-[10px] font-black uppercase">
                      {adminUser?.username?.[0] ?? "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className={cn("text-xs font-black leading-none", isDark ? "text-white" : "text-zinc-900")}>{adminUser?.username || "admin"}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-zinc-400 rotate-90 group-data-[state=open]:-rotate-90 transition-transform" />
                </button>
              } />
              <DropdownMenuContent align="end" className={cn(
                "w-56 rounded-2xl shadow-2xl p-2 border",
                isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-4 py-3">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('header.accountSettings')}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className={isDark ? "bg-zinc-800" : "bg-zinc-100"} />
                <DropdownMenuItem onClick={() => router.push("/backoffice/dashboard")} className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary cursor-pointer font-bold text-sm transition-colors">
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  {t('header.controlCenter')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPasswordOpen(true)} className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary cursor-pointer font-bold text-sm transition-colors">
                  <KeyRound className="mr-3 h-4 w-4" />
                  {t('header.changePassword')}
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDark ? "bg-zinc-800" : "bg-zinc-100"} />
                <DropdownMenuItem onClick={handleLogout} className="rounded-xl p-3 focus:bg-red-500/10 focus:text-red-500 text-red-500 cursor-pointer font-bold mt-1 text-sm transition-colors">
                  <LogOut className="mr-3 h-4 w-4" />
                  {t('header.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Admin Sidebar */}
          <aside className={cn(
            "border-r flex flex-col transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "w-20" : "w-72",
            isDark ? "border-zinc-900 bg-zinc-950" : "border-zinc-200 bg-white"
          )}>
            <nav className="flex-1 p-4 space-y-2">
              {filteredLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  title={isSidebarCollapsed ? link.name : ""}
                  className={cn(
                    "flex items-center rounded-xl font-black text-sm transition-colors group",
                    isSidebarCollapsed ? "justify-center h-12 w-12 mx-auto" : "p-4 space-x-4",
                    pathname === link.href 
                      ? (isDark ? "bg-white text-zinc-950 shadow-white/5" : "bg-zinc-900 text-white shadow-lg") 
                      : (isDark ? "text-zinc-500 hover:text-white hover:bg-zinc-900" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100")
                  )}
                >
                  <div className={cn("shrink-0", isSidebarCollapsed ? "h-6 w-6" : "h-5 w-5")}>
                    {link.icon}
                  </div>
                  {!isSidebarCollapsed && <span className="truncate">{link.name}</span>}
                </Link>
              ))}
            </nav>

            {!isSidebarCollapsed && (
              <div className="p-6">
                <div className={cn(
                  "p-4 rounded-2xl border space-y-2",
                  isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-100"
                )}>
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('sidebar.nodeSecure')}</span>
                   </div>
                   <p className="text-[10px] text-zinc-500 font-bold leading-tight">
                     {t('sidebar.securityAudit')}
                   </p>
                </div>
              </div>
            )}
          </aside>

          {/* Main Backoffice Content */}
          <main className={cn("flex-1 overflow-y-auto", isDark ? "bg-zinc-950" : "bg-zinc-50")}>
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
          <DialogContent className={cn(
            "max-w-lg p-10 rounded-[3rem] shadow-2xl backdrop-blur-xl border",
            isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
          )}>
            <DialogHeader className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-2">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase text-white font-rounded tracking-widest">{t('header.changePassword')}</DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium text-base">
                {t('header.accountSettings')} - <span className="text-primary font-bold">{adminUser?.username}</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">New Password</Label>
                <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn(
                    "h-14 px-6 rounded-xl focus-visible:ring-primary/20 text-lg font-bold border",
                    isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-zinc-200 text-zinc-900"
                  )}
                  placeholder="••••••••"
                />
              </div>
              <Button 
                onClick={handleUpdatePassword} 
                disabled={isUpdating}
                className="w-full h-16 rounded-xl font-black text-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {isUpdating ? "Updating..." : t('header.changePassword')}
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </BackofficeThemeContext.Provider>
  )
}
