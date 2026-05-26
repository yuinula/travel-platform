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
  ChevronRight
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
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    languages: "",
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
      languages: formData.languages.split(',').map(l => l.trim()).filter(l => l),
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
          languages: formData.languages.split(',').map(l => l.trim()).filter(l => l),
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

  const openEdit = (g: Guide) => {
    setEditingGuide(g)
    setFormData({
      name: g.name,
      email: g.email,
      password: "",
      bio: g.guide_profiles?.bio || "",
      languages: g.guide_profiles?.languages?.join(', ') || "",
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
      password: "",
      bio: "",
      languages: "",
      service_areas: "",
      hourly_rate: 0,
      is_available: true
    })
    setEditingGuide(null)
  }

  const filtered = guides.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.guide_profiles?.service_areas?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className={cn(
            "text-5xl font-black tracking-tight uppercase tracking-widest font-rounded transition-colors",
            isDark ? "text-white" : "text-zinc-900"
          )}>{t('title')}</h1>
          <p className="text-zinc-500 font-bold text-xl">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64 md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500" />
            <Input 
              placeholder={t('searchPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "border h-16 rounded-2xl pl-14 text-lg font-medium transition-all focus-visible:ring-primary/20",
                isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )} 
            />
          </div>
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="h-16 rounded-2xl ai-gradient px-8 font-black uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
            <Plus className="h-6 w-6" />
            {t('addNew')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading && guides.length === 0 ? (
          [1,2,3].map(i => <div key={i} className={cn("h-32 rounded-[2.5rem] animate-pulse", isDark ? "bg-zinc-900" : "bg-zinc-200")} />)
        ) : filtered.length === 0 ? (
          <div className={cn(
            "text-center py-32 rounded-[4rem] border-2 border-dashed transition-colors",
            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
          )}>
             <Briefcase className="h-16 w-16 text-zinc-300 mx-auto mb-6" />
             <p className="text-zinc-400 font-black text-2xl uppercase tracking-widest">No guides found.</p>
          </div>
        ) : (
          filtered.map(guide => (
            <Card key={guide.id} className={cn(
              "rounded-[2.5rem] overflow-hidden group transition-all duration-500 hover:shadow-2xl border",
              isDark ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50" : "bg-white border-zinc-200 hover:bg-zinc-50"
            )}>
              <CardContent className="p-10 flex flex-col lg:flex-row lg:items-center gap-12">
                <div className="flex items-center gap-8 min-w-[320px]">
                  <Avatar className="h-24 w-20 rounded-2xl border-4 shadow-2xl transition-colors" style={{ borderColor: isDark ? '#27272a' : '#f4f4f5' }}>
                    <AvatarImage src={guide.avatar_url} className="object-cover" />
                    <AvatarFallback className={isDark ? "bg-zinc-800 text-zinc-500" : "bg-zinc-100 text-zinc-400"}>
                      {guide.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className={cn("text-3xl font-black font-rounded transition-colors", isDark ? "text-white" : "text-zinc-900")}>{guide.name}</h3>
                    <p className="text-zinc-500 text-base font-bold truncate max-w-[220px]">{guide.email}</p>
                  </div>
                </div>

                <div className={cn(
                  "flex-1 grid grid-cols-2 md:grid-cols-4 gap-10 lg:border-x lg:px-12 transition-colors",
                  isDark ? "border-zinc-800" : "border-zinc-100"
                )}>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">{t('table.rating')}</p>
                    <div className="flex items-center gap-2 text-amber-500 font-black text-xl">
                       <Star className="h-6 w-6 fill-current" />
                       {guide.guide_profiles?.rating_avg || 0} <span className="text-xs text-zinc-400 font-bold">({guide.guide_profiles?.review_count || 0})</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">{t('table.hourlyRate')}</p>
                    <p className={cn("font-black text-xl transition-colors", isDark ? "text-white" : "text-zinc-900")}>${guide.guide_profiles?.hourly_rate || 0}<span className="text-xs text-zinc-400 font-bold ml-1">/hr</span></p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">{t('table.areas')}</p>
                    <div className="flex items-center gap-2 text-zinc-400">
                       <MapPin className="h-5 w-5 text-primary" />
                       <p className="text-base font-bold truncate max-w-[180px]">{guide.guide_profiles?.service_areas?.join(', ') || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">{t('table.status')}</p>
                    <Badge className={cn(
                      "rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-widest border-none transition-all shadow-md",
                      guide.guide_profiles?.is_available 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : (isDark ? "bg-zinc-800 text-zinc-500" : "bg-zinc-100 text-zinc-400")
                    )}>
                      {guide.guide_profiles?.is_available ? t('table.available') : t('table.busy')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button onClick={() => openEdit(guide)} variant="outline" className={cn(
                    "h-16 w-16 rounded-2xl border transition-all shadow-xl",
                    isDark ? "border-zinc-800 bg-zinc-950 hover:bg-zinc-800" : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900"
                  )}>
                    <Edit2 className="h-7 w-7" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditOpen || isAddOpen} onOpenChange={(val) => { if(!val) { setIsEditOpen(false); setIsAddOpen(false); resetForm(); }}}>
        <DialogContent className={cn(
          "max-w-3xl p-12 rounded-[4rem] shadow-3xl overflow-hidden backdrop-blur-2xl border transition-colors",
          isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}>
          <DialogHeader className="space-y-6">
            <DialogTitle className="text-4xl font-black uppercase font-rounded tracking-widest ai-text-gradient">
              {isAddOpen ? t('addNew') : t('editGuide')}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xl font-bold">
              {isAddOpen ? "Setup a new professional partner account." : `Modifying profile for: ${editingGuide?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-10 mt-10 overflow-y-auto max-h-[60vh] pr-6 custom-scrollbar">
            {isAddOpen && (
              <div className={cn(
                "grid grid-cols-2 gap-8 p-10 rounded-[3rem] border mb-8 transition-colors",
                isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-100"
              )}>
                 <div className="col-span-2">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="h-5 w-5 text-primary" />
                       <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">{t('form.accountCredentials')}</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{t('form.fullName')}</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={cn("rounded-2xl h-14 px-6 text-lg font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} placeholder="e.g. Kyoto Expert" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Email</Label>
                    <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={cn("rounded-2xl h-14 px-6 text-lg font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} placeholder="guide@tripbutler.com" />
                 </div>
                 <div className="col-span-2 space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{t('form.initialPassword')}</Label>
                    <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={cn("rounded-2xl h-14 px-6 text-lg font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} placeholder="••••••••" />
                 </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{t('form.bio')}</Label>
              <textarea 
                value={formData.bio} 
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className={cn(
                  "w-full rounded-[1.5rem] p-8 text-lg font-medium min-h-[160px] focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed border transition-colors",
                  isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                )}
                placeholder="..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3">
                 <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{t('form.languages')}</Label>
                 <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500" />
                    <Input value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} className={cn("rounded-2xl h-14 pl-14 pr-6 text-lg font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} placeholder="English, Japanese..." />
                 </div>
               </div>
               <div className="space-y-3">
                 <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{t('hourlyRate')} (USD)</Label>
                 <div className="relative">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500" />
                    <Input type="number" value={formData.hourly_rate} onChange={e => setFormData({...formData, hourly_rate: parseInt(e.target.value) || 0})} className={cn("rounded-2xl h-14 pl-14 pr-6 text-lg font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} />
                 </div>
               </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{t('form.serviceAreas')}</Label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500" />
                <Input value={formData.service_areas} onChange={e => setFormData({...formData, service_areas: e.target.value})} className={cn("rounded-2xl h-14 pl-14 pr-6 text-lg font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} placeholder="Taipei, Tokyo..." />
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-6 py-6 rounded-[2.5rem] px-10 border transition-colors",
              isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-100"
            )}>
               <Button 
                onClick={() => setFormData({...formData, is_available: !formData.is_available})}
                variant="outline" 
                className={cn(
                  "rounded-2xl border-2 h-16 px-10 font-black text-sm uppercase tracking-widest gap-4 transition-all",
                  formData.is_available ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-xl shadow-emerald-500/5" : (isDark ? "bg-zinc-800 text-zinc-500 border-zinc-700" : "bg-zinc-100 text-zinc-400 border-zinc-200")
                )}
               >
                 {formData.is_available ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
                 {t('form.availableForBooking')}
               </Button>
            </div>
          </div>

          <DialogFooter className="mt-12">
            <Button 
              onClick={isAddOpen ? handleCreateGuide : handleUpdateGuide} 
              disabled={loading}
              className="w-full h-24 rounded-[1.5rem] ai-gradient font-black text-3xl shadow-3xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading && isAddOpen ? <Loader2 className="animate-spin h-10 w-10" /> : (isAddOpen ? "Confirm Creation" : "Update Profile")}
              <ChevronRight className="ml-4 h-10 w-10" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
