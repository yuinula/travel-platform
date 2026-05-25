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
import { Camera, Mail, Phone, User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
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

      // Use maybeSingle to avoid 406/404 errors if row doesn't exist
      const { data: profileData, error } = await supabase
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
        // If profile doesn't exist, use auth metadata as fallback
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
    // Calling an async function in useEffect is standard.
    // The lint error might be specific to some config. 
    // I'll wrap it in an async function inside to be safe.
    const init = async () => {
      await fetchProfile()
    }
    init()
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
          email: email // Keep email synced
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
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] mx-auto">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12 max-w-2xl mx-auto px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-center md:text-left">{t("title")}</h1>
          <p className="text-muted-foreground text-center md:text-left">{t("description")}</p>
        </div>

        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t("avatarLabel")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-zinc-100 shadow-xl text-zinc-400">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl bg-zinc-50">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-6 w-6" />
              </label>
              <input 
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
              {t("uploadButton")}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t("contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("nameLabel")}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("emailLabel")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  id="email" 
                  value={email} 
                  disabled
                  className="pl-10 h-11 bg-zinc-50 opacity-70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("phoneLabel")}
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    id="phone" 
                    value={phone} 
                    placeholder="+886 912 345 678"
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                {isPhoneVerified ? (
                  <Badge variant="outline" className="h-11 px-4 bg-green-50 text-green-700 border-green-200 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t("phoneVerified")}
                  </Badge>
                ) : (
                  <Button variant="outline" className="h-11 px-4 w-full sm:w-auto" onClick={startPhoneVerification}>
                    {t("verifyButton")}
                  </Button>
                )}
              </div>
              {!isPhoneVerified && phone && (
                <p className="text-[10px] text-amber-600 flex items-center gap-1 ml-1">
                  <AlertCircle className="h-3 w-3" />
                  {t("phoneUnverified")}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-zinc-50/50 border-t p-6">
            <Button className="w-full h-11 text-lg shadow-lg" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("saveButton")
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Sheet open={showOtpSheet} onOpenChange={setShowOtpSheet}>
        <SheetContent side="bottom" className="h-[400px] sm:h-[450px]">
          <div className="container max-w-md mx-auto py-8">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">{t("otpTitle")}</SheetTitle>
              <SheetDescription className="text-base pt-2">
                {t("otpDescription", { phone })}
              </SheetDescription>
            </SheetHeader>
            <div className="py-10 space-y-6 text-center">
              <Input 
                placeholder={t("otpPlaceholder")} 
                className="h-16 text-center text-3xl tracking-[0.5rem] md:tracking-[1rem] font-bold"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button className="w-full h-14 text-xl shadow-xl" onClick={verifyOtp} disabled={verifying}>
                {verifying ? <Loader2 className="h-6 w-6 animate-spin" /> : t("otpVerify")}
              </Button>
              <Button variant="ghost" className="w-full h-12 text-zinc-500" onClick={() => setShowOtpSheet(false)}>
                {t("otpCancel")}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
