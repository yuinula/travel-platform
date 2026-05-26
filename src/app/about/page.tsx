"use client"

import { useTranslations } from 'next-intl'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Sparkles, 
  Rocket, 
  Brain, 
  Cloud, 
  ShieldCheck, 
  MapPin, 
  Users, 
  CheckCircle2,
  Calendar,
  History
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AboutPage() {
  const t = useTranslations('About')

  const icons = [
    <Rocket key="0" className="h-6 w-6 text-primary" />,
    <Brain key="1" className="h-6 w-6 text-emerald-500" />,
    <Cloud key="2" className="h-6 w-6 text-blue-500" />,
    <ShieldCheck key="3" className="h-6 w-6 text-amber-500" />,
    <MapPin key="4" className="h-6 w-6 text-rose-500" />,
    <Users key="5" className="h-6 w-6 text-indigo-500" />
  ]

  const timelineData = t.raw('timeline')

  return (
    <div className="min-h-screen bg-zinc-50/50 py-20">
      <div className="container max-w-4xl mx-auto px-4 space-y-20">
        {/* Header Section */}
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-600 text-xs md:text-sm font-bold uppercase tracking-widest">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Evolution of Trip Butler</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 font-rounded uppercase italic">
              {t('title')}
            </h1>
            <p className="text-zinc-500 font-medium text-lg md:text-xl leading-relaxed max-w-2xl mx-auto italic">
              {t('subtitle')}
            </p>
          </div>
          <div className="h-20 w-px bg-gradient-to-b from-primary/50 to-transparent mx-auto" />
        </div>

        {/* Vision Section */}
        <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[3rem] p-10 md:p-16 bg-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
              <History className="h-40 w-40 text-primary" />
           </div>
           <div className="relative z-10 space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-widest text-primary font-rounded italic">Our Mission</h2>
              <p className="text-xl md:text-2xl text-zinc-800 font-bold leading-relaxed">
                &ldquo;{t('description')}&rdquo;
              </p>
           </div>
        </Card>

        {/* Timeline Section */}
        <div className="space-y-12">
          <div className="flex items-center gap-4 px-4">
            <div className="h-10 w-1.5 ai-gradient rounded-full" />
            <h2 className="text-3xl font-black text-zinc-900 tracking-widest uppercase font-rounded italic">{t('historyTitle')}</h2>
          </div>

          <div className="relative pl-8 md:pl-0 space-y-12 before:absolute before:left-8 md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-zinc-200">
            {timelineData.map((item: any, i: number) => (
              <div key={i} className={cn(
                "relative flex flex-col md:flex-row items-center gap-8 md:gap-20",
                i % 2 === 0 ? "md:flex-row-reverse" : ""
              )}>
                {/* Connector Dot */}
                <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-white border-2 border-zinc-100 shadow-xl flex items-center justify-center z-10 transition-transform hover:scale-110">
                   {icons[i % icons.length]}
                </div>

                {/* Content Card */}
                <div className="flex-1 w-full">
                  <div className={cn(
                    "bg-white p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200/30 border border-zinc-50 group hover:border-primary/20 transition-all duration-500",
                    i % 2 === 0 ? "md:text-right" : "md:text-left"
                  )}>
                    <Badge variant="outline" className="mb-4 rounded-full border-zinc-100 text-zinc-400 font-black text-[10px] tracking-widest">
                       <Calendar className="h-3 w-3 mr-1" />
                       {item.date}
                    </Badge>
                    <h3 className="text-xl font-black text-zinc-900 font-rounded mb-3 group-hover:ai-text-gradient transition-all">{item.title}</h3>
                    <p className="text-zinc-500 font-medium text-sm leading-relaxed italic">
                      {item.content}
                    </p>
                  </div>
                </div>

                {/* Spacer for MD and above */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Accent */}
        <div className="text-center pt-20">
           <div className="h-20 w-px bg-gradient-to-t from-primary/50 to-transparent mx-auto mb-8" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">To be continued...</p>
        </div>
      </div>
    </div>
  )
}
