"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl';
import { Button, buttonVariants } from "@/components/ui/button"
import { 
  MessageSquare, 
  User, 
  LogOut, 
  Briefcase, 
  Sparkles, 
  ShieldAlert, 
  Menu, 
  LogIn, 
  UserPlus, 
  Compass, 
  Calendar,
  Settings,
  ChevronDown
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LocaleSwitcher from "./locale-switcher"
import { cn } from "@/lib/utils"

interface UserProfile {
  email?: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
  }
}

export default function Navbar() {
  const t = useTranslations('Navbar');
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user as UserProfile | null)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user as UserProfile | null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const renderNavLinks = (mobile = false) => (
    <>
      <Link
        href="/explore"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          mobile 
            ? "p-4 rounded-xl bg-zinc-50 border border-transparent active:border-zinc-900" 
            : "text-muted-foreground"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {mobile && <Compass className="h-4 w-4 mr-3 text-zinc-500" />}
        {t('explore')}
      </Link>
      <Link
        href="/ai-planner"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          mobile 
            ? "p-4 rounded-xl bg-zinc-50 border border-transparent active:border-zinc-900" 
            : "text-muted-foreground"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {mobile ? (
          <Sparkles className="h-4 w-4 mr-3 text-zinc-500" />
        ) : (
          <Sparkles className="h-3 w-3 mr-1 text-zinc-500" />
        )}
        {t('aiPlanner')}
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-4 md:gap-10">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
              <SheetHeader className="p-6 text-left border-b bg-zinc-50/50">
                <SheetTitle className="font-bold text-xl tracking-widest flex items-center gap-2 font-rounded ai-text-gradient">
                  <Image src="/logo.svg" alt="Logo" width={24} height={24} className="dark:invert" />
                  {t('title')}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-3 p-6 mt-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 ml-1">
                  Menu
                </p>
                {renderNavLinks(true)}
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 ml-1 mt-6">
                  Account
                </p>
                {user ? (
                  <>
                    <Link
                      href="/itineraries"
                      className="flex items-center text-sm font-medium transition-colors p-4 rounded-xl bg-zinc-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Calendar className="h-4 w-4 mr-3 text-zinc-500" />
                      {t('myItineraries')}
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center text-sm font-medium transition-colors p-4 rounded-xl bg-zinc-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3 text-zinc-500" />
                      {t('profile')}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center text-sm font-medium transition-colors p-4 rounded-xl bg-zinc-50 text-red-500"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-red-500" />
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center text-sm font-medium transition-colors p-4 rounded-xl bg-zinc-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4 mr-3 text-zinc-500" />
                    {t('login')}
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2 group">
            <Image src="/logo.svg" alt="Logo" width={28} height={28} className="dark:invert transition-transform group-hover:scale-110" />
            <span className="inline-block font-bold text-xl tracking-widest font-rounded ai-text-gradient">
              {t('title')}
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {renderNavLinks()}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-4">
            <LocaleSwitcher />
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="flex items-center gap-2 p-1 pr-3 rounded-full border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all focus:outline-none group">
                  <Avatar className="h-8 w-8 border border-white">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name} />
                    <AvatarFallback className="bg-zinc-50 text-zinc-400 font-bold">{user.user_metadata?.name?.[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                </button>
              } />
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-zinc-100">
                <DropdownMenuLabel className="px-3 py-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('profile')}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push("/itineraries")} className="rounded-xl p-3 cursor-pointer font-bold">
                    <Calendar className="mr-3 h-4 w-4 text-zinc-500" />
                    {t('myItineraries')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="rounded-xl p-3 cursor-pointer font-bold">
                    <User className="mr-3 h-4 w-4 text-zinc-500" />
                    {t('profile')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 cursor-pointer font-bold text-red-500 focus:bg-red-50 focus:text-red-600">
                  <LogOut className="mr-3 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1 md:gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="px-2 md:px-4">
                  <LogIn className="h-5 w-5 md:hidden" />
                  <span className="hidden md:inline">{t('login')}</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="px-2 md:px-4">
                  <UserPlus className="h-5 w-5 md:hidden" />
                  <span className="hidden md:inline">{t('signup')}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
