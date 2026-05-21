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
  ArrowDownRight
} from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="container py-4 md:py-8 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform oversight and analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">Export</Button>
          <Button size="sm" className="flex-1 md:flex-none">Settings</Button>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-[10px] md:text-sm font-medium">GMV</CardTitle>
            <ShoppingBag className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-lg md:text-2xl font-bold">$124.5k</div>
            <div className="flex items-center text-[10px] text-green-500 font-medium">
              <ArrowUpRight className="h-2.5 w-2.5 mr-1" />
              +12.5%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-[10px] md:text-sm font-medium">Guides</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-lg md:text-2xl font-bold">1,284</div>
            <div className="flex items-center text-[10px] text-green-500 font-medium">
              <ArrowUpRight className="h-2.5 w-2.5 mr-1" />
              +48 wk
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-[10px] md:text-sm font-medium">KYC</CardTitle>
            <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-lg md:text-2xl font-bold">23</div>
            <div className="text-[10px] text-amber-500 font-medium truncate">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-[10px] md:text-sm font-medium">Disputes</CardTitle>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-lg md:text-2xl font-bold">2</div>
            <div className="text-[10px] text-zinc-400 font-medium">Stable</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="kyc" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto no-scrollbar h-auto gap-2 bg-transparent p-0">
          <TabsTrigger value="kyc" className="data-[state=active]:bg-zinc-100 border px-4 py-2 rounded-full">KYC</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-zinc-100 border px-4 py-2 rounded-full">Orders</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-zinc-100 border px-4 py-2 rounded-full">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="kyc" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Guide Applications</CardTitle>
                <CardDescription className="text-xs">Review certifications.</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-9 text-sm" />
              </div>
            </CardHeader>
            <CardContent className="px-0 md:px-6">
              <div className="border-y md:border rounded-none md:rounded-lg overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-zinc-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium text-zinc-500">Guide</th>
                      <th className="text-left p-3 font-medium text-zinc-500">Location</th>
                      <th className="text-left p-3 font-medium text-zinc-500">Docs</th>
                      <th className="text-left p-3 font-medium text-zinc-500">Status</th>
                      <th className="text-right p-3 font-medium text-zinc-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { name: "Hana Sato", location: "Tokyo, JP", docs: ["Passport", "License"], status: "Review" },
                      { name: "Chen Wei", location: "Taipei, TW", docs: ["ID", "Cert"], status: "New" },
                    ].map((app) => (
                      <tr key={app.name} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-3 font-medium">{app.name}</td>
                        <td className="p-3 text-zinc-600">{app.location}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {app.docs.map(doc => (
                              <Badge key={doc} variant="outline" className="text-[9px] py-0">{doc}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={app.status === 'New' ? 'default' : 'secondary'}>{app.status}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm">Review</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              {[
                { id: "ORD-9281", users: "James L. → Kenji T.", amount: "$250", status: "Settled" },
                { id: "ORD-9280", users: "Sarah M. → Sophie C.", amount: "$180", status: "Escrow" },
              ].map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-zinc-50 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-zinc-100 rounded-lg shrink-0">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-xs md:text-sm">{order.id}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{order.users}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <span className="font-bold text-xs md:text-sm">{order.amount}</span>
                    <Badge variant={order.status === 'Settled' ? 'secondary' : 'default'} className="text-[9px] md:text-[10px]">{order.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Growth Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-48 md:h-64 flex items-center justify-center bg-zinc-50 border-2 border-dashed rounded-xl">
                <BarChart3 className="h-8 w-8 text-zinc-300 mr-2" />
                <span className="text-zinc-400 text-sm font-medium">Chart (Phase 3)</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { tag: "#StrollerFriendly", count: 1240, trend: "up" },
                  { tag: "#HiddenGems", count: 980, trend: "up" },
                ].map(item => (
                  <div key={item.tag} className="flex items-center justify-between">
                    <span className="font-medium text-xs md:text-sm">{item.tag}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs md:text-sm font-bold">{item.count}</span>
                      {item.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
