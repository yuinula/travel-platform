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

export default function BackofficeDashboardPage() {
  const t = useTranslations("Backoffice.dashboard")
  const [role, setRole] = useState<"traveler" | "guide">("guide")

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-white uppercase italic tracking-widest font-rounded">{t('title')}</h1>
          <p className="text-zinc-500 font-bold text-xl">{t('subtitle')}</p>
        </div>
        <Tabs defaultValue="guide" onValueChange={(v) => setRole(v as "traveler" | "guide")} className="w-full md:w-auto">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl h-auto">
            <TabsTrigger value="traveler" className="data-[state=active]:bg-white data-[state=active]:text-zinc-950 font-black px-8 py-3 rounded-xl transition-all text-zinc-500 text-sm uppercase tracking-widest">{t('tabs.traveler')}</TabsTrigger>
            <TabsTrigger value="guide" className="data-[state=active]:bg-white data-[state=active]:text-zinc-950 font-black px-8 py-3 rounded-xl transition-all text-zinc-500 text-sm uppercase tracking-widest">{t('tabs.guide')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title={t('metrics.escrow')} value="$24,850" sub="Across 12 active trips" icon={<Wallet className="h-6 w-6" />} color="blue" />
        <MetricCard title={t('metrics.liveSessions')} value="42" sub="Chatting right now" icon={<Clock className="h-6 w-6" />} color="purple" />
        <MetricCard title={t('metrics.matchRate')} value="94%" sub="+5.2% from last week" icon={<CheckCircle2 className="h-6 w-6" />} color="emerald" />
        <MetricCard title={t('metrics.feedback')} value="4.92" sub="Verified reviews only" icon={<Briefcase className="h-6 w-6" />} color="amber" />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 rounded-[3rem] overflow-hidden shadow-3xl">
          <CardHeader className="p-10 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-white uppercase tracking-tight font-rounded">{t('recentTransactions')}</CardTitle>
                <CardDescription className="text-zinc-500 text-base font-medium">Live feed of global platform payments.</CardDescription>
              </div>
              <Button variant="ghost" className="text-primary font-black uppercase text-xs tracking-[0.2em] hover:bg-primary/5 px-6">View Ledger</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {[
                { id: "TX-1024", name: "Kyoto Heritage Discovery", guide: "Hana S.", status: "Escrow", amount: "$450.00" },
                { id: "TX-1023", name: "Paris Art Secrets", guide: "Jean P.", status: "Settled", amount: "$320.00" },
                { id: "TX-1022", name: "Taipei Night Market", guide: "Chen W.", status: "Escrow", amount: "$120.00" },
              ].map((tx) => (
                <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-500 group-hover:text-primary group-hover:border-primary/50 transition-all duration-500">
                      <Receipt className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-white font-black text-xl font-rounded">{tx.name}</p>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Guide: {tx.guide} • ID: {tx.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-2xl font-rounded">{tx.amount}</p>
                    <Badge className={cn(
                      "mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                      tx.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                    )}>{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-zinc-950/50 p-8 flex justify-center border-t border-zinc-800">
             <Link href="#" className="flex items-center gap-3 text-zinc-600 hover:text-white transition-colors font-black text-xs uppercase tracking-[0.3em]">
               Generate Financial Report <ArrowRight className="h-4 w-4" />
             </Link>
          </CardFooter>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 rounded-[3rem] overflow-hidden shadow-3xl flex flex-col">
          <CardHeader className="p-10 bg-zinc-950/50 border-b border-zinc-800">
            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight font-rounded">{t('marketIntelligence')}</CardTitle>
            <CardDescription className="text-zinc-500 text-base font-medium mt-1">Trending destinations & growth.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-10 flex-1">
             {[
               { city: "Kyoto", count: "124 matches", growth: "+12%" },
               { city: "Paris", count: "89 matches", growth: "+5%" },
               { city: "Bali", count: "76 matches", growth: "+24%" },
               { city: "Taipei", count: "64 matches", growth: "+18%" },
             ].map((city) => (
               <div key={city.city} className="flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] group-hover:scale-150 transition-transform" />
                    <div>
                      <p className="text-white font-black text-xl font-rounded">{city.city}</p>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-0.5">{city.count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-black text-lg">
                    <TrendingUp className="h-5 w-5" />
                    {city.growth}
                  </div>
               </div>
             ))}
          </CardContent>
          <div className="p-10 pt-0">
             <Button className="w-full h-16 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-black uppercase tracking-[0.2em] text-sm shadow-xl">
               Open Analytics Suite
             </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, sub, icon, color }: { title: string, value: string, sub: string, icon: React.ReactNode, color: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  }
  
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-8 rounded-[2.5rem] hover:bg-zinc-800/50 transition-all border-l-4 shadow-2xl group" style={{ borderLeftColor: `var(--${color}-500)` }}>
      <div className="flex flex-row items-center justify-between pb-6">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-zinc-400 transition-colors">{title}</span>
        <div className={cn("p-3 rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", colorMap[color])}>
          {icon}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-4xl font-black text-white font-rounded">{value}</h3>
        <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">{sub}</p>
      </div>
    </Card>
  )
}
