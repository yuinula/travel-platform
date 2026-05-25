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

export default function BackofficeDashboardPage() {
  const [role, setRole] = useState<"traveler" | "guide">("guide")

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase text-glow">Platform Dashboard</h1>
          <p className="text-zinc-500 font-medium text-lg mt-1">Cross-role activity and financial overview.</p>
        </div>
        <Tabs defaultValue="guide" onValueChange={(v) => setRole(v as "traveler" | "guide")} className="w-full md:w-auto">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl h-auto">
            <TabsTrigger value="traveler" className="data-[state=active]:bg-white data-[state=active]:text-zinc-950 font-bold px-6 py-2 rounded-lg transition-all text-zinc-500">Traveler Activity</TabsTrigger>
            <TabsTrigger value="guide" className="data-[state=active]:bg-white data-[state=active]:text-zinc-950 font-bold px-6 py-2 rounded-lg transition-all text-zinc-500">Guide Operations</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Escrow Volume" value="$24,850" sub="Across 12 active trips" icon={<Wallet />} color="blue" />
        <MetricCard title="Live Sessions" value="42" sub="Chatting right now" icon={<Clock />} color="purple" />
        <MetricCard title="Match Rate" value="94%" sub="+5.2% from last week" icon={<CheckCircle2 />} color="emerald" />
        <MetricCard title="Avg. Feedback" value="4.92" sub="Verified reviews only" icon={<Briefcase />} color="amber" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-white">Recent Transactions</CardTitle>
                <CardDescription className="text-zinc-500 mt-1">Live feed of global platform payments.</CardDescription>
              </div>
              <Button variant="ghost" className="text-primary font-black uppercase text-xs tracking-widest hover:bg-primary/5">View Ledger</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {[
                { id: "TX-1024", name: "Kyoto Heritage Discovery", guide: "Hana S.", status: "Escrow", amount: "$450.00" },
                { id: "TX-1023", name: "Paris Art Secrets", guide: "Jean P.", status: "Settled", amount: "$320.00" },
                { id: "TX-1022", name: "Taipei Night Market", guide: "Chen W.", status: "Escrow", amount: "$120.00" },
              ].map((tx) => (
                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-white font-black text-base">{tx.name}</p>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Guide: {tx.guide} • ID: {tx.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-lg">{tx.amount}</p>
                    <Badge className={cn(
                      "mt-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider",
                      tx.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                    )}>{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-zinc-950/50 p-6 flex justify-center border-t border-zinc-800">
             <Link href="#" className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors font-black text-[10px] uppercase tracking-[0.2em]">
               Generate Financial Report <ArrowRight className="h-3 w-3" />
             </Link>
          </CardFooter>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
          <CardHeader className="p-8 bg-zinc-950/50 border-b border-zinc-800">
            <CardTitle className="text-xl font-black text-white">Market Intelligence</CardTitle>
            <CardDescription className="text-zinc-500 font-medium">Trending destinations & growth.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8 flex-1">
             {[
               { city: "Kyoto", count: "124 matches", growth: "+12%" },
               { city: "Paris", count: "89 matches", growth: "+5%" },
               { city: "Bali", count: "76 matches", growth: "+24%" },
               { city: "Taipei", count: "64 matches", growth: "+18%" },
             ].map((city) => (
               <div key={city.city} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] group-hover:scale-150 transition-transform" />
                    <div>
                      <p className="text-white font-black text-base">{city.city}</p>
                      <p className="text-zinc-500 text-xs font-bold">{city.count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500 font-black text-sm">
                    <TrendingUp className="h-4 w-4" />
                    {city.growth}
                  </div>
               </div>
             ))}
          </CardContent>
          <div className="p-8 pt-0">
             <Button className="w-full h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-black uppercase tracking-widest text-xs">
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
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-400 bg-amber-500/10"
  }
  
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-[2rem] hover:bg-zinc-800/50 transition-all border-l-4" style={{ borderLeftColor: `var(--${color}-500)` }}>
      <div className="flex flex-row items-center justify-between pb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{title}</span>
        <div className={cn("p-2 rounded-xl", colorMap[color])}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-black text-white">{value}</h3>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{sub}</p>
      </div>
    </Card>
  )
}
