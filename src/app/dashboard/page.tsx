"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Wallet, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Receipt, 
  Plus, 
  Camera
} from "lucide-react"

export default function DashboardPage() {
  const [role, setRole] = useState<"traveler" | "guide">("guide")
  const [isAddingExpense, setIsAddingExpense] = useState(false)

  return (
    <div className="container py-4 md:py-8 max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your trips, payments, and profile.</p>
        </div>
        <Tabs defaultValue="guide" onValueChange={(v) => setRole(v as "traveler" | "guide")} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-2 md:inline-flex">
            <TabsTrigger value="traveler">Traveler</TabsTrigger>
            <TabsTrigger value="guide">Guide</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground truncate">
              {role === 'guide' ? 'Escrow' : 'Total Spent'}
            </CardTitle>
            <Wallet className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-lg md:text-2xl font-bold">$1,250</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              {role === 'guide' ? '+20% this month' : '3 trips'}
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Active</CardTitle>
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-lg md:text-2xl font-bold">2</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">In negotiation</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Success</CardTitle>
            <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-lg md:text-2xl font-bold">12</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">Matches</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Rating</CardTitle>
            <Briefcase className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-lg md:text-2xl font-bold">4.9</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">12 reviews</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trips" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto no-scrollbar pb-0 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger value="trips" className="data-[state=active]:bg-zinc-100 px-4 py-2 rounded-full border">Trips</TabsTrigger>
          {role === 'guide' && <TabsTrigger value="expenses" className="data-[state=active]:bg-zinc-100 px-4 py-2 rounded-full border">Expenses</TabsTrigger>}
          <TabsTrigger value="wallet" className="data-[state=active]:bg-zinc-100 px-4 py-2 rounded-full border">Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="space-y-6 pt-2">
          <Card>
            <CardHeader className="px-4 md:px-6">
              <CardTitle>Recent Trips</CardTitle>
              <CardDescription>Your most recent travel matching activities.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="space-y-6">
                {[
                  { id: "1", name: "Kyoto Culture Tour", user: "John Doe", status: "Booked", date: "May 24, 2026", amount: "$250" },
                  { id: "2", name: "Taipei Foodie Walk", user: "Alice Smith", status: "Negotiation", date: "June 02, 2026", amount: "$180" },
                  { id: "3", name: "Paris Art Secrets", user: "Bob Wilson", status: "Completed", date: "May 10, 2026", amount: "$320" },
                ].map((trip) => (
                  <div key={trip.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-transparent hover:border-zinc-100 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm md:text-base">{trip.name}</span>
                      <span className="text-xs text-muted-foreground">with {trip.user} • {trip.date}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-bold text-sm">{trip.amount}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={trip.status === 'Completed' ? 'secondary' : 'outline'} className="text-[10px] md:text-xs">
                          {trip.status}
                        </Badge>
                        <Link href={`/dashboard/itinerary-builder/${trip.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2">Edit</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="px-0 mt-6 h-auto text-xs md:text-sm">View all trips</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6 pt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-bold">Out-of-pocket Expenses</h2>
            <Button size="sm" onClick={() => setIsAddingExpense(true)}>
              <Plus className="h-4 w-4 mr-1 md:mr-2" />
              Add Expense
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="px-4 md:px-6">
                <CardTitle>Recent Receipts</CardTitle>
                <CardDescription>Upload receipts for instant reimbursement.</CardDescription>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-6">
                <div className="space-y-4">
                  {[
                    { id: "E-1", item: "Taxi to Arashiyama", trip: "Kyoto", amount: "$24.50", status: "Approved" },
                    { id: "E-2", item: "Entrance Fees", trip: "Kyoto", amount: "$12.00", status: "Pending" },
                    { id: "E-3", item: "Local Lunch Set", trip: "Kyoto", amount: "$45.00", status: "Pending" },
                  ].map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-zinc-100 rounded-lg shrink-0">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs md:text-sm truncate">{expense.item}</p>
                          <p className="text-[10px] text-muted-foreground">{expense.trip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-xs md:text-sm">{expense.amount}</span>
                        <Badge variant={expense.status === 'Approved' ? 'secondary' : 'outline'} className="text-[9px] md:text-[10px] px-1.5 py-0">
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={isAddingExpense ? "border-zinc-900 shadow-lg" : "bg-zinc-50 border-dashed"}>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <Camera className="h-4 w-4 md:h-5 md:w-5" />
                  Quick Scan
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-6 pt-0">
                {isAddingExpense ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-zinc-500">Trip</Label>
                      <Input placeholder="Select trip..." className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-zinc-500">Amount ($)</Label>
                      <Input placeholder="0.00" className="h-9 text-sm" />
                    </div>
                    <div className="border-2 border-dashed rounded-xl p-8 text-center bg-white">
                      <Camera className="h-8 w-8 mx-auto text-zinc-200 mb-2" />
                      <p className="text-[10px] text-muted-foreground">Upload or take photo</p>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 h-10" onClick={() => setIsAddingExpense(false)}>Submit</Button>
                      <Button variant="ghost" className="h-10" onClick={() => setIsAddingExpense(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-xs text-muted-foreground">Select &quot;Add Expense&quot; to start scanning.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6 pt-2">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="px-4 md:px-6">
                <CardTitle>History</CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-6 pt-0">
                <div className="space-y-2">
                  {[
                    { type: 'Settlement', from: 'Kyoto Tour', amount: '+$225.00', date: 'May 12' },
                    { type: 'Withdrawal', from: 'Bank', amount: '-$500.00', date: 'May 08' },
                    { type: 'Settlement', from: 'Paris Tour', amount: '+$288.00', date: 'May 01' },
                  ].map((tx, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-zinc-50/50 transition-colors px-2 -mx-2 rounded-lg">
                      <div>
                        <p className="font-bold text-sm">{tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.from} • {tx.date}</p>
                      </div>
                      <span className={`font-bold text-sm ${tx.amount.startsWith('+') ? 'text-green-600' : ''}`}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-zinc-900/5 shadow-lg">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-sm md:text-base">Available Balance</CardTitle>
                <CardDescription className="text-[10px] md:text-xs">Ready for withdrawal</CardDescription>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-6 pt-0 space-y-6">
                <div className="text-3xl md:text-4xl font-black text-zinc-900">$840.00</div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Pending Escrow</span>
                    <span className="font-medium">$410.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Platform Fee (10%)</span>
                    <span className="text-red-500 font-medium">-$125.00</span>
                  </div>
                </div>
                <Button className="w-full h-12 shadow-md hover:shadow-xl transition-all">Withdraw Funds</Button>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t p-3">
                <p className="text-[10px] text-muted-foreground leading-tight text-center w-full">
                  Settlements processed automatically 24h after completion.
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
