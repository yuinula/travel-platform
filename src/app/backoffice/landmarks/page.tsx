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
  MoreVertical
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

interface Landmark {
  id: string;
  name: string;
  country: string;
  province: string;
  city: string;
  type: 'Sightseeing' | 'Market' | 'Restaurant' | 'Accommodation';
  features: string[];
  is_accessible: boolean;
  is_child_friendly: boolean;
  is_elder_friendly: boolean;
  image_url: string;
  description: string;
}

export default function ManageLandmarksPage() {
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
    l.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase font-rounded tracking-widest italic">Landmark Management</h1>
          <p className="text-zinc-500 font-medium text-lg mt-1">Curate and maintain the global landmark database.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative w-64 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
              <Input 
                placeholder="Search landmarks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white pl-12 h-14 rounded-2xl focus-visible:ring-zinc-700" 
              />
           </div>
           <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="h-14 rounded-2xl ai-gradient px-6 font-black uppercase tracking-widest gap-2">
             <Plus className="h-5 w-5" />
             Add New
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-zinc-900 animate-pulse" />)
        ) : filtered.map(landmark => (
          <Card key={landmark.id} className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] overflow-hidden group">
            <div className="h-48 relative overflow-hidden">
               <img src={landmark.image_url || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button onClick={() => openEdit(landmark)} size="icon" className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10">
                    <Edit2 className="h-4 w-4 text-white" />
                  </Button>
                  <Button onClick={() => handleDelete(landmark)} size="icon" className="h-10 w-10 rounded-xl bg-red-500/20 backdrop-blur-md hover:bg-red-500/40 border border-red-500/20">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
               </div>
               <div className="absolute bottom-4 left-6">
                  <Badge className="bg-primary/20 text-primary border-primary/20 mb-2 uppercase text-[9px] font-black">{landmark.type}</Badge>
                  <h3 className="text-white text-xl font-black">{landmark.name}</h3>
               </div>
            </div>
            <CardContent className="p-6 space-y-4">
               <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                  <MapPin className="h-3 w-3" />
                  {landmark.city}, {landmark.country}
               </div>
               <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/50">
                  {landmark.is_accessible && <Accessibility className="h-4 w-4 text-emerald-500" />}
                  {landmark.is_child_friendly && <Baby className="h-4 w-4 text-blue-500" />}
                  {landmark.is_elder_friendly && <UserRound className="h-4 w-4 text-amber-500" />}
                  <span className="text-[10px] text-zinc-600 font-bold uppercase ml-auto">Updated recently</span>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Landmark Dialog (Add/Edit) */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(val) => { if(!val) { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl p-10 rounded-[3rem] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase font-rounded tracking-widest">{isEditOpen ? "Edit Landmark" : "Add Landmark"}</DialogTitle>
            <DialogDescription className="text-zinc-500">Fill in the details below to maintain the landmark library.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Type</Label>
              <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v as any})}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="Sightseeing">Sightseeing</SelectItem>
                  <SelectItem value="Market">Market</SelectItem>
                  <SelectItem value="Restaurant">Restaurant</SelectItem>
                  <SelectItem value="Accommodation">Accommodation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Country</Label>
              <Input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">City</Label>
              <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Image URL</Label>
              <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</Label>
              <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Features (comma separated)</Label>
              <Input value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" placeholder="e.g. Landmark, Architecture, View" />
            </div>
            
            <div className="col-span-2 flex gap-6 mt-2">
               <div className="flex items-center gap-3">
                  <Checkbox checked={formData.is_accessible} onCheckedChange={v => setFormData({...formData, is_accessible: !!v})} className="border-zinc-700" />
                  <Label className="text-xs font-bold text-zinc-400">Accessible</Label>
               </div>
               <div className="flex items-center gap-3">
                  <Checkbox checked={formData.is_child_friendly} onCheckedChange={v => setFormData({...formData, is_child_friendly: !!v})} className="border-zinc-700" />
                  <Label className="text-xs font-bold text-zinc-400">Child Friendly</Label>
               </div>
               <div className="flex items-center gap-3">
                  <Checkbox checked={formData.is_elder_friendly} onCheckedChange={v => setFormData({...formData, is_elder_friendly: !!v})} className="border-zinc-700" />
                  <Label className="text-xs font-bold text-zinc-400">Elder Friendly</Label>
               </div>
            </div>
          </div>

          <DialogFooter className="mt-10">
            <Button onClick={() => handleSave(isEditOpen ? 'edit' : 'add')} className="w-full h-16 rounded-2xl ai-gradient font-black text-lg shadow-xl shadow-primary/20">
              {isEditOpen ? "Update Landmark" : "Create Landmark"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
