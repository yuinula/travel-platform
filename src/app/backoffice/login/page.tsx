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
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} className="" />
          <span className="text-2xl font-black tracking-[0.2em] text-zinc-900 font-rounded uppercase">
            Trip Butler
          </span>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-400 text-[9px] font-black tracking-[0.3em] uppercase shadow-sm">
          Backoffice Command Center
        </div>
      </div>

      <Card className="w-full max-w-md border-zinc-200 bg-white shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-3 text-center pt-10 pb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-1 shadow-inner border border-zinc-100">
            <ShieldAlert className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black text-zinc-900 uppercase tracking-widest font-rounded">Admin Gate</CardTitle>
          <CardDescription className="text-zinc-500 text-sm font-medium tracking-tight">Identity check required.</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] ml-1">Personnel ID</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin_id"
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 h-12 pl-12 rounded-xl focus-visible:ring-primary/20 text-sm font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] ml-1">Access Key</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 h-12 pl-12 rounded-xl focus-visible:ring-primary/20 text-sm font-bold"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-2xl text-lg font-black bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 mt-2"
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                <>
                  {t('submitButton')}
                  <ArrowRight className="ml-2 h-6 w-6" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-zinc-50 p-6 flex justify-center border-t border-zinc-100">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">© 2026 Trip Butler Global</p>
        </CardFooter>
      </Card>
    </div>
  )
}
