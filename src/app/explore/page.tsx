"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Search, 
  MapPin, 
  Filter, 
  Sparkles, 
  ChevronRight, 
  Navigation,
  Check,
  Plus,
  Loader2,
  Calendar,
  Clock,
  Accessibility,
  Baby,
  UserRound,
  Sun,
  Sunset,
  Moon
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Landmark {
  id: string;
  name: string;
  country: string;
  city: string;
  type: 'Sightseeing' | 'Market' | 'Restaurant' | 'Accommodation';
  features: string[];
  is_accessible: boolean;
  is_child_friendly: boolean;
  is_elder_friendly: boolean;
  image_url: string;
  description: string;
}

interface Itinerary {
  id: string;
  name: string;
  start_date: string;
  itinerary_details: { id: string, day_number: number }[];
}

export default function ExplorePage() {
  const t = useTranslations('Explore')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('dest') || "")
  const [selectedCountry, setSelectedCountry] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  
  const [myTrips, setMyTrips] = useState<Itinerary[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<string>("morning")
  const [isAdding, setIsAddIng] = useState(false)

  const fetchLandmarks = async () => {
    setLoading(true)
    let query = supabase.from('landmarks').select('*')
    
    if (selectedCountry !== "all") query = query.eq('country', selectedCountry)
    if (selectedType !== "all") query = query.eq('type', selectedType)
    
    const { data } = await query
    if (data) {
      const filtered = data.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setLandmarks(filtered)
    }
    setLoading(false)
  }

  const fetchMyTrips = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('itineraries')
      .select(`
        id, name, start_date,
        itinerary_details (id, day_number)
      `)
      .eq('user_id', user.id)
      .gte('start_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })
    
    if (data) setMyTrips(data as any)
  }

  useEffect(() => {
    fetchLandmarks()
  }, [selectedCountry, selectedType, searchTerm])

  useEffect(() => {
    fetchMyTrips()
  }, [])

  const handleAddToItinerary = async () => {
    if (!selectedTrip || !selectedDay || !selectedLandmark) return
    
    setIsAddIng(true)
    const trip = myTrips.find(t => t.id === selectedTrip)
    const day = trip?.itinerary_details.find(d => d.day_number === parseInt(selectedDay))
    
    if (day) {
      const updateData: any = {}
      updateData[selectedSlot] = selectedLandmark.name
      
      const { error } = await supabase
        .from('itinerary_details')
        .update(updateData)
        .eq('id', day.id)

      if (!error) {
        toast.success(t('addSuccess'))
        setIsAddOpen(false)
      } else {
        toast.error("Failed to add landmark")
      }
    }
    setIsAddIng(false)
  }

  const countries = Array.from(new Set(landmarks.map(l => l.country)))

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 py-12 md:py-20">
      <div className="container max-w-6xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge className="px-4 py-1 rounded-full ai-gradient border-none font-bold uppercase tracking-widest text-[10px]">Discovery</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 font-rounded uppercase italic">
            {t('title')}
          </h1>
          <p className="text-zinc-500 font-medium text-lg md:text-xl leading-relaxed italic">
            {t('description')}
          </p>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[3rem] p-4 md:p-8 bg-white/80 backdrop-blur-xl sticky top-24 z-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input 
                placeholder={t('searchPlaceholder')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-zinc-100 bg-white shadow-inner focus-visible:ring-primary/20"
              />
            </div>
            
            <Select value={selectedCountry} onValueChange={(val) => setSelectedCountry(val || "all")}>
              <SelectTrigger className="h-14 rounded-2xl border-zinc-100 bg-white font-bold">
                <SelectValue placeholder={t('filterCountry')} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-zinc-100">
                <SelectItem value="all" className="font-bold">All Countries</SelectItem>
                {countries.map(c => (
                  <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={(val) => setSelectedType(val || "all")}>
              <SelectTrigger className="h-14 rounded-2xl border-zinc-100 bg-white font-bold">
                <SelectValue placeholder={t('filterType')} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-zinc-100">
                <SelectItem value="all" className="font-bold">All Types</SelectItem>
                <SelectItem value="Sightseeing" className="font-bold">{t('types.Sightseeing')}</SelectItem>
                <SelectItem value="Market" className="font-bold">{t('types.Market')}</SelectItem>
                <SelectItem value="Restaurant" className="font-bold">{t('types.Restaurant')}</SelectItem>
                <SelectItem value="Accommodation" className="font-bold">{t('types.Accommodation')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Landmarks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
            {[1,2,3].map(i => (
              <div key={i} className="h-[450px] rounded-[3rem] bg-white animate-pulse" />
            ))}
          </div>
        ) : landmarks.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-zinc-100">
             <MapPin className="h-20 w-20 text-zinc-100 mx-auto mb-6" />
             <p className="text-zinc-400 font-black text-2xl uppercase italic tracking-widest">{t('noLandmarks')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {landmarks.map(landmark => (
              <Card key={landmark.id} className="border-none shadow-xl shadow-zinc-200/40 rounded-[3rem] overflow-hidden bg-white group hover:-translate-y-2 transition-all duration-500">
                <div className="h-64 relative overflow-hidden">
                  <img 
                    src={landmark.image_url || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'} 
                    alt={landmark.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none font-black text-[10px] tracking-widest px-3 py-1 uppercase rounded-full">
                      {t(`types.${landmark.type}`)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Navigation className="h-3 w-3" />
                      {landmark.city}, {landmark.country}
                    </p>
                    <h3 className="text-white text-2xl font-black font-rounded">{landmark.name}</h3>
                  </div>
                </div>
                
                <CardContent className="p-8 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {landmark.is_accessible && (
                      <Badge variant="outline" className="rounded-full border-zinc-100 text-zinc-500 font-bold text-[9px] gap-1 px-2 py-0.5">
                        <Accessibility className="h-3 w-3" /> {t('tags.accessible')}
                      </Badge>
                    )}
                    {landmark.is_child_friendly && (
                      <Badge variant="outline" className="rounded-full border-zinc-100 text-zinc-500 font-bold text-[9px] gap-1 px-2 py-0.5">
                        <Baby className="h-3 w-3" /> {t('tags.child')}
                      </Badge>
                    )}
                    {landmark.is_elder_friendly && (
                      <Badge variant="outline" className="rounded-full border-zinc-100 text-zinc-500 font-bold text-[9px] gap-1 px-2 py-0.5">
                        <UserRound className="h-3 w-3" /> {t('tags.elder')}
                      </Badge>
                    )}
                  </div>

                  <p className="text-zinc-500 font-medium text-sm line-clamp-3 leading-relaxed">
                    {landmark.description || "Discover the magic of this destination with curated experiences designed by Trip Butler."}
                  </p>

                  <div className="pt-4 border-t border-zinc-50 flex items-center justify-between gap-4">
                    <Button 
                      className="flex-1 h-14 rounded-2xl ai-gradient font-black text-sm uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      onClick={() => {
                        setSelectedLandmark(landmark)
                        setIsAddOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      {t('addToItinerary')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add to Itinerary Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-2xl border-white/40 max-w-md p-10 rounded-[3.5rem] shadow-2xl">
            <DialogHeader className="space-y-4">
              <div className="h-16 w-16 rounded-[2rem] ai-gradient flex items-center justify-center mb-2 shadow-xl shadow-primary/20">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black text-zinc-900 font-rounded uppercase tracking-widest">
                {t('addToItinerary')}
              </DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium">
                {t('addDescription', { name: selectedLandmark?.name })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">{t('selectTrip')}</label>
                <Select value={selectedTrip} onValueChange={(val) => setSelectedTrip(val || "")}>
                  <SelectTrigger className="h-14 rounded-2xl border-zinc-100 bg-white font-bold text-zinc-800">
                    <SelectValue placeholder={t('tripPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100">
                    {myTrips.map(trip => (
                      <SelectItem key={trip.id} value={trip.id} className="font-bold">{trip.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTrip && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">{t('selectDay')}</label>
                  <Select value={selectedDay} onValueChange={(val) => setSelectedDay(val || "")}>
                    <SelectTrigger className="h-14 rounded-2xl border-zinc-100 bg-white font-bold text-zinc-800">
                      <SelectValue placeholder={t('dayPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-zinc-100">
                      {myTrips.find(t => t.id === selectedTrip)?.itinerary_details.map(day => (
                        <SelectItem key={day.id} value={day.day_number.toString()} className="font-bold italic">
                          {t('dayLabel', { day: day.day_number })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedDay && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">{t('selectSlot')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['morning', 'afternoon', 'evening'].map(slot => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? 'default' : 'outline'}
                        className={cn(
                          "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          selectedSlot === slot ? "ai-gradient border-none" : "border-zinc-100 text-zinc-400 hover:text-zinc-800"
                        )}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot === 'morning' && <Sun className="h-3 w-3 mr-1" />}
                        {slot === 'afternoon' && <Sunset className="h-3 w-3 mr-1" />}
                        {slot === 'evening' && <Moon className="h-3 w-3 mr-1" />}
                        {t(`slots.${slot}`)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-10">
              <Button 
                className="w-full h-16 rounded-2xl font-black text-lg ai-gradient shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                disabled={!selectedDay || isAdding}
                onClick={handleAddToItinerary}
              >
                {isAdding ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6 mr-2" />}
                {t('addToItinerary')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
