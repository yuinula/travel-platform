"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  MapPin, 
  Heart,
  Accessibility,
  Plane,
  Check,
  Search,
  Calendar,
  RotateCcw,
  Edit3,
  Sun,
  Sunset,
  Moon,
  Save,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { createClient } from "@/lib/supabase"

// Simple Progress bar replacement
function CustomProgress({ value }: { value: number }) {
  return (
    <div className="h-1.5 md:h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
      <div 
        className="h-full ai-gradient transition-all duration-700 ease-in-out" 
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

interface Question {
  id: string;
  text: string;
  icon: React.ReactNode;
  options?: string[];
  placeholder?: string;
  type: 'choice' | 'text' | 'number' | 'multi-choice' | 'date-range';
  limit?: number;
}

type Answers = Record<string, string | string[]>;

interface ItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
}

// Landmark Database for high-quality generation
const LANDMARK_DB: Record<string, any> = {
  "Taipei": {
    morning: ["台北 101 觀景台與信義區散策", "國立故宮博物院文物巡禮", "陽明山國家公園擎天崗健行", "中正紀念堂與大安森林公園"],
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

export default function AIPlannerPage() {
  const t = useTranslations('AIPlanner')
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [isFinishing, setIsFinishing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [tripName, setTripName] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [numberOfMonths, setNumberOfMonths] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      setNumberOfMonths(window.innerWidth >= 768 ? 2 : 1)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const questions: Question[] = [
    { 
      id: "destination", 
      text: t('questions.destination.text'), 
      placeholder: t('questions.destination.placeholder'),
      icon: <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />,
      type: 'text'
    },
    { 
      id: "dates", 
      text: t('questions.dates.text'), 
      icon: <Calendar className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />,
      type: 'date-range'
    },
    { 
      id: "pax", 
      text: t('questions.pax.text'), 
      icon: <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />,
      options: t.raw('questions.pax.options'),
      type: 'choice'
    },
    { 
      id: "needs", 
      text: t('questions.needs.text'), 
      icon: <Accessibility className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />,
      options: t.raw('questions.needs.options'),
      type: 'multi-choice',
      limit: 3
    },
    { 
      id: "interests", 
      text: t('questions.interests.text'), 
      icon: <Heart className="h-5 w-5 md:h-6 md:w-6 text-rose-500" />,
      options: t.raw('questions.interests.options'),
      type: 'multi-choice',
      limit: 3
    },
    { 
      id: "pace", 
      text: t('questions.pace.text'), 
      icon: <Plane className="h-5 w-5 md:h-6 md:w-6 text-indigo-500" />,
      options: t.raw('questions.pace.options'),
      type: 'choice'
    }
  ]

  const currentQuestion = questions[step]
  const progress = ((step + 1) / questions.length) * 100

  const handleNext = () => {
    if (currentQuestion.id === "dates" && dateRange?.from && dateRange?.to) {
      const formattedRange = `${format(dateRange.from, "yyyy/MM/dd")} - ${format(dateRange.to, "yyyy/MM/dd")}`
      setAnswers({ ...answers, [currentQuestion.id]: formattedRange })
    }

    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      checkLimitAndFinish()
    }
  }

  const checkLimitAndFinish = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { count } = await supabase
        .from('itineraries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('start_date', new Date().toISOString().split('T')[0])

      if (count && count >= 5) {
        toast.error(t('result.limitExceeded'), {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          duration: 5000,
        })
        return
      }
    }

    finishPlanning()
  }

  const generateItinerary = (params?: { dest?: string, interests?: string[], pace?: string, days?: number }) => {
    const dest = params?.dest || (answers.destination as string) || "Japan"
    const interests = params?.interests || (answers.interests as string[]) || ["Local Culture", "Food"]
    const pace = params?.pace || (answers.pace as string) || "Balanced"
    
    let days = params?.days || 3;
    if (!params?.days && dateRange?.from && dateRange?.to) {
      const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    if (!tripName) {
      setTripName(t('result.defaultTripName', { destination: dest, days }))
    }

    // Smart Landmark Selection Logic
    const activityPool = t.raw('result.activityPool')
    
    // Check if destination matches our DB (fuzzy match)
    const dbKey = Object.keys(LANDMARK_DB).find(key => 
      dest.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(dest.toLowerCase())
    );

    const shuffle = (array: string[]) => [...array].sort(() => Math.random() - 0.5);
    
    const morns = dbKey ? shuffle(LANDMARK_DB[dbKey].morning) : shuffle(activityPool.morning);
    const afts = dbKey ? shuffle(LANDMARK_DB[dbKey].afternoon) : shuffle(activityPool.afternoon);
    const eves = dbKey ? shuffle(LANDMARK_DB[dbKey].evening) : shuffle(activityPool.evening);

    const mockPlan: ItineraryDay[] = Array.from({ length: days }, (_, i) => {
      // If using generic pool, replace placeholder
      const morn = morns[i % morns.length].replace('{destination}', dest);
      const aft = afts[i % afts.length].replace('{destination}', dest);
      const eve = eves[i % eves.length].replace('{destination}', dest);
      
      return {
        day: i + 1,
        morning: morn,
        afternoon: aft,
        evening: eve
      }
    })
    
    setItinerary(mockPlan)
  }

  const finishPlanning = () => {
    setIsFinishing(true)
    generateItinerary()
    setTimeout(() => {
      setIsFinishing(false)
      setShowResult(true)
    }, 3000)
  }

  const handleSaveTrip = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error("Please login to save your itinerary")
      router.push("/login")
      return
    }

    try {
      const { data: trip, error: masterError } = await supabase
        .from('itineraries')
        .insert([{
          user_id: user.id,
          name: tripName,
          destination: (answers.destination as string),
          start_date: dateRange!.from!.toISOString().split('T')[0],
          end_date: dateRange!.to!.toISOString().split('T')[0],
          pax: (answers.pax as string),
          needs: (answers.needs as string[]),
          interests: (answers.interests as string[]),
          pace: (answers.pace as string)
        }])
        .select()
        .single()

      if (masterError) throw masterError

      const details = itinerary.map(day => ({
        itinerary_id: trip.id,
        day_number: day.day,
        morning: day.morning,
        afternoon: day.afternoon,
        evening: day.evening
      }))

      const { error: detailError } = await supabase
        .from('itinerary_details')
        .insert(details)

      if (detailError) throw detailError

      toast.success(t('result.saveSuccess'), {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      })
      
      router.push("/itineraries")
    } catch (err) {
      toast.error("Error saving to cloud. Please try again.")
    }
  }

  const handleSelect = (option: string) => {
    if (currentQuestion.type === 'multi-choice') {
      const currentAnswers = (answers[currentQuestion.id] as string[]) || []
      let newAnswers: string[]
      
      if (currentAnswers.includes(option)) {
        newAnswers = currentAnswers.filter((a: string) => a !== option)
      } else {
        if (currentAnswers.length >= (currentQuestion.limit || 1)) return 
        newAnswers = [...currentAnswers, option]
      }
      
      setAnswers({ ...answers, [currentQuestion.id]: newAnswers })
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: option })
    }
  }

  const isSelected = (option: string) => {
    const val = answers[currentQuestion.id]
    if (Array.isArray(val)) {
      return val.includes(option)
    }
    return val === option
  }

  const isContinueDisabled = () => {
    const val = answers[currentQuestion.id]
    if (currentQuestion.type === 'date-range') {
      return !dateRange?.from || !dateRange?.to
    }
    if (currentQuestion.type === 'multi-choice') {
      return !val || (val as string[]).length === 0
    }
    return !val
  }

  if (showResult) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 py-12 md:py-20">
        <div className="container max-w-4xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-600 text-xs md:text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="ai-text-gradient font-bold">{t('badge')}</span>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-4">
               <div className="space-y-2 relative group max-w-lg mx-auto">
                 <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">{t('result.tripNameLabel')}</Label>
                 <div className="relative">
                   <Input 
                     value={tripName}
                     onChange={(e) => setTripName(e.target.value)}
                     className="text-xl md:text-2xl h-auto py-6 px-12 text-center font-black border-2 border-zinc-200 bg-white focus-visible:ring-primary/20 rounded-[2rem] shadow-sm transition-all focus:border-primary hover:border-zinc-300"
                     placeholder={t('result.tripNamePlaceholder')}
                   />
                   <div className="absolute right-5 top-1/2 -translate-y-1/2 p-2 bg-zinc-50 rounded-xl text-zinc-300 group-hover:text-primary transition-colors pointer-events-none">
                     <Edit3 className="h-5 w-5" />
                   </div>
                 </div>
               </div>
               <div className="flex items-center justify-center gap-2 text-zinc-500 font-bold text-sm">
                 <Calendar className="h-4 w-4" />
                 {format(dateRange!.from!, "yyyy/MM/dd")} - {format(dateRange!.to!, "yyyy/MM/dd")}
               </div>
            </div>
          </div>

          <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[3rem] overflow-hidden bg-white">
            <Accordion className="w-full">
              {itinerary.map((item) => (
                <AccordionItem key={item.day} value={`day-${item.day}`} className="border-b border-zinc-50 last:border-0">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl ai-gradient flex items-center justify-center text-white font-black text-sm">
                        {item.day}
                      </div>
                      <span className="font-black text-xl">{t('result.dayTitle', { day: item.day })}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-6 md:grid-cols-3 pt-2">
                      <div className="p-6 rounded-[2rem] bg-amber-50/50 border border-amber-100/50 space-y-3">
                        <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest">
                          <Sun className="h-4 w-4" />
                          {t('result.morning')}
                        </div>
                        <p className="text-zinc-800 font-bold text-sm leading-relaxed">{item.morning}</p>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-blue-50/50 border border-blue-100/50 space-y-3">
                        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                          <Sunset className="h-4 w-4" />
                          {t('result.afternoon')}
                        </div>
                        <p className="text-zinc-800 font-bold text-sm leading-relaxed">{item.afternoon}</p>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50 space-y-3">
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                          <Moon className="h-4 w-4" />
                          {t('result.evening')}
                        </div>
                        <p className="text-zinc-800 font-bold text-sm leading-relaxed">{item.evening}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowResult(false)} 
              className="flex-1 h-16 rounded-2xl border-2 font-bold text-lg gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              {t('result.regenerate')}
            </Button>
            <Button 
              onClick={handleSaveTrip} 
              className="flex-[2] h-16 rounded-2xl ai-gradient font-black text-xl gap-2 shadow-xl shadow-primary/20"
            >
              <Save className="h-6 w-6" />
              {t('result.saveItinerary')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 flex items-center justify-center p-4">
      {isFinishing ? (
        <div className="text-center space-y-8 max-w-md mx-auto animate-in fade-in duration-1000">
          <div className="relative">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] md:rounded-[3.5rem] ai-gradient mx-auto animate-spin-slow flex items-center justify-center shadow-2xl shadow-primary/30">
              <Sparkles className="h-12 w-12 md:h-16 md:w-16 text-white" />
            </div>
            <div className="absolute -top-4 -right-4 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white shadow-lg flex items-center justify-center animate-bounce">
              <Plane className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 font-rounded uppercase tracking-widest">{t('loading.title')}</h2>
            <p className="text-zinc-500 font-medium text-lg">{t('loading.subtitle')}</p>
          </div>
          <div className="px-8">
            <CustomProgress value={65} />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 shadow-2xl shadow-zinc-200/50 border border-zinc-100/50">
          <div className="space-y-12">
            {/* Header */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl md:rounded-3xl bg-primary/5 flex items-center justify-center">
                    {currentQuestion.icon}
                  </div>
                  <span className="text-zinc-400 font-black text-sm tracking-[0.2em] font-rounded uppercase">{step + 1} / {questions.length}</span>
               </div>
               <div className="space-y-2">
                 <h1 className="text-2xl md:text-4xl font-black tracking-tight text-zinc-900 leading-tight">{currentQuestion.text}</h1>
                 <CustomProgress value={progress} />
               </div>
            </div>

            {/* Content */}
            <div className="min-h-[300px] flex flex-col justify-center">
               {currentQuestion.id === "dates" ? (
                    <div className="space-y-8 w-full">
                      <Sheet open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <SheetTrigger 
                          render={
                            <Button 
                              variant="outline" 
                              className="w-full h-24 md:h-32 rounded-3xl border-2 border-zinc-100 hover:border-primary hover:bg-primary/5 transition-all group px-8"
                            >
                              <div className="flex flex-col items-start gap-1 flex-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-primary transition-colors">Selected Period</span>
                                <span className="text-lg md:text-2xl font-black text-zinc-900">
                                  {dateRange?.from ? (
                                    dateRange.to ? (
                                      <>
                                        {format(dateRange.from, "yyyy/MM/dd")} 
                                        <span className="mx-2 text-zinc-300">→</span> 
                                        {format(dateRange.to, "yyyy/MM/dd")}
                                      </>
                                    ) : (
                                      format(dateRange.from, "yyyy/MM/dd")
                                    )
                                  ) : (
                                    "點擊選擇日期範圍"
                                  )}
                                </span>
                              </div>
                              <ChevronRight className="h-6 w-6 text-zinc-300" />
                            </Button>
                          }
                        />
                        <SheetContent side="bottom" className="h-[90vh] md:h-[85vh] rounded-t-[3rem] p-0 overflow-hidden bg-white">
                          <SheetHeader className="p-8 pb-4 text-center">
                            <SheetTitle className="text-2xl md:text-3xl font-black">選擇您的旅行日期</SheetTitle>
                          </SheetHeader>
                          <div className="flex-1 overflow-y-auto px-4 pb-32 flex justify-center items-start pt-4">
                            <div className="bg-white">
                              <CalendarComponent
                                mode="range"
                                defaultMonth={dateRange?.from || new Date()}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={numberOfMonths}
                                disabled={{ before: new Date() }}
                                className="rounded-3xl border-none shadow-none"
                              />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-md border-t border-zinc-100 z-50">
                            <div className="max-w-md mx-auto">
                              <Button 
                                className="w-full h-16 md:h-18 rounded-2xl text-xl font-bold shadow-2xl shadow-primary/30"
                                onClick={() => setIsCalendarOpen(false)}
                                disabled={!dateRange?.from || !dateRange?.to}
                              >
                                {dateRange?.from && dateRange?.to ? "確認日期" : "請選擇起始與結束日期"}
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>

                      <Button 
                        className="w-full h-16 md:h-20 text-lg md:text-2xl rounded-3xl font-bold shadow-xl shadow-primary/20" 
                        onClick={handleNext}
                        disabled={isContinueDisabled()}
                      >
                        {t('continue')}
                        <ChevronRight className="ml-2 h-6 w-6" />
                      </Button>
                    </div>
                  ) : currentQuestion.type === 'choice' || currentQuestion.type === 'multi-choice' ? (
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {currentQuestion.options?.map((option) => (
                        <Button 
                          key={option} 
                          variant="outline"
                          className={cn(
                            "justify-between h-16 md:h-20 text-base md:text-xl font-medium px-8 rounded-3xl transition-all duration-300 border-2",
                            isSelected(option) 
                              ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' 
                              : 'border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50'
                          )}
                          onClick={() => handleSelect(option)}
                        >
                          <span className="truncate pr-4">{option}</span>
                          {isSelected(option) && (
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </Button>
                      ))}
                      
                      {(currentQuestion.type === 'choice' || currentQuestion.type === 'multi-choice') && (
                        <Button 
                          className="w-full h-16 md:h-20 text-lg md:text-2xl rounded-3xl mt-6 font-bold shadow-xl shadow-primary/20" 
                          onClick={handleNext}
                          disabled={isContinueDisabled()}
                        >
                          {t('continue')}
                          <ChevronRight className="ml-2 h-6 w-6" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-300" />
                        <Input 
                          placeholder={currentQuestion.placeholder}
                          className="h-16 md:h-20 text-lg md:text-2xl px-16 rounded-3xl border-2 border-zinc-100 focus:border-primary transition-all bg-zinc-50/50"
                          value={(answers[currentQuestion.id] as string) || ""}
                          onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                        />
                      </div>
                      <Button 
                        className="w-full h-16 md:h-20 text-lg md:text-2xl rounded-3xl font-bold shadow-xl shadow-primary/20" 
                        onClick={handleNext}
                        disabled={isContinueDisabled()}
                      >
                        {t('continue')}
                        <ChevronRight className="ml-2 h-6 w-6" />
                      </Button>
                    </div>
                  )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-8 border-t border-zinc-50">
               <Button 
                variant="ghost" 
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="text-zinc-400 font-bold hover:text-zinc-900"
               >
                 <ChevronLeft className="mr-2 h-5 w-5" />
                 {t('back')}
               </Button>
               <div className="flex gap-1">
                 {questions.map((_, i) => (
                   <div 
                    key={i} 
                    className={cn(
                      "h-1.5 w-4 rounded-full transition-all duration-500",
                      i === step ? "w-8 ai-gradient" : "bg-zinc-100"
                    )} 
                   />
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
