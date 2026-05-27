"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Plus,
  MapPin, 
  Trash2, 
  Edit2, 
  Loader2, 
  Star,
  Languages,
  DollarSign,
  Briefcase,
  User,
  ShieldCheck,
  Check,
  X,
  Globe,
  ChevronRight,
  ChevronDown,
  Lock
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useBackofficeTheme } from "../layout"

interface Guide {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  guide_profiles: {
    bio: string;
    languages: string[];
    service_areas: string[];
    hourly_rate: number;
    rating_avg: number;
    review_count: number;
    is_available: boolean;
  } | null;
}

const AVAILABLE_LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Mandarin", label: "Mandarin (中文)" },
  { value: "Japanese", label: "Japanese (日本語)" },
  { value: "French", label: "French (Français)" },
  { value: "German", label: "German (Deutsch)" },
  { value: "Spanish", label: "Spanish (Español)" },
  { value: "Korean", label: "Korean (한국어)" },
  { value: "Cantonese", label: "Cantonese (廣東話)" },
  { value: "Thai", label: "Thai (ไทย)" },
  { value: "Vietnamese", label: "Vietnamese (Tiếng Việt)" }
]

export default function ManageGuidesPage() {
  const t = useTranslations("Backoffice.guides")
  const { theme } = useBackofficeTheme()
  const isDark = theme === "dark"
  const supabase = createClient()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Edit/Add State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null)
  const [resetPassword, setResetPassword] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "welcome888",
    bio: "",
    languages: [] as string[],
    service_areas: "",
    hourly_rate: 0,
    is_available: true
  })

  const fetchGuides = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select(`
        id, name, email, avatar_url,
        guide_profiles (
          bio, languages, service_areas, hourly_rate, rating_avg, review_count, is_available
        )
      `)
      .eq('role', 'guide')
      .order('created_at', { ascending: false })
    
    if (data) setGuides(data as any)
    setLoading(false)
  }

  useEffect(() => {
    fetchGuides()
  }, [])

  const logAction = async (action: string, desc: string, details?: any) => {
    const adminStr = localStorage.getItem("trip-butler-admin-user")
    const admin = adminStr ? JSON.parse(adminStr) : { username: "Unknown" }
    await supabase.from('system_log').insert([{
      admin_username: admin.username,
      action_type: action,
      description: desc,
      details: details
    }])
  }

  const handleUpdateGuide = async () => {
    if (!editingGuide) return

    const payload = {
      bio: formData.bio,
      languages: formData.languages,
      service_areas: formData.service_areas.split(',').map(s => s.trim()).filter(s => s),
      hourly_rate: formData.hourly_rate,
      is_available: formData.is_available
    }

    const { error } = await supabase
      .from('guide_profiles')
      .upsert({ user_id: editingGuide.id, ...payload })

    if (error) {
      toast.error("Failed to update guide profile")
    } else {
      toast.success("Guide profile updated")
      await logAction('EDIT_GUIDE', `Updated guide profile for: ${editingGuide.name}`, { guide_id: editingGuide.id })
      setIsEditOpen(false)
      fetchGuides()
    }
  }

  const handleCreateGuide = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error("Required fields missing")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/backoffice/create-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service_areas: formData.service_areas.split(',').map(s => s.trim()).filter(s => s)
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create guide")
      }

      toast.success(`Guide ${formData.name} created!`)
      await logAction('CREATE_GUIDE', `Created new guide (Admin API): ${formData.name}`, { email: formData.email })
      
      setIsAddOpen(false)
      resetForm()
      fetchGuides()
    } catch (err: any) {
      toast.error(err.message || "Error creating guide")
    } finally {
      setLoading(false)
    }
  }

  const handleForceResetPassword = async () => {
    if (!editingGuide || !resetPassword) return
    if (resetPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsResetting(true)
    try {
      const response = await fetch('/api/backoffice/update-guide-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingGuide.id, newPassword: resetPassword })
      })
      const res = await response.json()
      if (res.success) {
        toast.success(t('form.resetSuccess'))
        setResetPassword("")
        await logAction('RESET_PASSWORD', `Force reset password for guide: ${editingGuide.name}`, { guide_id: editingGuide.id })
      } else {
        throw new Error(res.error)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password")
    } finally {
      setIsResetting(false)
    }
  }

  const openEdit = (g: Guide) => {
    setEditingGuide(g)
    setFormData({
      name: g.name,
      email: g.email,
      password: "",
      bio: g.guide_profiles?.bio || "",
      languages: g.guide_profiles?.languages?.map(l => l.split(' (')[0]) || [],
      service_areas: g.guide_profiles?.service_areas?.join(', ') || "",
      hourly_rate: g.guide_profiles?.hourly_rate || 0,
      is_available: g.guide_profiles?.is_available ?? true
    })
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "welcome888",
      bio: "",
      languages: [],
      service_areas: "",
      hourly_rate: 0,
      is_available: true
    })
    setEditingGuide(null)
    setResetPassword("")
  }

  const toggleLanguage = (langValue: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(langValue)
        ? prev.languages.filter(l => l !== langValue)
        : [...prev.languages, langValue]
    }))
  }

  const filtered = guides.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.guide_profiles?.service_areas?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={cn(
            "text-2xl font-black tracking-tight uppercase tracking-widest font-rounded transition-colors",
            isDark ? "text-white" : "text-zinc-900"
          )}>{t('title')}</h1>
          <p className="text-zinc-500 font-bold text-sm">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-48 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder={t('searchPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "border h-10 rounded-xl pl-10 text-sm font-medium transition-all focus-visible:ring-primary/20",
                isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )} 
            />
          </div>
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="h-10 rounded-xl ai-gradient px-4 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            {t('addNew')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading && guides.length === 0 ? (
          [1,2,3].map(i => <div key={i} className={cn("h-24 rounded-[1.5rem] animate-pulse", isDark ? "bg-zinc-900" : "bg-zinc-200")} />)
        ) : filtered.length === 0 ? (
          <div className={cn(
            "text-center py-20 rounded-[3rem] border-2 border-dashed transition-colors",
            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
          )}>
             <Briefcase className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
             <p className="text-zinc-400 font-black text-xl uppercase tracking-widest">No guides found.</p>
          </div>
        ) : (
          filtered.map(guide => (
            <Card key={guide.id} className={cn(
              "rounded-[2rem] overflow-hidden group border",
              isDark ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50" : "bg-white border-zinc-200 hover:bg-zinc-50"
            )}>
              <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex items-center gap-6 min-w-[280px]">
                  <Avatar className="h-16 w-14 rounded-xl border-2 shadow-xl" style={{ borderColor: isDark ? '#27272a' : '#f4f4f5' }}>
                    <AvatarImage src={guide.avatar_url} className="object-cover" />
                    <AvatarFallback className={isDark ? "bg-zinc-800 text-zinc-500" : "bg-zinc-100 text-zinc-400 text-xs font-black"}>
                      {guide.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className={cn("text-xl font-black font-rounded transition-colors", isDark ? "text-white" : "text-zinc-900")}>{guide.name}</h3>
                    <p className="text-zinc-500 text-xs font-bold truncate max-w-[180px]">{guide.email}</p>
                  </div>
                </div>

                <div className={cn(
                  "flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 lg:border-x lg:px-8 transition-colors",
                  isDark ? "border-zinc-800" : "border-zinc-100"
                )}>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{t('table.rating')}</p>
                    <div className="flex items-center gap-1.5 text-amber-500 font-black text-lg">
                       <Star className="h-4 w-4 fill-current" />
                       {guide.guide_profiles?.rating_avg || 0} <span className="text-[10px] text-zinc-400 font-bold">({guide.guide_profiles?.review_count || 0})</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{t('table.hourlyRate')}</p>
                    <p className={cn("font-black text-lg transition-colors", isDark ? "text-white" : "text-zinc-900")}>${guide.guide_profiles?.hourly_rate || 0}<span className="text-[10px] text-zinc-400 font-bold ml-1">/hr</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{t('table.areas')}</p>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                       <MapPin className="h-4 w-4 text-primary" />
                       <p className="text-sm font-bold truncate max-w-[140px]">{guide.guide_profiles?.service_areas?.join(', ') || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{t('table.status')}</p>
                    <Badge className={cn(
                      "rounded-full px-4 py-0.5 text-[8px] font-black uppercase tracking-widest border-none shadow-sm",
                      guide.guide_profiles?.is_available 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : (isDark ? "bg-zinc-800 text-zinc-500" : "bg-zinc-100 text-zinc-400")
                    )}>
                      {guide.guide_profiles?.is_available ? t('table.available') : t('table.busy')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => openEdit(guide)} variant="outline" className={cn(
                    "h-12 w-12 rounded-xl border transition-all shadow-md",
                    isDark ? "border-zinc-800 bg-zinc-950 hover:bg-zinc-800" : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900"
                  )}>
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditOpen || isAddOpen} onOpenChange={(val) => { if(!val) { setIsEditOpen(false); setIsAddOpen(false); resetForm(); }}}>
        <DialogContent className={cn(
          "max-w-2xl p-8 rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-2xl border transition-colors",
          isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}>
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-black uppercase font-rounded tracking-widest ai-text-gradient">
              {isAddOpen ? t('addNew') : t('editGuide')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 mt-6 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
            {isAddOpen && (
              <div className={cn(
                "grid grid-cols-2 gap-4 p-6 rounded-[2rem] border mb-6 transition-colors",
                isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-100"
              )}>
                 <div className="col-span-2">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="h-4 w-4 text-primary" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('form.accountCredentials')}</p>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.fullName')}</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={cn("rounded-xl h-11 px-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</Label>
                    <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={cn("rounded-xl h-11 px-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.initialPassword')}</Label>
                    <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={cn("rounded-xl h-11 px-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} />
                 </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.bio')}</Label>
              <textarea 
                value={formData.bio} 
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className={cn(
                  "w-full rounded-xl p-6 text-sm font-medium min-h-[120px] focus:outline-none focus:ring-1 focus:ring-primary/20 leading-relaxed border",
                  isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.languages')}</Label>
                 <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="outline" className={cn(
                        "w-full h-11 rounded-xl px-4 flex justify-between items-center text-sm font-bold border",
                        isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-zinc-200 text-zinc-900"
                      )}>
                        <div className="flex items-center gap-2 truncate">
                          <Globe className="h-4 w-4 text-zinc-500" />
                          <span className="truncate">
                            {formData.languages.length > 0 
                              ? formData.languages.map(val => AVAILABLE_LANGUAGES.find(l => l.value === val)?.label || val).join(', ') 
                              : "Select..."}
                          </span>
                        </div>
                        <ChevronDown className="h-3 w-3 text-zinc-500" />
                      </Button>
                    } />
                    <DropdownMenuContent align="start" className={cn(
                      "w-64 rounded-xl p-2 shadow-2xl border",
                      isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-zinc-200 text-zinc-900"
                    )}>
                      {AVAILABLE_LANGUAGES.map(lang => (
                        <DropdownMenuCheckboxItem
                          key={lang.value}
                          checked={formData.languages.includes(lang.value)}
                          onCheckedChange={() => toggleLanguage(lang.value)}
                          className="rounded-lg p-2.5 cursor-pointer font-bold text-xs"
                        >
                          {lang.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                 </DropdownMenu>
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('hourlyRate')} (USD)</Label>
                 <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input type="number" value={formData.hourly_rate} onChange={e => setFormData({...formData, hourly_rate: parseInt(e.target.value) || 0})} className={cn("rounded-xl h-11 pl-10 pr-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} />
                 </div>
               </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.serviceAreas')}</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input value={formData.service_areas} onChange={e => setFormData({...formData, service_areas: e.target.value})} className={cn("rounded-xl h-11 pl-10 pr-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} placeholder="Taipei, Tokyo..." />
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-4 py-4 rounded-[2rem] px-8 border transition-colors",
              isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-100"
            )}>
               <Button 
                onClick={() => setFormData({...formData, is_available: !formData.is_available})}
                variant="outline" 
                className={cn(
                  "rounded-xl border h-11 px-8 font-black text-[10px] uppercase tracking-widest gap-2 transition-all",
                  formData.is_available ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-md" : (isDark ? "bg-zinc-800 text-zinc-500 border-zinc-700" : "bg-zinc-100 text-zinc-400 border-zinc-200")
                )}
               >
                 {formData.is_available ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                 {t('form.availableForBooking')}
               </Button>
            </div>

            {isEditOpen && (
              <div className={cn(
                "p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 space-y-4 mt-6",
                isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50/50 border-red-100"
              )}>
                <div className="flex items-center gap-2 text-red-500">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t('form.resetPassword')}</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      type="password"
                      value={resetPassword}
                      onChange={e => setResetPassword(e.target.value)}
                      placeholder={t('form.resetPasswordPlaceholder')}
                      className={cn("rounded-xl h-11 pl-10 pr-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")}
                    />
                  </div>
                  <Button 
                    onClick={handleForceResetPassword}
                    disabled={isResetting || !resetPassword}
                    className="h-11 px-6 rounded-xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[9px]"
                  >
                    {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('form.resetPassword')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-8">
            <Button 
              onClick={isAddOpen ? handleCreateGuide : handleUpdateGuide} 
              disabled={loading}
              className="w-full h-16 rounded-2xl ai-gradient font-black text-2xl shadow-xl shadow-primary/30 transition-all active:scale-95"
            >
              {loading && isAddOpen ? <Loader2 className="animate-spin h-6 w-6" /> : (isAddOpen ? "Confirm Creation" : "Update Profile")}
              <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
