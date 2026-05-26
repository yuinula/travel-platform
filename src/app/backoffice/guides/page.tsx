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
  X
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
      toast.error("Please fill in essential account details (Email, Name, Password)")
      return
    }

    setLoading(true)
    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'guide'
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Failed to create auth user")

      // 2. Initialize Guide Profile
      const payload = {
        user_id: authData.user.id,
        bio: formData.bio,
        languages: formData.languages.split(',').map(l => l.trim()).filter(l => l),
        service_areas: formData.service_areas.split(',').map(s => s.trim()).filter(s => s),
        hourly_rate: formData.hourly_rate,
        is_available: formData.is_available
      }

      const { error: profileError } = await supabase
        .from('guide_profiles')
        .insert([payload])

      if (profileError) throw profileError

      toast.success(`Guide ${formData.name} created successfully!`)
      await logAction('CREATE_GUIDE', `Created new guide: ${formData.name}`, { email: formData.email })
      
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase font-rounded tracking-widest italic">Guide Management</h1>
          <p className="text-zinc-500 font-medium text-lg mt-1">Review and manage professional local guide profiles.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
            <Input 
              placeholder="Search guides..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white pl-12 h-14 rounded-2xl focus-visible:ring-zinc-700" 
            />
          </div>
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="h-14 rounded-2xl ai-gradient px-6 font-black uppercase tracking-widest gap-2 hover:scale-[1.02] transition-all">
            <Plus className="h-5 w-5" />
            Add New Guide
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading && guides.length === 0 ? (
          [1,2,3].map(i => <div key={i} className="h-24 rounded-3xl bg-zinc-900 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-zinc-800">
             <Briefcase className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
             <p className="text-zinc-600 font-bold">No guides found matching your search.</p>
          </div>
        ) : (
          filtered.map(guide => (
            <Card key={guide.id} className="bg-zinc-900 border-zinc-800 rounded-3xl overflow-hidden group hover:bg-zinc-800/50 transition-colors">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <Avatar className="h-16 w-16 border-2 border-zinc-800">
                    <AvatarImage src={guide.avatar_url} />
                    <AvatarFallback className="bg-zinc-800 text-zinc-500 font-bold uppercase">{guide.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-black text-white">{guide.name}</h3>
                    <p className="text-zinc-500 text-xs font-medium truncate max-w-[150px]">{guide.email}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:border-x border-zinc-800 md:px-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Rating</p>
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                       <Star className="h-3 w-3 fill-current" />
                       {guide.guide_profiles?.rating_avg || 0} ({guide.guide_profiles?.review_count || 0})
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Hourly Rate</p>
                    <p className="text-white font-bold">${guide.guide_profiles?.hourly_rate || 0}/hr</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Areas</p>
                    <p className="text-zinc-400 text-xs font-medium truncate max-w-[120px]">{guide.guide_profiles?.service_areas?.join(', ') || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Status</p>
                    <Badge className={cn(
                      "rounded-full px-2 py-0 h-5 text-[9px] font-black uppercase border-none",
                      guide.guide_profiles?.is_available ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}>
                      {guide.guide_profiles?.is_available ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={() => openEdit(guide)} variant="outline" className="h-12 w-12 rounded-xl border-zinc-800 bg-zinc-950 hover:bg-zinc-800">
                    <Edit2 className="h-4 w-4 text-zinc-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditOpen || isAddOpen} onOpenChange={(val) => { if(!val) { setIsEditOpen(false); setIsAddOpen(false); resetForm(); }}}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl p-10 rounded-[3rem] shadow-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase font-rounded tracking-widest">
              {isAddOpen ? "Create New Guide" : "Edit Guide Profile"}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              {isAddOpen ? "Setup a new professional account and profile." : `Update details for ${editingGuide?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-8 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
            {isAddOpen && (
              <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 mb-4">
                 <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Account Credentials</p>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" placeholder="John Doe" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</Label>
                    <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" placeholder="guide@example.com" />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Initial Password</Label>
                    <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" placeholder="••••••••" />
                 </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Biography</Label>
              <textarea 
                value={formData.bio} 
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-4 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Describe the guide's background and expertise..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Languages (comma separated)</Label>
                 <Input value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" placeholder="e.g. English, Mandarin, Japanese" />
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hourly Rate (USD)</Label>
                 <Input type="number" value={formData.hourly_rate} onChange={e => setFormData({...formData, hourly_rate: parseInt(e.target.value) || 0})} className="bg-zinc-800 border-zinc-700 rounded-xl" />
               </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Service Areas (comma separated cities)</Label>
              <Input value={formData.service_areas} onChange={e => setFormData({...formData, service_areas: e.target.value})} className="bg-zinc-800 border-zinc-700 rounded-xl" placeholder="e.g. Taipei, New Taipei City" />
            </div>

            <div className="flex items-center gap-3 pt-2">
               <Button 
                onClick={() => setFormData({...formData, is_available: !formData.is_available})}
                variant="outline" 
                className={cn(
                  "rounded-xl border-zinc-700 h-10 px-4 font-bold text-xs gap-2 transition-all",
                  formData.is_available ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-800 text-zinc-500"
                )}
               >
                 {formData.is_available ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                 Currently Available for Booking
               </Button>
            </div>
          </div>

          <DialogFooter className="mt-10">
            <Button 
              onClick={isAddOpen ? handleCreateGuide : handleUpdateGuide} 
              disabled={loading}
              className="w-full h-16 rounded-2xl ai-gradient font-black text-lg shadow-xl shadow-primary/20"
            >
              {loading && isAddOpen ? <Loader2 className="animate-spin h-6 w-6" /> : isAddOpen ? "Create Account & Profile" : "Update Professional Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
