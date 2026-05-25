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
  Moon,
  RotateCcw,
  Navigation,
  Plus
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
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  pax: string;
  needs: string[];
  interests: string[];
  pace: string;
  itinerary_details: ItineraryDay[];
  created_at: string;
}

// Global Landmark Database (Shared between Planner and Itineraries)
const LANDMARK_DB: Record<string, any> = {
  "Taipei": {
    morning: ["台北 101 觀景台與信義區散策", "國立故宮博物院文物巡禮", "陽明山國家公園擎天崗健行", "龍山寺與剝皮寮巡禮"],
    afternoon: ["迪化街大稻埕老街探索", "松山文創園區設計展覽", "西門町電影街與萬年大樓", "象山親山步道登頂眺望"],
    evening: ["士林夜市必比登美食搜查", "饒河街夜市胡椒餅巡禮", "信義區頂級高空酒吧微醺", "寧夏夜市在地小吃大集合"]
  },
  "台北": {
    morning: ["台北 101 觀景台與信義區散策", "國立故宮博物院文物巡禮", "陽明山國家公園擎天崗健行", "中正紀念堂與大安森林公園"],
    afternoon: ["迪化街大稻埕老街探索", "松山文創園區設計展覽", "西門町電影街與萬年大樓", "象山親山步道登頂眺望"],
    evening: ["士林夜市必比登美食搜查", "饒河街夜市胡椒餅巡禮", "信義區頂級高空酒吧微醺", "寧夏夜市在地小吃大集合"]
  },
  "Kyoto": {
    morning: ["清水寺舞台與產寧坂漫步", "金閣寺鏡湖池倒影欣賞", "伏見稻荷大社千本鳥居健行", "嵐山竹林小徑晨間漫步"],
    afternoon: ["二條城世界文化遺產巡禮", "錦市場京都廚房美食探索", "銀閣寺哲學之道散策", "平安神宮與岡崎公園"],
    evening: ["祇園花見小路尋訪藝妓足跡", "鴨川河畔納涼床晚餐", "先斗町隱藏版懷石料理", "京都車站空中徑路看夜景"]
  },
  "京都": {
    morning: ["清水寺舞台與產寧坂漫步", "金閣寺鏡湖池倒影欣賞", "伏見稻荷大社千本鳥居健行", "嵐山竹林小徑晨間漫步"],
    afternoon: ["二條城世界文化遺產巡禮", "錦市場京都廚房美食探索", "銀閣寺哲學之道散策", "平安神宮與岡崎公園"],
    evening: ["祇園花見小路尋訪藝妓足跡", "鴨川河畔納涼床晚餐", "先斗町隱藏版懷石料理", "京都車站空中徑路看夜景"]
  },
  "Tokyo": {
    morning: ["築地場外市場海鮮早餐", "淺草寺雷門與仲見世通", "明治神宮大鳥居參拜", "上野恩賜公園與博物館"],
    afternoon: ["秋葉原電器街與動漫探索", "原宿表參道流行設計巡禮", "澀谷代代木公園與十字路口", "銀座時尚百貨旗艦店巡禮"],
    evening: ["新宿歌舞伎町夜生活體驗", "六本木之丘森大樓展望台夜景", "惠比壽花園廣場晚餐", "東京鐵塔赤羽橋浪漫夜景"]
  },
  "東京": {
    morning: ["築地場外市場海鮮早餐", "淺草寺雷門與仲見世通", "明治神宮大鳥居參拜", "上野恩賜公園與博物館"],
    afternoon: ["秋葉原電器街與動漫探索", "原宿表參道流行設計巡禮", "澀谷代代木公園與十字路口", "銀座時尚百貨旗艦店巡禮"],
    evening: ["新宿歌舞伎町夜生活體驗", "六本木之丘森大樓展望台夜景", "惠比壽花園廣場晚餐", "東京鐵塔赤羽橋浪漫夜景"]
  },
  "Paris": {
    morning: ["艾菲爾鐵塔戰神廣場野餐", "羅浮宮鎮館三寶深度參訪", "聖母院與塞納河畔漫步", "蒙馬特聖心堂俯瞰巴黎"],
    afternoon: ["香榭麗舍大道與凱旋門購物", "奧賽美術館印象派畫作", "瑪黑區設計小店與猶太美食", "歌劇院與拉法葉百貨"],
    evening: ["塞納河遊船晚餐巡禮", "拉丁區隱藏版法式小館", "紅磨坊康康舞歌舞表演", "夏祐宮拍艾菲爾鐵塔夜景"]
  },
  "巴黎": {
    morning: ["艾菲爾鐵塔戰神廣場野餐", "羅浮宮鎮館三寶深度參訪", "聖母院與塞納河畔漫步", "蒙馬特聖心堂俯瞰巴黎"],
    afternoon: ["香榭麗舍大道與凱旋門購物", "奧賽美術館印象派畫作", "瑪黑區設計小店與猶太美食", "歌劇院與拉法葉百貨"],
    evening: ["塞納河遊船晚餐巡禮", "拉丁區隱藏版法式小館", "紅磨坊康康舞歌舞表演", "夏祐宮拍艾菲爾鐵塔夜景"]
  }
}

export default function MyItinerariesPage() {
  const t = useTranslations('AIPlanner')
  const router = useRouter()
  const supabase = createClient()
  
  const [trips, setTrips] = useState<SavedTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null)

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

  const handleRegenerate = async (trip: SavedTrip) => {
    setIsRegenerating(trip.id)
    
    try {
      const activityPool = t.raw('result.activityPool')
      const dest = trip.destination;
      
      const dbKey = Object.keys(LANDMARK_DB).find(key => 
        dest.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(dest.toLowerCase())
      );

      const shuffle = (array: string[]) => [...array].sort(() => Math.random() - 0.5);
      
      const morns = dbKey ? shuffle(LANDMARK_DB[dbKey].morning) : shuffle(activityPool.morning);
      const afts = dbKey ? shuffle(LANDMARK_DB[dbKey].afternoon) : shuffle(activityPool.afternoon);
      const eves = dbKey ? shuffle(LANDMARK_DB[dbKey].evening) : shuffle(activityPool.evening);

      const newDetails = trip.itinerary_details.map((day, i) => {
        const morn = morns[i % morns.length].replace('{destination}', dest);
        const aft = afts[i % afts.length].replace('{destination}', dest);
        const eve = eves[i % eves.length].replace('{destination}', dest);

        return {
          itinerary_id: trip.id,
          day_number: day.day_number,
          morning: morn,
          afternoon: aft,
          evening: eve
        }
      })

      await supabase.from('itinerary_details').delete().eq('itinerary_id', trip.id)
      const { error } = await supabase.from('itinerary_details').insert(newDetails)

      if (error) throw error
      
      toast.success("Itinerary updated!")
      fetchTrips()
    } catch (err) {
      toast.error("Error regenerating itinerary")
    } finally {
      setIsRegenerating(null)
    }
  }

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
           <div className="h-12 w-12 rounded-2xl ai-gradient animate-spin flex items-center justify-center">
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 font-rounded">{t('result.myItineraries')}</h1>
            <p className="text-zinc-500 font-medium text-lg leading-relaxed">{t('result.subtitleManage')}</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/50">
             <div className="px-6 border-r border-zinc-100 text-center">
               <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">{t('result.activePlans')}</p>
               <p className={cn("text-3xl font-black", futureTrips.length >= 5 ? "text-red-500" : "ai-text-gradient")}>
                 {futureTrips.length} <span className="text-sm text-zinc-300">/ 5</span>
               </p>
             </div>
             <Button onClick={() => router.push("/ai-planner")} className="rounded-2xl font-black h-12 px-6 ai-gradient shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all">
               <Plus className="h-5 w-5 mr-1" />
               {t('result.newPlan')}
             </Button>
          </div>
        </div>

        {trips.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent py-24 rounded-[3rem]">
            <CardContent className="flex flex-col items-center space-y-8">
              <div className="h-24 w-24 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center">
                <Calendar className="h-12 w-12 text-zinc-200" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-black text-zinc-800 uppercase tracking-tight">{t('result.noItineraries')}</h3>
                <p className="text-zinc-500 max-w-xs font-medium">{t('result.noItinerariesDesc')}</p>
              </div>
              <Button onClick={() => router.push("/ai-planner")} size="lg" className="rounded-2xl px-12 h-16 text-xl font-black shadow-2xl shadow-primary/20">
                {t('result.startPlanning')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-20">
            {futureTrips.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-10 w-1.5 ai-gradient rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-widest uppercase font-rounded">{t('result.upcomingJourneys')}</h2>
                </div>
                <div className="grid gap-8">
                  {futureTrips.map(trip => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      onDelete={handleDelete} 
                      onRegenerate={handleRegenerate}
                      isRegenerating={isRegenerating}
                      t={t} 
                    />
                  ))}
                </div>
              </section>
            )}

            {pastTrips.length > 0 && (
              <section className="space-y-8 opacity-70">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-10 w-1.5 bg-zinc-300 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-black text-zinc-400 tracking-widest uppercase font-rounded">{t('result.pastMemories')}</h2>
                </div>
                <div className="grid gap-8">
                  {pastTrips.map(trip => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      onDelete={handleDelete} 
                      onRegenerate={handleRegenerate}
                      isRegenerating={isRegenerating}
                      t={t} 
                    />
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

function TripCard({ 
  trip, 
  onDelete, 
  onRegenerate,
  isRegenerating,
  t 
}: { 
  trip: SavedTrip, 
  onDelete: (id: string) => void, 
  onRegenerate: (trip: SavedTrip) => void,
  isRegenerating: string | null,
  t: any 
}) {
  return (
    <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[3rem] overflow-hidden bg-white group hover:shadow-primary/5 transition-all duration-500">
      <Accordion>
        <AccordionItem value={trip.id} className="border-none">
          <div className="flex flex-col md:flex-row md:items-center p-6 md:p-10 gap-8">
            <AccordionTrigger render={
              <div className="flex-1 text-left flex flex-col md:flex-row md:items-center gap-6 cursor-pointer">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-[2.5rem] bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100 group-hover:ai-gradient group-hover:border-transparent transition-all duration-500 shadow-inner">
                  <MapPin className="h-10 w-10 text-primary group-hover:text-white transition-colors duration-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 flex items-center gap-1.5">
                      <Navigation className="h-3 w-3" />
                      {trip.destination}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-50 text-zinc-500 text-[10px] font-black uppercase tracking-widest border border-zinc-100 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {t('result.daysCount', { count: trip.itinerary_details.length })}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-zinc-900 font-rounded tracking-wide group-hover:ai-text-gradient transition-all">{trip.name}</h3>
                  <div className="flex items-center gap-2 text-zinc-400 font-bold text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(trip.start_date), "yyyy/MM/dd")} — {format(new Date(trip.end_date), "yyyy/MM/dd")}</span>
                  </div>
                </div>
              </div>
            } />
            
            <div className="flex items-center gap-3 self-end md:self-center pr-4">
               <Dialog>
                <DialogTrigger render={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border-2 border-transparent hover:border-red-100 shadow-none"
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
                } />
                <DialogContent className="bg-white/95 backdrop-blur-xl border-white/40 max-w-md p-12 rounded-[3.5rem] shadow-2xl">
                  <DialogHeader className="space-y-6">
                    <div className="h-16 w-16 rounded-[2rem] bg-red-50 flex items-center justify-center mx-auto sm:mx-0 shadow-inner">
                      <Trash2 className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <DialogTitle className="text-3xl font-black text-zinc-900 font-rounded tracking-widest uppercase">{t('result.deleteConfirmTitle')}</DialogTitle>
                      <DialogDescription className="text-zinc-500 font-medium text-lg leading-relaxed">
                        {t('result.deleteConfirmDesc', { name: trip.name })}
                      </DialogDescription>
                    </div>
                  </DialogHeader>
                  <DialogFooter className="mt-10 flex flex-col sm:flex-row gap-4">
                    <DialogTrigger render={
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black uppercase text-xs tracking-widest hover:bg-zinc-50">
                        {t('result.deleteConfirmCancel')}
                      </Button>
                    } />
                    <Button 
                      variant="destructive" 
                      className="flex-1 h-14 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30"
                      onClick={() => onDelete(trip.id)}
                    >
                      {t('result.deleteConfirmAction')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <AccordionContent className="bg-zinc-50/50 p-0 overflow-hidden">
            <div className="p-6 md:p-12 space-y-12">
              <div className="grid gap-10">
                {trip.itinerary_details.sort((a, b) => a.day_number - b.day_number).map(day => (
                  <div key={day.day_number} className="relative pl-12 md:pl-16 space-y-6">
                     {/* Timeline Indicator */}
                     <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-200">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center shadow-sm">
                           <span className="text-[10px] font-black text-zinc-400">{day.day_number}</span>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <h4 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] font-rounded">{t('result.dayTitle', { day: day.day_number })}</h4>
                        <div className="h-px flex-1 bg-zinc-100" />
                     </div>

                     <div className="grid gap-4 md:grid-cols-3">
                        <TimeBlock icon={<Sun className="h-4 w-4" />} label={t('result.morning')} text={day.morning} color="amber" />
                        <TimeBlock icon={<Sunset className="h-4 w-4" />} label={t('result.afternoon')} text={day.afternoon} color="blue" />
                        <TimeBlock icon={<Moon className="h-4 w-4" />} label={t('result.evening')} text={day.evening} color="indigo" />
                     </div>
                  </div>
                ))}
              </div>

              <div className="pt-10 border-t border-zinc-200 flex flex-col sm:flex-row gap-5">
                <Button 
                  variant="outline"
                  className="flex-1 h-16 rounded-2xl border-2 font-black text-lg gap-2 hover:bg-white hover:border-zinc-900 transition-all shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate(trip);
                  }}
                  disabled={isRegenerating === trip.id}
                >
                  <RotateCcw className={cn("h-5 w-5", isRegenerating === trip.id && "animate-spin")} />
                  {isRegenerating === trip.id ? "Analyzing..." : t('result.regenerate')}
                </Button>
                <Link href={`/explore?matched=true&dest=${trip.destination}`} className="flex-[2] block w-full">
                  <Button 
                    render={
                      <button>
                        {t('result.hireGuide')}
                        <ArrowRight className="ml-2 h-5 w-6" />
                      </button>
                    }
                    className="w-full h-16 rounded-2xl font-black text-xl gap-2 shadow-2xl shadow-primary/30 ai-gradient-hover scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all" 
                  />
                </Link>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}

function TimeBlock({ icon, label, text, color }: { icon: React.ReactNode, label: string, text: string, color: string }) {
  const colorMap: Record<string, { border: string, text: string, bg: string }> = {
    amber: { border: "border-amber-500/30", text: "text-amber-600", bg: "bg-amber-500/5" },
    blue: { border: "border-blue-500/30", text: "text-blue-600", bg: "bg-blue-500/5" },
    indigo: { border: "border-indigo-500/30", text: "text-indigo-600", bg: "bg-indigo-500/5" }
  }
  
  return (
    <div className={cn("p-6 rounded-[2rem] border-2 bg-white transition-all hover:shadow-lg hover:shadow-zinc-100 space-y-3", colorMap[color].border)}>
      <div className={cn("flex items-center gap-2 font-black text-[10px] uppercase tracking-widest", colorMap[color].text)}>
        {icon}
        {label}
      </div>
      <p className="text-zinc-800 font-bold text-sm leading-relaxed">{text}</p>
    </div>
  )
}
