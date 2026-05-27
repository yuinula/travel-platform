"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Wallet, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Receipt, 
  ArrowRight,
  TrendingUp,
  MapPin
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useBackofficeTheme } from "../layout"

export default function BackofficeDashboardPage() {
  const t = useTranslations("Backoffice.dashboard")
  const { theme } = useBackofficeTheme()
  const isDark = theme === "dark"
  const [role, setRole] = useState<"traveler" | "guide">("guide")

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={cn(
            "text-2xl font-black tracking-tight uppercase tracking-widest font-rounded transition-colors",
            isDark ? "text-white" : "text-zinc-900"
          )}>{t('title')}</h1>
          <p className="text-zinc-500 font-bold text-sm">{t('subtitle')}</p>
        </div>
        <Tabs defaultValue="guide" onValueChange={(v) => setRole(v as "traveler" | "guide")} className="w-full md:w-auto">
          <TabsList className={cn(
            "border p-1 rounded-xl h-auto transition-colors",
            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
          )}>
            <TabsTrigger value="traveler" className={cn(
              "font-black px-4 py-2 rounded-lg transition-all text-[10px] uppercase tracking-widest",
              isDark 
                ? "data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-zinc-500" 
                : "data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400"
            )}>{t('tabs.traveler')}</TabsTrigger>
            <TabsTrigger value="guide" className={cn(
              "font-black px-4 py-2 rounded-lg transition-all text-[10px] uppercase tracking-widest",
              isDark 
                ? "data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-zinc-500" 
                : "data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400"
            )}>{t('tabs.guide')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t('metrics.escrow')} value="$24,850" sub="Across 12 trips" icon={<Wallet className="h-5 w-5" />} color="blue" isDark={isDark} />
        <MetricCard title={t('metrics.liveSessions')} value="42" sub="Chatting right now" icon={<Clock className="h-5 w-5" />} color="purple" isDark={isDark} />
        <MetricCard title={t('metrics.matchRate')} value="94%" sub="+5.2% from last week" icon={<CheckCircle2 className="h-5 w-5" />} color="emerald" isDark={isDark} />
        <MetricCard title={t('metrics.feedback')} value="4.92" sub="Verified reviews only" icon={<Briefcase className="h-5 w-5" />} color="amber" isDark={isDark} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className={cn(
          "lg:col-span-2 rounded-[2rem] overflow-hidden shadow-xl border transition-colors",
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        )}>
          <CardHeader className={cn("p-6 border-b transition-colors", isDark ? "border-zinc-800" : "border-zinc-100")}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className={cn("text-lg font-black uppercase tracking-tight font-rounded", isDark ? "text-white" : "text-zinc-900")}>{t('recentTransactions')}</CardTitle>
                <CardDescription className="text-zinc-500 text-xs font-medium">Live feed of global platform payments.</CardDescription>
              </div>
              <Button variant="ghost" className="text-primary font-black uppercase text-[9px] tracking-[0.2em] hover:bg-primary/5 px-4 h-8">View Ledger</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className={cn("divide-y transition-colors", isDark ? "divide-zinc-800" : "divide-zinc-100")}>
              {[
                { id: "TX-1024", name: "Kyoto Heritage Discovery", guide: "Hana S.", status: "Escrow", amount: "$450.00" },
                { id: "TX-1023", name: "Paris Art Secrets", guide: "Jean P.", status: "Settled", amount: "$320.00" },
                { id: "TX-1022", name: "Taipei Night Market", guide: "Chen W.", status: "Escrow", amount: "$120.00" },
              ].map((tx) => (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-primary/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center border",
                      isDark ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                    )}>
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={cn("font-black text-sm font-rounded", isDark ? "text-white" : "text-zinc-900")}>{tx.name}</p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Guide: {tx.guide} • ID: {tx.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-black text-lg font-rounded", isDark ? "text-white" : "text-zinc-900")}>{tx.amount}</p>
                    <Badge className={cn(
                      "mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all",
                      tx.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                    )}>{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className={cn("p-4 flex justify-center border-t transition-colors", isDark ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-100")}>
             <Link href="#" className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors font-black text-[9px] uppercase tracking-[0.3em]">
               Generate Financial Report <ArrowRight className="h-3 w-3" />
             </Link>
          </CardFooter>
        </Card>

        <Card className={cn(
          "rounded-[2rem] overflow-hidden shadow-xl flex flex-col border transition-colors",
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        )}>
          <CardHeader className={cn("p-6 border-b transition-colors", isDark ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-100")}>
            <CardTitle className={cn("text-lg font-black uppercase tracking-tight font-rounded", isDark ? "text-white" : "text-zinc-900")}>{t('marketIntelligence')}</CardTitle>
            <CardDescription className="text-zinc-500 text-xs font-medium mt-0.5">Trending destinations & growth.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1">
             {[
               { city: "Kyoto", count: "124 matches", growth: "+12%" },
               { city: "Paris", count: "89 matches", growth: "+5%" },
               { city: "Bali", count: "76 matches", growth: "+24%" },
               { city: "Taipei", count: "64 matches", growth: "+18%" },
             ].map((city) => (
               <div key={city.city} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)] group-hover:scale-125 transition-transform" />
                    <div>
                      <p className={cn("font-black text-sm font-rounded", isDark ? "text-white" : "text-zinc-900")}>{city.city}</p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{city.count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
                    <TrendingUp className="h-4 w-4" />
                    {city.growth}
                  </div>
               </div>
             ))}
          </CardContent>
          <div className="p-6 pt-0">
             <Button className={cn(
               "w-full h-12 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all",
               isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
             )}>
               Open Analytics Suite
             </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, sub, icon, color, isDark }: { title: string, value: string, sub: string, icon: React.ReactNode, color: string, isDark: boolean }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  }
  
  return (
    <Card className={cn(
      "p-5 rounded-[1.5rem] transition-all border-l-4 shadow-xl group border",
      isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
    )} style={{ borderLeftColor: `var(--${color}-500)` }}>
      <div className="flex flex-row items-center justify-between pb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-primary transition-colors">{title}</span>
        <div className={cn("p-2 rounded-lg border", colorMap[color])}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className={cn("text-2xl font-black font-rounded", isDark ? "text-white" : "text-zinc-900")}>{value}</h3>
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{sub}</p>
      </div>
    </Card>
  )
}
