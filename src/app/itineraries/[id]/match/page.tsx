"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase"
import { 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [trip, setTrip] = useState<TripInfo | null>(null)
  const [guides, setGuides] = useState<MatchedGuide[]>([])
  const [isSelecting, setIsSelecting] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const { data: tripData } = await supabase
      .from('itineraries')
      .select('id, name, destination, start_date, end_date, needs')
      .eq('id', id)
      .single()
    
    if (tripData) {
      setTrip(tripData as any)
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
    setTimeout(() => setLoading(false), 2000)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      // Initial check
      handleScroll()
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [guides, loading])

  const handleSelectGuide = async (guideId: string) => {
    setIsSelecting(guideId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return; }

    try {
      const { data: newOrder, error } = await supabase
        .from('trips')
        .insert([{
          traveler_id: user.id,
          guide_id: guideId,
          status: 'Negotiation',
          start_date: trip?.start_date,
          end_date: trip?.end_date,
          total_price: 0
        }])
        .select().single()

      if (error) throw error
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
      <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center p-4">
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
              <p className="text-zinc-400 font-medium">Analyzing local experts for {trip?.destination}...</p>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 py-12 md:py-20 flex flex-col overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 md:px-12 space-y-12 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 shrink-0">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                <MapPin className="h-3.5 w-3.5" />
                {trip?.destination}
             </div>
             <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 font-rounded leading-tight">
               {t('found', { count: guides.length })}
             </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-zinc-50 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-zinc-400" />
               </div>
               <div className="text-[11px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                 {trip?.start_date} - {trip?.end_date}
               </div>
            </div>
            
            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex gap-2">
               <Button 
                variant="outline" 
                size="icon" 
                className={cn("rounded-full h-12 w-12 border-2 transition-all", !canScrollLeft && "opacity-30 cursor-not-allowed")}
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
               >
                 <ChevronLeft className="h-6 w-6" />
               </Button>
               <Button 
                variant="outline" 
                size="icon" 
                className={cn("rounded-full h-12 w-12 border-2 transition-all", !canScrollRight && "opacity-30 cursor-not-allowed")}
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
               >
                 <ChevronRight className="h-6 w-6" />
               </Button>
            </div>
          </div>
        </div>

        {guides.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-zinc-100 space-y-6 flex-1 flex flex-col justify-center items-center">
             <Users className="h-20 w-20 text-zinc-100 mx-auto" />
             <p className="text-zinc-400 font-black text-2xl uppercase tracking-widest">{t('noMatches')}</p>
             <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold">Try another destination</Button>
          </div>
        ) : (
          <div className="relative flex-1 -mx-4 md:-mx-12">
            <div 
              ref={scrollContainerRef}
              className="flex gap-6 md:gap-10 overflow-x-auto px-4 md:px-12 pb-12 pt-4 no-scrollbar snap-x snap-mandatory h-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {guides.map(guide => (
                <div key={guide.id} className="flex-none w-[320px] md:w-[450px] snap-center">
                  <Card className="h-full border-none shadow-xl shadow-zinc-200/50 rounded-[3rem] overflow-hidden bg-white group hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                    <CardContent className="p-8 md:p-10 flex flex-col h-full space-y-8">
                      {/* Avatar & Basic Info */}
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                          <Avatar className="h-32 w-32 md:h-40 md:w-40 rounded-[3rem] border-4 border-white shadow-2xl">
                            <AvatarImage src={guide.avatar_url} className="object-cover" />
                            <AvatarFallback className="bg-zinc-100 text-zinc-400 text-4xl font-black uppercase">
                              {guide.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
                             <ShieldCheck className="h-6 w-6" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl md:text-3xl font-black text-zinc-900 font-rounded mb-1">{guide.name}</h3>
                          <div className="flex items-center justify-center gap-3 text-zinc-400 font-bold text-xs uppercase tracking-widest">
                             <span className="flex items-center gap-1 text-amber-500">
                               <Star className="h-3.5 w-3.5 fill-current" /> {guide.rating_avg}
                             </span>
                             <span className="h-1 w-1 rounded-full bg-zinc-200" />
                             <span>{guide.review_count} Reviews</span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-6 flex-1">
                        <div className="flex justify-center gap-2 flex-wrap">
                           <Badge variant="outline" className="bg-zinc-50 border-zinc-100 rounded-full px-3 py-1 font-bold text-[10px] text-zinc-500">
                              <MapPin className="h-3 w-3 mr-1" /> {guide.service_areas?.[0] || 'Local Area'}
                           </Badge>
                           <Badge variant="outline" className="bg-primary/5 border-primary/10 rounded-full px-3 py-1 font-black text-[10px] text-primary uppercase tracking-tighter">
                              ${guide.hourly_rate}/{t('hourlyRate')}
                           </Badge>
                        </div>

                        <p className="text-zinc-500 text-sm font-medium leading-relaxed italic line-clamp-4 text-center px-2">
                          &ldquo;{guide.bio || "Dedicated local expert ready to provide an unforgettable authentic experience tailored to your unique interests."}&rdquo;
                        </p>
                      </div>

                      {/* Action */}
                      <div className="pt-6 border-t border-zinc-50 mt-auto">
                         <Button 
                          disabled={isSelecting === guide.id}
                          onClick={() => handleSelectGuide(guide.id)}
                          className="w-full h-16 rounded-[1.5rem] ai-gradient font-black text-base uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                         >
                           {isSelecting === guide.id ? <Loader2 className="h-6 w-6 animate-spin" /> : <MessageSquare className="h-6 w-6" />}
                           {t('selectGuide')}
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
