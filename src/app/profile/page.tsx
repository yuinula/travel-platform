"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Mail, Phone, User, CheckCircle2, AlertCircle, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  phone_verified?: boolean;
}

export default function ProfilePage() {
  const t = useTranslations("Profile")
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)

  const [newPassword, setNewPassword] = useState("")
  const [isGoogleUser, setIsGoogleUser] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const [showOtpSheet, setShowOtpSheet] = useState(false)
  const [otp, setOtp] = useState("")
  const [verifying, setVerifying] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push("/login")
        return
      }
      
      setUserId(authUser.id)
      setEmail(authUser.email || "")
      setIsGoogleUser(authUser.app_metadata?.provider === 'google')

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle()

      if (profileData) {
        setName(profileData.name || "")
        setPhone(profileData.phone || "")
        setAvatarUrl(profileData.avatar_url || "")
        setIsPhoneVerified(profileData.phone_verified || false)
      } else {
        setName(authUser.user_metadata?.name || "")
        setAvatarUrl(authUser.user_metadata?.avatar_url || "")
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSave = async () => {
    if (!userId) return
    try {
      setSaving(true)
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          name,
          phone,
          avatar_url: avatarUrl,
          email: email
        })

      if (error) throw error

      await supabase.auth.updateUser({
        data: { name, avatar_url: avatarUrl }
      })

      toast.success(t("successMessage"))
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error(t("errorMessage"))
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      toast.error(t("security.passwordPlaceholder"))
      return
    }
    
    try {
      setUpdatingPassword(true)
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      toast.success(t("security.updateSuccess"))
      setNewPassword("")
    } catch (err) {
      toast.error(t("security.updateError"))
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return
    try {
      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      toast.success("Avatar uploaded successfully")
    } catch (err) {
      console.error(err)
      toast.error("Upload failed")
    }
  }

  const startPhoneVerification = async () => {
    if (!phone) {
      toast.error("Please enter a phone number first")
      return
    }
    
    try {
      setVerifying(true)
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      })
      if (error) throw error
      
      setShowOtpSheet(true)
      toast.success("Verification code sent")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error sending OTP"
      toast.error(message)
    } finally {
      setVerifying(false)
    }
  }

  const verifyOtp = async () => {
    if (!userId) return
    try {
      setVerifying(true)
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      })
      
      if (error) throw error

      await supabase
        .from("profiles")
        .update({ phone_verified: true })
        .eq("id", userId)

      setIsPhoneVerified(true)
      setShowOtpSheet(false)
      toast.success("Phone verified successfully")
    } catch (err) {
      console.error(err)
      toast.error(t("otpError"))
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] mx-auto font-black uppercase tracking-widest text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        Synchronizing...
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-20 max-w-2xl mx-auto px-4">
      <div className="space-y-12">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 font-rounded uppercase tracking-widest">{t("title")}</h1>
          <p className="text-zinc-500 font-bold text-lg mt-2">{t("description")}</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-zinc-50/50 border-b p-8">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-zinc-900 font-rounded">{t("avatarLabel")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-8 p-10">
            <div className="relative group">
              <Avatar className="h-40 w-40 border-8 border-white shadow-2xl transition-all duration-500">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback className="text-4xl bg-zinc-100 text-zinc-400 font-black uppercase">
                  {name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
              >
                <Camera className="h-8 w-8" />
              </label>
              <input 
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <Button variant="outline" className="rounded-xl px-8 font-black uppercase tracking-widest text-xs h-12" onClick={() => document.getElementById('avatar-upload')?.click()}>
              {t("uploadButton")}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-zinc-50/50 border-b p-8">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-zinc-900 font-rounded">{t("contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-10">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                {t("nameLabel")}
              </Label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="pl-14 h-14 rounded-2xl bg-zinc-50 border-zinc-100 font-bold text-lg focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                {t("emailLabel")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input 
                  id="email" 
                  value={email} 
                  disabled
                  className="pl-14 h-14 rounded-2xl bg-zinc-50 border-zinc-100 opacity-60 font-bold text-lg"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                {t("phoneLabel")}
              </Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <Input 
                    id="phone" 
                    value={phone} 
                    placeholder="+886 912 345 678"
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-14 h-14 rounded-2xl bg-zinc-50 border-zinc-100 font-bold text-lg focus:bg-white transition-all"
                  />
                </div>
                {isPhoneVerified ? (
                  <Badge variant="outline" className="h-14 px-6 rounded-2xl bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center justify-center font-black text-xs uppercase tracking-widest">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {t("phoneVerified")}
                  </Badge>
                ) : (
                  <Button variant="outline" className="h-14 px-8 w-full sm:w-auto rounded-2xl border-2 font-black uppercase tracking-widest text-xs" onClick={startPhoneVerification}>
                    {t("verifyButton")}
                  </Button>
                )}
              </div>
              {!isPhoneVerified && phone && (
                <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {t("phoneUnverified")}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-zinc-50/50 border-t p-10 mt-4">
            <Button className="w-full h-16 text-xl font-black ai-gradient rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("saveButton")
              )}
            </Button>
          </CardFooter>
        </Card>

        {!isGoogleUser && (
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white mt-12">
            <CardHeader className="bg-zinc-50/50 border-b p-8">
              <CardTitle className="text-xl font-black uppercase tracking-widest text-zinc-900 font-rounded">{t("security.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-10">
              <div className="space-y-3">
                <Label htmlFor="new-password" className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                  {t("security.passwordLabel")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <Input 
                    id="new-password" 
                    type="password"
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("security.passwordPlaceholder")}
                    className="pl-14 h-14 rounded-2xl bg-zinc-50 border-zinc-100 font-bold text-lg focus:bg-white transition-all"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-zinc-50/50 border-t p-10">
              <Button 
                variant="outline"
                className="w-full h-14 font-black uppercase tracking-widest text-xs rounded-2xl border-2 hover:bg-zinc-900 hover:text-white transition-all" 
                onClick={handlePasswordUpdate} 
                disabled={updatingPassword || !newPassword}
              >
                {updatingPassword ? t("saving") : t("security.updateButton")}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <Sheet open={showOtpSheet} onOpenChange={setShowOtpSheet}>
        <SheetContent side="bottom" className="h-[450px] border-t-0 bg-white/95 backdrop-blur-2xl rounded-t-[3rem] shadow-3xl">
          <div className="container max-w-md mx-auto py-10">
            <SheetHeader className="text-center md:text-center">
              <SheetTitle className="text-3xl font-black uppercase font-rounded tracking-widest ai-text-gradient">{t("otpTitle")}</SheetTitle>
              <SheetDescription className="text-zinc-500 font-bold text-base mt-2">
                {t("otpDescription", { phone })}
              </SheetDescription>
            </SheetHeader>
            <div className="py-12 space-y-8 text-center">
              <Input 
                placeholder={t("otpPlaceholder")} 
                className="h-20 text-center text-4xl tracking-[1rem] font-black border-none bg-zinc-50 rounded-[1.5rem] shadow-inner"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <div className="space-y-4">
                <Button className="w-full h-16 text-xl font-black ai-gradient rounded-2xl shadow-xl shadow-primary/20" onClick={verifyOtp} disabled={verifying}>
                  {verifying ? <Loader2 className="h-6 w-6 animate-spin" /> : t("otpVerify")}
                </Button>
                <Button variant="ghost" className="w-full h-12 text-zinc-400 font-black uppercase tracking-widest text-[10px]" onClick={() => setShowOtpSheet(false)}>
                  {t("otpCancel")}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
