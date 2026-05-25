"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ShieldAlert, Lock, User, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { createClient } from "@/lib/supabase"
...
export default function BackofficeLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Query Supabase admins table
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (admin) {
        // Store session with full admin profile
        localStorage.setItem("trip-butler-admin", "true")
        localStorage.setItem("trip-butler-admin-user", JSON.stringify(admin))
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="mb-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} className="invert" />
          <span className="text-3xl font-black tracking-[0.2em] text-white font-rounded uppercase">
            Trip Butler
          </span>
        </div>
        <div className="px-4 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-black tracking-widest uppercase">
          Backoffice System
        </div>
      </div>

      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-2 text-center pt-10">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-zinc-800 flex items-center justify-center mb-2">
            <ShieldAlert className="h-8 w-8 text-zinc-100" />
          </div>
          <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Admin Gate</CardTitle>
          <CardDescription className="text-zinc-500 font-medium">Authorized personnel only</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest ml-1">Username</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                <Input 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="adminstrator"
                  className="bg-zinc-800 border-zinc-700 text-white h-14 pl-12 rounded-2xl focus-visible:ring-zinc-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                <Input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-800 border-zinc-700 text-white h-14 pl-12 rounded-2xl focus-visible:ring-zinc-600"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 rounded-2xl text-xl font-black bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
            >
              {loading ? "Authenticating..." : "Login to Backoffice"}
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-zinc-800/50 p-6 flex justify-center border-t border-zinc-800">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">© 2026 Trip Butler Global Ops</p>
        </CardFooter>
      </Card>
    </div>
  )
}
