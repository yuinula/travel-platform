"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  Calendar
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

export default function AIPlannerPage() {
  const t = useTranslations('AIPlanner')
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [isFinishing, setIsFinishing] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

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
    if (currentQuestion.type === 'date-range' && dateRange?.from && dateRange?.to) {
      const formattedRange = `${format(dateRange.from, "yyyy/MM/dd")} - ${format(dateRange.to, "yyyy/MM/dd")}`
      setAnswers({ ...answers, [currentQuestion.id]: formattedRange })
    }

    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      finishPlanning()
    }
  }

  const finishPlanning = () => {
    setIsFinishing(true)
    setTimeout(() => {
      router.push("/explore?matched=true")
    }, 2500)
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
                        <SheetTrigger asChild>
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
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85vh] rounded-t-[3rem] p-0 overflow-hidden">
                          <SheetHeader className="p-8 pb-4">
                            <SheetTitle className="text-2xl font-bold">選擇您的旅行日期</SheetTitle>
                          </SheetHeader>
                          <div className="flex-1 overflow-y-auto px-4 pb-24 flex justify-center">
                            <div className="scale-90 md:scale-100 origin-top">
                              <CalendarComponent
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from || new Date()}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                className="rounded-3xl"
                              />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-zinc-100 z-10">
                            <Button 
                              className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20"
                              onClick={() => setIsCalendarOpen(false)}
                              disabled={!dateRange?.from || !dateRange?.to}
                            >
                              確認日期
                            </Button>
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
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      ) : (
        <div className="h-2 w-2 rounded-full bg-zinc-300 animate-ping" />
      )}
    </div>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="3" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
