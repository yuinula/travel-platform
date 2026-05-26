"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase"
import { 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  Users, 
  Accessibility,
  ArrowRight,
  Star,
  Loader2,
  Calendar,
  MessageSquare
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MatchedGuide {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
  hourly_rate: number;
  rating_avg: number;
  review_count: number;
  service_areas: string[];
  languages: string[];
}

interface TripInfo {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  needs: string[];
}

export default function GuideMatchPage() {
  const t = useTranslations("Match")
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [trip, setTrip] = useState<TripInfo | null>(null)
  const [guides, setGuides] = useState<MatchedGuide[]>([])
  const [isSelecting, setIsSelecting] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    
    // 1. Fetch Trip Info
    const { data: tripData } = await supabase
      .from('itineraries')
      .select('id, name, destination, start_date, end_date, needs')
      .eq('id', id)
      .single()
    
    if (tripData) {
      setTrip(tripData as any)

      // 2. Match Guides based on Destination (City or Service Area)
      const { data: guideData } = await supabase
        .from('profiles')
        .select(`
          id, name, avatar_url,
          guide_profiles (
            bio, hourly_rate, rating_avg, review_count, service_areas, languages
          )
        `)
        .eq('role', 'guide')

      if (guideData) {
        // Simple matching logic: Filter by service area including destination
        const matched = guideData
          .map((g: any) => ({
            id: g.id,
            name: g.name,
            avatar_url: g.avatar_url,
            ...g.guide_profiles
          }))
          .filter((g: any) => 
             g.service_areas?.some((area: string) => 
               tripData.destination.toLowerCase().includes(area.toLowerCase()) ||
               area.toLowerCase().includes(tripData.destination.toLowerCase())
             )
          )
        
        setGuides(matched)
      }
    }
    
    // Simulate AI thinking
    setTimeout(() => setLoading(false), 2000)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleSelectGuide = async (guideId: string) => {
    setIsSelecting(guideId)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/login")
      return
    }

    try {
      // 1. Create a "Negotiation" trip record
      const { data: newOrder, error } = await supabase
        .from('trips')
        .insert([{
          traveler_id: user.id,
          guide_id: guideId,
          status: 'Negotiation',
          start_date: trip?.start_date,
          end_date: trip?.end_date,
          total_price: 0 // To be quoted by guide
        }])
        .select()
        .single()

      if (error) throw error

      // 2. Redirect to chat
      toast.success("Matching successful! Opening chat...")
      router.push(`/messages?tripId=${newOrder.id}`)
    } catch (err) {
      toast.error("Failed to initiate contact.")
    } finally {
      setIsSelecting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-8 max-w-sm text-center">
           <div className="relative">
              <div className="h-24 w-24 rounded-[2.5rem] ai-gradient animate-spin-slow flex items-center justify-center shadow-2xl shadow-primary/30">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center animate-bounce">
                <Users className="h-5 w-5 text-primary" />
              </div>
           </div>
           <div className="space-y-3">
              <h2 className="text-2xl font-black font-rounded uppercase tracking-widest">{t('matching')}</h2>
              <p className="text-zinc-400 font-medium">We are analyzing {trip?.destination}&apos;s elite guides for your {trip?.name}...</p>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 py-12 md:py-20">
      <div className="container max-w-5xl mx-auto px-4 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em]">
                <MapPin className="h-4 w-4" />
                {trip?.destination}
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 font-rounded">
               {t('found', { count: guides.length })}
             </h1>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-zinc-400" />
             </div>
             <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest leading-none">
               {trip?.start_date} - {trip?.end_date}
             </div>
          </div>
        </div>

        {guides.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-zinc-100 space-y-6">
             <Users className="h-20 w-20 text-zinc-100 mx-auto" />
             <p className="text-zinc-400 font-black text-2xl uppercase tracking-widest">{t('noMatches')}</p>
             <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold">Try another destination</Button>
          </div>
        ) : (
          <div className="grid gap-8">
            {guides.map(guide => (
              <Card key={guide.id} className="border-none shadow-xl shadow-zinc-200/50 rounded-[3rem] overflow-hidden bg-white group hover:shadow-primary/5 transition-all duration-500">
                <CardContent className="p-8 md:p-12 flex flex-col md:flex-row gap-10">
                  <div className="relative shrink-0">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 rounded-[3rem] border-4 border-white shadow-2xl">
                      <AvatarImage src={guide.avatar_url} />
                      <AvatarFallback className="bg-zinc-100 text-zinc-400 text-4xl font-black uppercase">
                        {guide.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
                       <ShieldCheck className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-3xl font-black text-zinc-900 font-rounded mb-1">{guide.name}</h3>
                        <div className="flex items-center gap-4 text-zinc-400 font-bold text-sm">
                           <span className="flex items-center gap-1 text-amber-500">
                             <Star className="h-4 w-4 fill-current" /> {guide.rating_avg} ({guide.review_count})
                           </span>
                           <span className="flex items-center gap-1">
                             <MapPin className="h-4 w-4" /> {guide.service_areas?.join(", ")}
                           </span>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-3xl font-black ai-text-gradient font-rounded">${guide.hourly_rate}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">per {t('hourlyRate')}</p>
                      </div>
                    </div>

                    <p className="text-zinc-500 font-medium leading-relaxed line-clamp-2 italic">
                      &ldquo;{guide.bio || "Dedicated local expert ready to provide an unforgettable authentic experience tailored to your unique interests."}&rdquo;
                    </p>

                    <div className="flex flex-wrap gap-2">
                       {trip?.needs.map(need => (
                         <Badge key={need} className="bg-primary/5 text-primary border-none rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                            {t('matchedNeeds')}: {need}
                         </Badge>
                       ))}
                    </div>

                    <div className="pt-6 border-t border-zinc-50 flex items-center gap-4">
                       <Button 
                        disabled={isSelecting === guide.id}
                        onClick={() => handleSelectGuide(guide.id)}
                        className="flex-1 h-16 rounded-2xl ai-gradient font-black text-lg uppercase tracking-widest gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                       >
                         {isSelecting === guide.id ? <Loader2 className="h-6 w-6 animate-spin" /> : <MessageSquare className="h-6 w-6" />}
                         {t('selectGuide')}
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
