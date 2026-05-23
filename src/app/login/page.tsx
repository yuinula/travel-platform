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
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <Card className="w-full max-w-md border-white/20 shadow-2xl overflow-hidden transition-all duration-300 bg-white/80 backdrop-blur-xl">
      <CardHeader className={`space-y-1 text-center py-8 ${role === 'guide' ? 'bg-zinc-900/90 text-white' : 'bg-transparent'}`}>
        <div className="flex justify-center mb-2">
          {role === 'guide' ? (
            <div className="p-3 bg-zinc-800 rounded-full">
              <Briefcase className="h-6 w-6 text-zinc-100" />
            </div>
          ) : (
            <div className="p-3 bg-zinc-100/80 rounded-full">
              <User className="h-6 w-6 text-zinc-900" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-bold font-rounded">
          {role === 'guide' ? t('guideTitle') : t('travelerTitle')}
        </CardTitle>
        <CardDescription className={role === 'guide' ? 'text-zinc-400' : ''}>
          {role === 'guide' ? t('guideDesc') : t('travelerDesc')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {message && (
          <div className="p-3 text-sm bg-white/50 backdrop-blur-sm border border-white/20 rounded-md text-zinc-600 text-center">
            {message}
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full h-11 font-medium bg-white/80 hover:bg-white" 
          onClick={handleGoogleLogin}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t('googleButton')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-muted-foreground">{t('emailSeparator')}</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-700">{t('emailLabel')}</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 shadow-sm bg-white/50 border-white/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-700">{t('passwordLabel')}</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 shadow-sm bg-white/50 border-white/20"
            />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <Button type="submit" className={`w-full h-11 text-lg ${role === 'guide' ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-900 hover:bg-zinc-800 text-white'}`} disabled={loading}>
            {loading ? t('loggingIn') : t('submitButton')}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 !bg-white border-t border-zinc-200 py-8 mt-4 rounded-b-[2.5rem]">
        {role === 'traveler' ? (
          <button 
            onClick={() => setRole('guide')}
            className="flex items-center justify-between w-full p-4 rounded-xl border-2 border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-900 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 text-white rounded-lg transition-colors">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-black">{t('guideEntry.title')}</p>
                <p className="text-xs text-zinc-600 font-bold">{t('guideEntry.desc')}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button 
            onClick={() => setRole('traveler')}
            className="text-sm font-black text-black hover:text-primary flex items-center gap-1"
          >
            ← {t('backToTraveler')}
          </button>
        )}

        <div className="text-sm text-center text-black font-bold pt-2">
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
      <div className="flex-1 container flex items-center justify-center py-12 mx-auto px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}
