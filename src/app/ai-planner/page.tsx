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

interface SavedTrip {
  id: string;
  name: string;
  destination: string;
  dateRange: { from: string, to: string };
  itinerary: ItineraryDay[];
  createdAt: string;
}

export default function AIPlannerPage() {
  const t = useTranslations('AIPlanner')
  const router = useRouter()
  
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [isFinishing, setIsFinishing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [tripName, setTripName] = useState("")
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [numberOfMonths, setNumberOfMonths] = useState(2)

  useEffect(() => {
    const handleResize = () => {
      setNumberOfMonths(window.innerWidth < 768 ? 1 : 2)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const questions: Question[] = [
    { 
      id: "destination", 
      text: t('questions.destination.text'), 
      icon: <MapPin className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />,
      placeholder: t('questions.destination.placeholder'),
      type: 'text'
    },
    { 
      id: "dates", 
      text: t('questions.dates.text'), 
      icon: <Calendar className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />,
      type: 'date-range'
    },
    { 
      id: "pax", 
      text: t('questions.pax.text'), 
      icon: <Users className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />,
      options: t.raw('questions.pax.options'),
      type: 'choice'
    },
    { 
      id: "needs", 
      text: t('questions.needs.text'), 
      icon: <Accessibility className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />,
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
      limit: 2
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
    // Check 5 future trips limit from Supabase
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

  const generateItinerary = () => {
    const dest = (answers.destination as string) || "Japan"
    const interests = (answers.interests as string[]) || ["Local Culture", "Food"]
    const pace = (answers.pace as string) || "Balanced"
    
    let days = 3;
    if (dateRange?.from && dateRange?.to) {
      const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Set default trip name
    setTripName(t('result.defaultTripName', { destination: dest, days }))

    const activityPool = {
      morning: ["Historical Landmarks", "Local Breakfast Market", "Scenic Mountain Hike", "Museum visit", "Craft Workshop", "Garden Morning Walk", "Guided Walking Tour"],
      afternoon: ["Hidden Gems Discovery", "Cooking Class", "Architecture Sightseeing", "Boat Cruise", "Fashion Shopping", "Wellness Spa", "Tea Ceremony"],
      evening: ["Night Market Tour", "Skyline Rooftop Dinner", "Cultural Performance", "Illuminated Walk", "Local Pub Crawl", "Hidden Bistro", "Night Photography"]
    }

    const shuffle = (array: string[]) => [...array].sort(() => Math.random() - 0.5);
    const morns = shuffle(activityPool.morning);
    const afts = shuffle(activityPool.afternoon);
    const eves = shuffle(activityPool.evening);

    const mockPlan: ItineraryDay[] = Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      morning: `${morns[i % morns.length]} (Focused on ${interests[0] || 'Discovery'})`,
      afternoon: `${afts[i % afts.length]} (Interests: ${interests.join(', ')})`,
      evening: `${eves[i % eves.length]} (${pace} Style)`
    }))
    
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
      // 1. Insert into Master table
      const { data: trip, error: masterError } = await supabase
        .from('itineraries')
        .insert([{
          user_id: user.id,
          name: tripName,
          destination: (answers.destination as string),
          start_date: dateRange!.from!.toISOString().split('T')[0],
          end_date: dateRange!.to!.toISOString().split('T')[0]
        }])
        .select()
        .single()

      if (masterError) throw masterError

      // 2. Insert all days into Details table
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
      setTimeout(handleNext, 300) 
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
               <div className="space-y-2">
                 <Label className="text-xs uppercase font-black tracking-widest text-zinc-400">{t('result.tripNameLabel')}</Label>
                 <Input 
                   value={tripName}
                   onChange={(e) => setTripName(e.target.value)}
                   className="text-2xl md:text-4xl h-auto py-4 text-center font-black border-none bg-transparent focus-visible:ring-0 focus-visible:bg-white/50 rounded-3xl"
                   placeholder={t('result.tripNamePlaceholder')}
                 />
               </div>
               <div className="flex items-center justify-center gap-2 text-zinc-500 font-bold">
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
                        <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest">
                          <Sun className="h-4 w-4" />
                          {t('result.morning')}
                        </div>
                        <p className="text-zinc-800 font-bold leading-relaxed">{item.morning}</p>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-blue-50/50 border border-blue-100/50 space-y-3">
                        <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
                          <Sunset className="h-4 w-4" />
                          {t('result.afternoon')}
                        </div>
                        <p className="text-zinc-800 font-bold leading-relaxed">{item.afternoon}</p>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50 space-y-3">
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                          <Moon className="h-4 w-4" />
                          {t('result.evening')}
                        </div>
                        <p className="text-zinc-800 font-bold leading-relaxed">{item.evening}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <CardContent className="p-8 md:p-12 bg-zinc-50/30 border-t border-zinc-100 flex flex-col gap-6">
              <Button 
                size="lg" 
                className="w-full h-20 rounded-3xl font-black text-2xl gap-3 shadow-2xl shadow-primary/30 ai-gradient-hover scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={handleSaveTrip}
              >
                <Save className="h-6 w-6" />
                {t('result.saveItinerary')}
              </Button>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 h-16 rounded-2xl border-2 font-bold text-lg gap-2 hover:bg-white"
                  onClick={() => {
                    setIsFinishing(true);
                    setShowResult(false);
                    generateItinerary();
                    setTimeout(() => {
                      setIsFinishing(false);
                      setShowResult(true);
                    }, 2000);
                  }}
                >
                  <RotateCcw className="h-5 w-5" />
                  {t('result.regenerate')}
                </Button>
                <Button 
                  variant="outline"
                  size="lg" 
                  className="flex-1 h-16 rounded-2xl border-2 font-bold text-lg gap-2 hover:bg-white"
                  onClick={() => router.push("/explore?matched=true")}
                >
                  <Edit3 className="h-5 w-5" />
                  {t('result.editManually')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 flex flex-col justify-center">
      <div className="container py-8 md:py-16 max-w-3xl mx-auto px-4">
        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-600 text-xs md:text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="ai-text-gradient font-bold">{t('badge')}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900">{t('title')}</h1>
          </div>

          <div className="max-w-2xl mx-auto w-full space-y-8">
            <CustomProgress value={progress} />

            {!isFinishing ? (
              <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="flex flex-row items-center gap-5 pb-4 p-8 md:p-10 border-b border-zinc-50">
                  <div className="p-4 bg-zinc-50 rounded-2xl">
                    {currentQuestion.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl md:text-2xl font-bold text-zinc-800">{currentQuestion.text}</CardTitle>
                    {currentQuestion.type === 'multi-choice' && (
                      <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
                        {t(`questions.${currentQuestion.id}.limitHint`)}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-6 p-8 md:p-10">
                  {currentQuestion.type === 'date-range' ? (
                    <div className="flex flex-col items-center space-y-6">
                      <Sheet open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <SheetTrigger 
                          render={
                            <Button 
                              variant="outline" 
                              className="w-full h-20 md:h-24 text-lg md:text-2xl rounded-3xl border-2 border-zinc-100 flex items-center justify-between px-8 bg-zinc-50/50 hover:bg-zinc-100 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <Calendar className="h-6 w-6 text-purple-500" />
                                <span className={cn(!dateRange?.from && "text-zinc-400")}>
                                  {dateRange?.from ? (
                                    dateRange.to ? (
                                      <>
                                        {format(dateRange.from, "yyyy/MM/dd")} - {format(dateRange.to, "yyyy/MM/dd")}
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
                      
                      {currentQuestion.type === 'multi-choice' && (
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
                          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
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
                </CardContent>
                <div className="px-10 pb-8 flex justify-between items-center text-xs md:text-sm text-muted-foreground border-t border-zinc-50 pt-6">
                  <button 
                    onClick={() => setStep(Math.max(0, step - 1))}
                    className="flex items-center hover:text-zinc-900 font-bold transition-colors"
                    disabled={step === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t('previous')}
                  </button>
                  <span className="font-bold uppercase tracking-widest">{t('questionCount', { current: step + 1, total: questions.length })}</span>
                </div>
              </Card>
            ) : (
              <div className="text-center space-y-10 py-16 animate-in fade-in zoom-in-95 duration-700">
                <div className="flex justify-center">
                  <div className="h-28 w-28 ai-gradient rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 animate-pulse rotate-12">
                    <Sparkles className="h-14 w-14 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-black text-zinc-900">{t('finding')}</h2>
                  <p className="text-base md:text-xl text-zinc-500 px-4 leading-relaxed">
                    {t('analyzing', { count: Object.keys(answers).length, destination: answers.destination as string })}
                  </p>
                </div>
                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                  <LoadingItem label={t('scanning')} done={true} />
                  <LoadingItem label={t('filtering')} done={true} />
                  <LoadingItem label={t('matching')} done={false} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingItem({ label, done }: { label: string, done: boolean }) {
  return (
    <div className={cn(
      "flex justify-between items-center p-5 rounded-2xl border-2 transition-all duration-500",
      done ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-white border-zinc-100 text-zinc-400 animate-pulse"
    )}>
      <span className="font-bold text-sm md:text-base">{label}</span>
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      ) : (
        <div className="h-2 w-2 rounded-full bg-zinc-300 animate-ping" />
      )}
    </div>
  )
}
