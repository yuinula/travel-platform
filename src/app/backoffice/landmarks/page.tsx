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
  Plus, 
  Search, 
  MapPin, 
  Trash2, 
  Edit2, 
  Loader2, 
  Image as ImageIcon,
  Check,
  X,
  Accessibility,
  Baby,
  UserRound,
  MoreVertical,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface Landmark {
  id: string;
  name: string;
  country: string;
  province: string;
  city: string;
  type: 'Sightseeing' | 'Market' | 'Restaurant' | 'Accommodation' | 'ArtGallery';
  features: string[];
  is_accessible: boolean;
  is_child_friendly: boolean;
  is_elder_friendly: boolean;
  image_url: string;
  description: string;
}

export default function ManageLandmarksPage() {
  const t = useTranslations("Backoffice.landmarks")
  const et = useTranslations("Explore")
  const supabase = createClient()
  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Form State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingLandmark, setEditingLandmark] = useState<Landmark | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    province: "",
    city: "",
    type: "Sightseeing" as Landmark['type'],
    image_url: "",
    description: "",
    is_accessible: false,
    is_child_friendly: false,
    is_elder_friendly: false,
    features: ""
  })

  const fetchLandmarks = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('landmarks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setLandmarks(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLandmarks()
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

  const handleSave = async (mode: 'add' | 'edit') => {
    const payload = {
      ...formData,
      features: formData.features.split(',').map(f => f.trim()).filter(f => f)
    }

    let error;
    if (mode === 'add') {
      const { error: err } = await supabase.from('landmarks').insert([payload])
      error = err
    } else {
      const { error: err } = await supabase.from('landmarks').update(payload).eq('id', editingLandmark?.id)
      error = err
    }

    if (error) {
      toast.error(`Failed to ${mode} landmark`)
    } else {
      toast.success(`Landmark ${mode === 'add' ? 'created' : 'updated'} successfully`)
      await logAction(
        mode === 'add' ? 'CREATE_LANDMARK' : 'EDIT_LANDMARK',
        `${mode === 'add' ? 'Created' : 'Updated'} landmark: ${payload.name}`,
        { name: payload.name }
      )
      setIsAddOpen(false)
      setIsEditOpen(false)
      resetForm()
      fetchLandmarks()
    }
  }

  const handleDelete = async (landmark: Landmark) => {
    const { error } = await supabase.from('landmarks').delete().eq('id', landmark.id)
    if (error) {
      toast.error("Failed to delete landmark")
    } else {
      toast.success("Landmark deleted")
      await logAction('DELETE_LANDMARK', `Deleted landmark: ${landmark.name}`, { name: landmark.name })
      fetchLandmarks()
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      country: "",
      province: "",
      city: "",
      type: "Sightseeing",
      image_url: "",
      description: "",
      is_accessible: false,
      is_child_friendly: false,
      is_elder_friendly: false,
      features: ""
    })
    setEditingLandmark(null)
  }

  const openEdit = (l: Landmark) => {
    setEditingLandmark(l)
    setFormData({
      name: l.name,
      country: l.country,
      province: l.province || "",
      city: l.city,
      type: l.type,
      image_url: l.image_url || "",
      description: l.description || "",
      is_accessible: l.is_accessible,
      is_child_friendly: l.is_child_friendly,
      is_elder_friendly: l.is_elder_friendly,
      features: l.features.join(', ')
    })
    setIsEditOpen(true)
  }

  const filtered = landmarks.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-white uppercase font-rounded italic tracking-widest">{t('title')}</h1>
          <p className="text-zinc-500 font-bold text-xl">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative w-64 md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-600" />
              <Input 
                placeholder={t('searchPlaceholder')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white pl-14 h-16 rounded-2xl focus-visible:ring-zinc-700 text-lg font-medium" 
              />
           </div>
           <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="h-16 rounded-2xl ai-gradient px-8 font-black uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
             <Plus className="h-6 w-6" />
             {t('addNew')}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-80 rounded-[3rem] bg-zinc-900 animate-pulse" />)
        ) : filtered.map(landmark => (
          <Card key={landmark.id} className="bg-zinc-900 border-zinc-800 rounded-[3rem] overflow-hidden group hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2">
            <div className="h-56 relative overflow-hidden">
               <img src={landmark.image_url || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={landmark.name} />
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
               <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <Button onClick={() => openEdit(landmark)} size="icon" className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 shadow-xl">
                    <Edit2 className="h-5 w-5 text-white" />
                  </Button>
                  <Button onClick={() => handleDelete(landmark)} size="icon" className="h-12 w-12 rounded-2xl bg-red-500/20 backdrop-blur-md hover:bg-red-500/40 border border-red-500/20 shadow-xl">
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
               </div>
               <div className="absolute bottom-6 left-8 right-8">
                  <Badge className="bg-primary/20 text-primary border-primary/20 mb-3 uppercase text-[10px] font-black tracking-widest px-3 py-1 rounded-full">
                    {et(`types.${landmark.type}`)}
                  </Badge>
                  <h3 className="text-white text-2xl font-black font-rounded truncate">{landmark.name}</h3>
               </div>
            </div>
            <CardContent className="p-8 space-y-5">
               <div className="flex items-center gap-3 text-zinc-400 text-sm font-bold">
                  <MapPin className="h-4 w-4 text-primary" />
                  {landmark.city}, {landmark.country}
               </div>
               <p className="text-zinc-500 text-sm font-medium line-clamp-2 italic leading-relaxed">
                 {landmark.description || "No description provided."}
               </p>
               <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800/50">
                  {landmark.is_accessible && <Accessibility className="h-5 w-5 text-emerald-500" />}
                  {landmark.is_child_friendly && <Baby className="h-5 w-5 text-blue-500" />}
                  {landmark.is_elder_friendly && <UserRound className="h-5 w-5 text-amber-500" />}
                  <span className="text-[11px] text-zinc-600 font-black uppercase ml-auto tracking-tighter">Updated: {new Date().toLocaleDateString()}</span>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Landmark Dialog (Add/Edit) */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(val) => { if(!val) { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl p-12 rounded-[4rem] shadow-2xl overflow-hidden backdrop-blur-2xl">
          <DialogHeader className="space-y-6">
            <DialogTitle className="text-4xl font-black uppercase font-rounded tracking-widest ai-text-gradient">
              {isEditOpen ? t('editLandmark') : t('addNew')}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xl font-bold">{t('subtitle')}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-8 mt-10 overflow-y-auto max-h-[60vh] pr-6 custom-scrollbar">
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">{t('form.name')}</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-2xl h-14 px-6 text-lg font-bold" />
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">{t('form.type')}</Label>
              <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v as any})}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-2xl h-14 px-6 text-lg font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 rounded-2xl">
                  <SelectItem value="Sightseeing">{et('types.Sightseeing')}</SelectItem>
                  <SelectItem value="Market">{et('types.Market')}</SelectItem>
                  <SelectItem value="Restaurant">{et('types.Restaurant')}</SelectItem>
                  <SelectItem value="Accommodation">{et('types.Accommodation')}</SelectItem>
                  <SelectItem value="ArtGallery">{et('types.ArtGallery')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">{t('form.country')}</Label>
              <Input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-2xl h-14 px-6 text-lg font-bold" />
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">{t('form.city')}</Label>
              <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-2xl h-14 px-6 text-lg font-bold" />
            </div>
            <div className="col-span-2 space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">{t('form.imageUrl')}</Label>
              <div className="relative">
                <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-2xl h-14 pl-14 pr-6 text-lg font-bold" placeholder="https://..." />
              </div>
            </div>
            <div className="col-span-2 space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">{t('form.description')}</Label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full bg-zinc-800 border-zinc-700 rounded-2xl p-6 text-lg font-medium min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="col-span-2 space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">{t('form.features')}</Label>
              <Input value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-2xl h-14 px-6 text-lg font-bold" placeholder="e.g. Landmark, Architecture, View" />
            </div>
            
            <div className="col-span-2 flex flex-wrap gap-8 py-4 bg-white/5 rounded-[2rem] px-8 border border-white/5">
               <div className="flex items-center gap-4">
                  <Checkbox checked={formData.is_accessible} onCheckedChange={v => setFormData({...formData, is_accessible: !!v})} className="h-6 w-6 border-zinc-700 rounded-lg" />
                  <Label className="text-sm font-black uppercase tracking-widest text-zinc-400">{t('form.accessibility')}</Label>
               </div>
               <div className="flex items-center gap-4">
                  <Checkbox checked={formData.is_child_friendly} onCheckedChange={v => setFormData({...formData, is_child_friendly: !!v})} className="h-6 w-6 border-zinc-700 rounded-lg" />
                  <Label className="text-sm font-black uppercase tracking-widest text-zinc-400">{t('form.childFriendly')}</Label>
               </div>
               <div className="flex items-center gap-4">
                  <Checkbox checked={formData.is_elder_friendly} onCheckedChange={v => setFormData({...formData, is_elder_friendly: !!v})} className="h-6 w-6 border-zinc-700 rounded-lg" />
                  <Label className="text-sm font-black uppercase tracking-widest text-zinc-400">{t('form.elderFriendly')}</Label>
               </div>
            </div>
          </div>

          <DialogFooter className="mt-12">
            <Button onClick={() => handleSave(isEditOpen ? 'edit' : 'add')} className="w-full h-20 rounded-[1.5rem] ai-gradient font-black text-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
              {isEditOpen ? t('editLandmark') : t('addNew')}
              <ChevronRight className="ml-3 h-8 w-8" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
