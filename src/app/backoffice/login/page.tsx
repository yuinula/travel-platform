"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ShieldAlert, Lock, User, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { createClient } from "@/lib/supabase"

export default function BackofficeLoginPage() {
  const t = useTranslations("Auth.login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (admin) {
        await supabase.from('system_log').insert([{
          admin_username: admin.username,
          action_type: 'LOGIN',
          description: `Administrator ${admin.username} logged in successfully.`
        }])

        localStorage.setItem("trip-butler-admin", "true")
        localStorage.setItem("trip-butler-admin-user", JSON.stringify({
          id: admin.id,
          username: admin.username,
          role: admin.role,
          permissions: admin.permissions
        }))
        toast.success(`Welcome back, ${admin.username}`)
        router.push("/backoffice/dashboard")
      } else {
        toast.error("Invalid credentials. Access denied.")
      }
    } catch (err) {
      toast.error("Security system unavailable")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="mb-16 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-4">
          <Image src="/logo.svg" alt="Logo" width={56} height={56} className="invert" />
          <span className="text-4xl font-black tracking-[0.2em] text-white font-rounded uppercase italic">
            Trip Butler
          </span>
        </div>
        <div className="px-6 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-black tracking-[0.3em] uppercase">
          Backoffice Command Center
        </div>
      </div>

      <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900 shadow-3xl rounded-[3.5rem] overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-16 pb-10">
          <div className="mx-auto w-20 h-20 rounded-[2rem] bg-zinc-800 flex items-center justify-center mb-2 shadow-inner border border-zinc-700">
            <ShieldAlert className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black text-white uppercase tracking-widest font-rounded italic">Admin Gate</CardTitle>
          <CardDescription className="text-zinc-500 text-lg font-medium tracking-tight">Authorized personnel only. Identity check required.</CardDescription>
        </CardHeader>
        <CardContent className="px-12 pb-16">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-zinc-500 font-black uppercase text-[11px] tracking-[0.3em] ml-1">Personnel ID</Label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-600" />
                <Input 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin_id"
                  className="bg-zinc-800 border-zinc-700 text-white h-16 pl-14 rounded-2xl focus-visible:ring-primary/20 text-lg font-bold"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-zinc-500 font-black uppercase text-[11px] tracking-[0.3em] ml-1">Access Key</Label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-600" />
                <Input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-800 border-zinc-700 text-white h-16 pl-14 rounded-2xl focus-visible:ring-primary/20 text-lg font-bold"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-20 rounded-[1.5rem] text-2xl font-black bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 mt-4"
            >
              {loading ? <Loader2 className="animate-spin h-8 w-8" /> : (
                <>
                  {t('submitButton')}
                  <ArrowRight className="ml-3 h-8 w-8" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-zinc-950/50 p-8 flex justify-center border-t border-zinc-800">
          <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.5em]">© 2026 Trip Butler Global Operations</p>
        </CardFooter>
      </Card>
    </div>
  )
}
