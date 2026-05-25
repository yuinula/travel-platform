"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  BarChart3, 
  ShieldCheck, 
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminPortalPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">System Admin</h1>
          <p className="text-zinc-500 font-medium text-lg mt-1">Platform oversight and critical operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-black px-6 shadow-lg shadow-white/5">
            Critical Actions
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total GMV" value="$124,500" trend="+12.5%" icon={<ShoppingBag />} />
        <StatCard title="Active Guides" value="1,284" trend="+48 wk" icon={<Users />} />
        <StatCard title="Pending KYC" value="23" sub="Needs Review" icon={<ShieldCheck />} />
        <StatCard title="Open Disputes" value="2" sub="Critical" icon={<AlertTriangle />} isWarning />
      </div>

      <Tabs defaultValue="kyc" className="space-y-8">
        <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1.5 rounded-2xl h-auto">
          <TabsTrigger value="kyc" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white px-8 py-3 rounded-xl font-bold transition-all text-zinc-500">KYC Verification</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white px-8 py-3 rounded-xl font-bold transition-all text-zinc-500">Transactions</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white px-8 py-3 rounded-xl font-bold transition-all text-zinc-500">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="kyc" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800">
              <div>
                <CardTitle className="text-2xl font-black text-white">Guide Applications</CardTitle>
                <CardDescription className="text-zinc-500 font-medium mt-1">Manual review required for identity verification.</CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                <Input placeholder="Search by name or email..." className="bg-zinc-800 border-zinc-700 text-white pl-12 h-12 rounded-xl focus-visible:ring-zinc-600" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-950/50 text-zinc-500 uppercase tracking-widest text-[10px] font-black border-b border-zinc-800">
                    <tr>
                      <th className="text-left p-6">Guide Information</th>
                      <th className="text-left p-6">Location</th>
                      <th className="text-left p-6">Documents</th>
                      <th className="text-left p-6">Status</th>
                      <th className="text-right p-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {[
                      { name: "Hana Sato", email: "hana.s@example.com", location: "Tokyo, JP", docs: ["Passport", "License"], status: "Review" },
                      { name: "Chen Wei", email: "wei.c@example.com", location: "Taipei, TW", docs: ["ID", "Cert"], status: "New" },
                    ].map((app) => (
                      <tr key={app.name} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="font-black text-white text-base">{app.name}</span>
                            <span className="text-zinc-500 font-medium">{app.email}</span>
                          </div>
                        </td>
                        <td className="p-6 text-zinc-400 font-bold">{app.location}</td>
                        <td className="p-6">
                          <div className="flex gap-2">
                            {app.docs.map(doc => (
                              <Badge key={doc} className="bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 px-3 py-1 rounded-lg text-[10px] uppercase font-black">{doc}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-6">
                          <Badge className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            app.status === 'New' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          )}>{app.status}</Badge>
                        </td>
                        <td className="p-6 text-right">
                          <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold rounded-xl px-6">View Files</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tabs can be empty placeholders or similarly styled */}
      </Tabs>
    </div>
  )
}

function StatCard({ title, value, trend, sub, icon, isWarning }: { title: string, value: string, trend?: string, sub?: string, icon: React.ReactNode, isWarning?: boolean }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-[2rem] hover:border-zinc-700 transition-all group shadow-xl">
      <div className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">{title}</CardTitle>
        <div className={cn("p-2 rounded-xl bg-zinc-800 text-zinc-400 transition-colors group-hover:bg-zinc-700 group-hover:text-white", isWarning && "text-amber-500")}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-black text-white">{value}</div>
        {trend && (
          <div className="flex items-center text-xs text-green-500 font-black tracking-wide">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            {trend}
          </div>
        )}
        {sub && (
          <div className={cn("text-[10px] font-black uppercase tracking-widest", isWarning ? "text-amber-500" : "text-zinc-600")}>
            {sub}
          </div>
        )}
      </div>
    </Card>
  )
}
