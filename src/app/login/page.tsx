"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase"
import { Briefcase, User, ArrowRight } from "lucide-react"
import Footer from "@/components/footer"
import { cn } from "@/lib/utils"

function LoginForm() {
  const t = useTranslations('Auth.login')
  const [role, setRole] = useState<"traveler" | "guide">("traveler")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    router.push(role === 'guide' ? "/dashboard" : "/explore")
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    const getURL = () => {
      let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? 
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
        'http://localhost:3000/'
      url = url.includes('http') ? url : `https://${url}`
      url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
      return url
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    })
  }

  return (
    <Card className="w-full max-w-sm border-white/20 shadow-2xl overflow-hidden transition-all duration-300 bg-white/80 backdrop-blur-xl">
      <CardHeader className={cn("space-y-1 text-center py-5 transition-colors", role === 'guide' ? 'bg-zinc-900/90 text-white' : 'bg-transparent')}>
        <div className="flex justify-center mb-1">
          {role === 'guide' ? (
            <div className="p-2 bg-zinc-800 rounded-full">
              <Briefcase className="h-5 w-5 text-zinc-100" />
            </div>
          ) : (
            <div className="p-2 bg-zinc-100/80 rounded-full">
              <User className="h-5 w-5 text-zinc-900" />
            </div>
          )}
        </div>
        <CardTitle className="text-xl font-bold font-rounded">
          {role === 'guide' ? t('guideTitle') : t('travelerTitle')}
        </CardTitle>
        <CardDescription className={cn("text-[10px] font-bold uppercase tracking-widest", role === 'guide' ? 'text-zinc-400' : 'text-zinc-500')}>
          {role === 'guide' ? t('guideDesc') : t('travelerDesc')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4 px-8">
        {message && (
          <div className="p-2 text-[10px] bg-white/50 backdrop-blur-sm border border-white/20 rounded-md text-zinc-600 text-center font-bold">
            {message}
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full h-10 text-sm font-bold bg-white/80 hover:bg-white" 
          onClick={handleGoogleLogin}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {t('googleButton')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-100" />
          </div>
          <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.2em]">
            <span className="bg-white/10 backdrop-blur-md px-2 text-muted-foreground">{t('emailSeparator')}</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">{t('emailLabel')}</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 text-sm shadow-sm bg-white/50 border-white/20 rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password" className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">{t('passwordLabel')}</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 text-sm shadow-sm bg-white/50 border-white/20 rounded-xl"
            />
          </div>
          {error && <p className="text-[10px] text-red-500 font-bold px-1">{error}</p>}
          <Button type="submit" className="w-full h-11 text-base font-black bg-zinc-900 hover:bg-zinc-800 transition-all mt-2 rounded-xl" disabled={loading}>
            {loading ? t('loggingIn') : t('submitButton')}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3 !bg-white border-t border-zinc-100 py-6 mt-2 rounded-b-[2rem]">
        {role === 'traveler' ? (
          <button 
            onClick={() => setRole('guide')}
            className="flex items-center justify-between w-full p-3 rounded-xl border-2 border-zinc-100 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-900 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-zinc-900 text-white rounded-lg transition-colors">
                <Briefcase className="h-3.5 w-3.5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-[11px] text-black">{t('guideEntry.title')}</p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tight">{t('guideEntry.desc')}</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-black group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button 
            onClick={() => setRole('traveler')}
            className="text-[11px] font-black text-black hover:text-primary flex items-center gap-1 transition-colors uppercase tracking-widest"
          >
            ← {t('backToTraveler')}
          </button>
        )}

        <div className="text-[11px] text-center text-black font-bold pt-1">
          {t('noAccount')}{" "}
          <Link href={`/signup?role=${role}`} className="font-black ai-text-gradient underline underline-offset-4 decoration-primary/30 hover:decoration-primary">
            {t('signupLink')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="flex-1 container flex items-center justify-center py-4 mx-auto px-4">
        <Suspense fallback={<div className="text-white font-black animate-pulse uppercase tracking-[0.3em]">Initializing Identity Gate...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
