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
  Globe, 
  Camera, 
  Clock, 
  Check, 
  X,
  Languages,
  Utensils,
  Store,
  Building,
  Image as ImageIcon,
  ChevronRight,
  Palette
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
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useBackofficeTheme } from "../layout"

interface Landmark {
  id: string;
  name: string;
  country: string;
  city: string;
  type: string;
  image_url: string;
  description: string;
  features: string[];
  accessibility: boolean;
  child_friendly: boolean;
}

export default function ManageLandmarksPage() {
  const t = useTranslations("Backoffice.landmarks")
  const { theme } = useBackofficeTheme()
  const isDark = theme === "dark"
  const supabase = createClient()
  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Edit/Add State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingLandmark, setEditingGuide] = useState<Landmark | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    type: "Sightseeing",
    image_url: "",
    description: "",
    features: "",
    accessibility: true,
    child_friendly: true
  })

  const fetchLandmarks = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('landmarks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setLandmarks(data as any)
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

  const handleSave = async () => {
    const payload = {
      ...formData,
      features: formData.features.split(',').map(f => f.trim()).filter(f => f)
    }

    let error;
    if (isAddOpen) {
      const { error: err } = await supabase.from('landmarks').insert([payload])
      error = err
      if (!error) await logAction('CREATE_LANDMARK', `Added landmark: ${formData.name}`, payload)
    } else {
      const { error: err } = await supabase.from('landmarks').update(payload).eq('id', editingLandmark?.id)
      error = err
      if (!error) await logAction('EDIT_LANDMARK', `Updated landmark: ${formData.name}`, { id: editingLandmark?.id, ...payload })
    }

    if (error) {
      toast.error("Operation failed")
    } else {
      toast.success(isAddOpen ? "Landmark added" : "Landmark updated")
      setIsAddOpen(false)
      setIsEditOpen(false)
      fetchLandmarks()
    }
  }

  const handleDelete = async (l: Landmark) => {
    if (!confirm(`Are you sure you want to delete ${l.name}?`)) return
    const { error } = await supabase.from('landmarks').delete().eq('id', l.id)
    if (error) {
      toast.error("Delete failed")
    } else {
      toast.success("Landmark deleted")
      await logAction('DELETE_LANDMARK', `Deleted landmark: ${l.name}`, { id: l.id })
      fetchLandmarks()
    }
  }

  const openEdit = (l: Landmark) => {
    setEditingGuide(l)
    setFormData({
      name: l.name,
      country: l.country,
      city: l.city,
      type: l.type,
      image_url: l.image_url || "",
      description: l.description || "",
      features: l.features?.join(', ') || "",
      accessibility: l.accessibility,
      child_friendly: l.child_friendly
    })
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "", country: "", city: "", type: "Sightseeing", 
      image_url: "", description: "", features: "",
      accessibility: true, child_friendly: true
    })
    setEditingGuide(null)
  }

  const filtered = landmarks.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Restaurant': return <Utensils className="h-4 w-4" />;
      case 'Market': return <Store className="h-4 w-4" />;
      case 'Accommodation': return <Building className="h-4 w-4" />;
      case 'ArtGallery': return <Palette className="h-4 w-4" />;
      default: return <Camera className="h-4 w-4" />;
    }
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && landmarks.length === 0 ? (
          [1,2,3].map(i => <div key={i} className={cn("h-48 rounded-[1.5rem] animate-pulse", isDark ? "bg-zinc-900" : "bg-zinc-200")} />)
        ) : filtered.map(landmark => (
          <Card key={landmark.id} className={cn(
            "rounded-[2rem] overflow-hidden group transition-all border shadow-lg",
            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
          )}>
            <div className="h-40 relative overflow-hidden">
               <img src={landmark.image_url || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'} className="w-full h-full object-cover" alt={landmark.name} />
               <div className={cn(
                 "absolute inset-0 bg-gradient-to-t via-transparent to-transparent",
                 isDark ? "from-zinc-950/90" : "from-black/60"
               )} />
               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <Button onClick={() => openEdit(landmark)} size="icon" className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 shadow-lg">
                    <Edit2 className="h-4 w-4 text-white" />
                  </Button>
                  <Button onClick={() => handleDelete(landmark)} size="icon" className="h-8 w-8 rounded-lg bg-red-500/20 backdrop-blur-md hover:bg-red-500/40 border border-red-500/20 shadow-lg">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
               </div>
               <div className="absolute bottom-4 left-6">
                  <Badge className="bg-primary/20 backdrop-blur-md text-white border-none px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    {getTypeIcon(landmark.type)}
                    {landmark.type}
                  </Badge>
               </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                 <div className="space-y-0.5">
                    <h3 className={cn("text-lg font-black font-rounded transition-colors truncate max-w-[200px]", isDark ? "text-white" : "text-zinc-900")}>{landmark.name}</h3>
                    <div className="flex items-center gap-1 text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
                       <MapPin className="h-3 w-3 text-primary" />
                       {landmark.city}, {landmark.country}
                    </div>
                 </div>
              </div>
              <p className="text-zinc-500 text-xs font-medium leading-relaxed line-clamp-2 h-8">{landmark.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                 {landmark.accessibility && <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-500 bg-emerald-500/5 font-black uppercase">♿ Accessible</Badge>}
                 {landmark.child_friendly && <Badge variant="outline" className="text-[8px] border-blue-500/20 text-blue-500 bg-blue-500/5 font-black uppercase">👶 Kids</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen || isAddOpen} onOpenChange={(val) => { if(!val) { setIsEditOpen(false); setIsAddOpen(false); resetForm(); }}}>
        <DialogContent className={cn(
          "max-w-2xl p-8 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl border transition-colors",
          isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}>
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-black uppercase font-rounded tracking-widest ai-text-gradient">
              {isAddOpen ? t('addNew') : t('editLandmark')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-6 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.name')}</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={cn("rounded-xl h-11 px-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.type')}</Label>
                  <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                    <SelectTrigger className={cn("rounded-xl h-11 px-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? "bg-zinc-800 border-zinc-700 text-white" : ""}>
                      <SelectItem value="Sightseeing">Sightseeing</SelectItem>
                      <SelectItem value="Market">Local Market</SelectItem>
                      <SelectItem value="Restaurant">Restaurant</SelectItem>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                      <SelectItem value="ArtGallery">Art Gallery</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.country')}</Label>
                  <Input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className={cn("rounded-xl h-11 px-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.city')}</Label>
                  <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={cn("rounded-xl h-11 px-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} />
               </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.imageUrl')}</Label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className={cn("rounded-xl h-11 pl-10 pr-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.description')}</Label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className={cn(
                  "w-full rounded-xl p-4 text-sm font-medium min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary/20 leading-relaxed border",
                  isDark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('form.features')}</Label>
              <Input value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className={cn("rounded-xl h-11 px-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} placeholder="e.g. WiFi, Parking, Rooftop..." />
            </div>

            <div className="flex gap-4">
               <Button 
                onClick={() => setFormData({...formData, accessibility: !formData.accessibility})}
                variant="outline" 
                className={cn(
                  "flex-1 rounded-xl border h-10 font-black text-[10px] uppercase tracking-widest gap-2",
                  formData.accessibility ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : (isDark ? "bg-zinc-800 text-zinc-500 border-zinc-700" : "bg-zinc-100 text-zinc-400 border-zinc-200")
                )}
               >
                 <Check className="h-4 w-4" />
                 {t('form.accessibility')}
               </Button>
               <Button 
                onClick={() => setFormData({...formData, child_friendly: !formData.child_friendly})}
                variant="outline" 
                className={cn(
                  "flex-1 rounded-xl border h-10 font-black text-[10px] uppercase tracking-widest gap-2",
                  formData.child_friendly ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : (isDark ? "bg-zinc-800 text-zinc-500 border-zinc-700" : "bg-zinc-100 text-zinc-400 border-zinc-200")
                )}
               >
                 <Check className="h-4 w-4" />
                 {t('form.childFriendly')}
               </Button>
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button 
              onClick={handleSave} 
              className="w-full h-14 rounded-xl ai-gradient font-black text-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isAddOpen ? "Confirm Creation" : "Update Landmark"}
              <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
