"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Calendar, 
  MapPin, 
  Trash2, 
  Clock, 
  Sparkles,
  ArrowRight,
  Sun,
  Sunset,
  Moon
} from "lucide-react"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase"

interface ItineraryDay {
  day_number: number;
  morning: string;
  afternoon: string;
  evening: string;
}

interface SavedTrip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  itinerary_details: ItineraryDay[];
  created_at: string;
}

export default function MyItinerariesPage() {
  const t = useTranslations('AIPlanner')
  const router = useRouter()
  const supabase = createClient()
  
  const [trips, setTrips] = useState<SavedTrip[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTrips = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/login")
      return
    }

    const { data, error } = await supabase
      .from('itineraries')
      .select(`
        *,
        itinerary_details (*)
      `)
      .eq('user_id', user.id)
      .order('start_date', { ascending: true })
    
    if (data) setTrips(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error("Failed to remove itinerary")
    } else {
      setTrips(trips.filter(t => t.id !== id))
      toast.success(t('result.removed'))
    }
  }

  const futureTrips = trips.filter(trip => new Date(trip.start_date).getTime() >= new Date().setHours(0,0,0,0))
  const pastTrips = trips.filter(trip => new Date(trip.start_date).getTime() < new Date().setHours(0,0,0,0))

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="h-12 w-12 rounded-2xl ai-gradient animate-spin-slow flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
           </div>
           <p className="text-zinc-400 font-bold tracking-widest uppercase text-xs">Fetching your journeys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 py-12 md:py-20">
      <div className="container max-w-5xl mx-auto px-4 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">{t('result.myItineraries')}</h1>
            <p className="text-zinc-500 font-medium text-lg">{t('result.subtitleManage')}</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm">
             <div className="px-4 border-r border-zinc-100 text-center">
               <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">{t('result.activePlans')}</p>
               <p className={cn("text-2xl font-black", futureTrips.length >= 5 ? "text-red-500" : "text-primary")}>
                 {futureTrips.length} <span className="text-sm text-zinc-300">/ 5</span>
               </p>
             </div>
             <Button onClick={() => router.push("/ai-planner")} className="rounded-xl font-bold ai-gradient shadow-lg shadow-primary/20">
               <Sparkles className="h-4 w-4 mr-2" />
               {t('result.newPlan')}
             </Button>
          </div>
        </div>

        {trips.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent py-20">
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="h-20 w-20 rounded-3xl bg-zinc-100 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-zinc-300" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-800">{t('result.noItineraries')}</h3>
                <p className="text-zinc-500 max-w-xs">{t('result.noItinerariesDesc')}</p>
              </div>
              <Button onClick={() => router.push("/ai-planner")} size="lg" className="rounded-2xl px-10 h-14 text-lg font-bold">
                {t('result.startPlanning')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-16">
            {futureTrips.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-primary rounded-full" />
                  <h2 className="text-2xl font-black text-zinc-800 tracking-tight uppercase">{t('result.upcomingJourneys')}</h2>
                </div>
                <div className="grid gap-6">
                  {futureTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} onDelete={handleDelete} t={t} />
                  ))}
                </div>
              </section>
            )}

            {pastTrips.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-zinc-300 rounded-full" />
                  <h2 className="text-2xl font-black text-zinc-400 tracking-tight uppercase">{t('result.pastMemories')}</h2>
                </div>
                <div className="grid gap-6 opacity-60">
                  {pastTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} onDelete={handleDelete} t={t} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TripCard({ trip, onDelete, t }: { trip: SavedTrip, onDelete: (id: string) => void, t: any }) {
  return (
    <Card className="border-none shadow-xl shadow-zinc-200/40 rounded-[2.5rem] overflow-hidden bg-white group">
      <Accordion>
        <AccordionItem value={trip.id} className="border-none">
          <div className="flex items-center p-4 pr-8">
            <AccordionTrigger className="flex-1 hover:no-underline text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100 group-hover:bg-primary/5 transition-colors">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-black text-zinc-900 group-hover:ai-text-gradient transition-all">{trip.name}</h3>
                  <div className="flex items-center gap-4 text-zinc-500 font-bold text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(trip.start_date), "MMM dd")} - {format(new Date(trip.end_date), "MMM dd, yyyy")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {t('result.daysCount', { count: trip.itinerary_details.length })}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(trip.id);
              }}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>

          <AccordionContent className="bg-zinc-50/30">
            <div className="p-4 space-y-6">
              {trip.itinerary_details.sort((a, b) => a.day_number - b.day_number).map(day => (
                <div key={day.day_number} className="space-y-4">
                   <div className="flex items-center gap-3 px-4">
                     <span className="h-px flex-1 bg-zinc-200" />
                     <span className="font-black text-zinc-400 text-xs uppercase tracking-widest">{t('result.dayTitle', { day: day.day_number })}</span>
                     <span className="h-px flex-1 bg-zinc-200" />
                   </div>
                   <div className="grid gap-4 md:grid-cols-3">
                      <TimeBlock icon={<Sun />} label={t('result.morning')} text={day.morning} color="amber" />
                      <TimeBlock icon={<Sunset />} label={t('result.afternoon')} text={day.afternoon} color="blue" />
                      <TimeBlock icon={<Moon />} label={t('result.evening')} text={day.evening} color="indigo" />
                   </div>
                </div>
              ))}
              <div className="pt-6 border-t border-zinc-100">
                <Button 
                  render={
                    <a href={`/explore?matched=true&dest=${trip.destination}`}>
                      {t('result.hireGuide')}
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  }
                  className="w-full h-16 rounded-2xl font-black text-xl gap-2 shadow-lg shadow-primary/20" 
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}

function TimeBlock({ icon, label, text, color }: { icon: React.ReactNode, label: string, text: string, color: string }) {
  const colorMap: Record<string, string> = {
    amber: "bg-amber-50 text-amber-600 border-amber-100/50",
    blue: "bg-blue-50 text-blue-600 border-blue-100/50",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100/50"
  }
  
  return (
    <div className={cn("p-5 rounded-3xl border space-y-2", colorMap[color])}>
      <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest opacity-70">
        {icon}
        {label}
      </div>
      <p className="text-zinc-800 font-bold text-sm leading-relaxed">{text}</p>
    </div>
  )
}
