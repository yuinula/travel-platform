"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Calendar,
  User,
  MapPin,
  Receipt,
  MoreVertical,
  ChevronRight,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { useTranslations } from "next-intl"
import { useBackofficeTheme } from "../layout"
import { format } from "date-fns"

interface Order {
  id: string;
  traveler: { name: string; email: string };
  guide: { name: string; email: string };
  status: string;
  total_price: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function OrderManagementPage() {
  const t = useTranslations("Backoffice.orders")
  const { theme } = useBackofficeTheme()
  const isDark = theme === "dark"
  const supabase = createClient()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id, status, total_price, start_date, end_date, created_at,
        traveler:traveler_id (name, email),
        guide:guide_id (name, email)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data as any)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.traveler?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.guide?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Negotiation': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Booked':
      case 'Confirmed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Completed':
      case 'Settled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className={cn(
            "text-5xl font-black tracking-tight uppercase tracking-widest font-rounded transition-colors",
            isDark ? "text-white" : "text-zinc-900"
          )}>{t('title')}</h1>
          <p className="text-zinc-500 font-bold text-xl">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64 md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500" />
            <Input 
              placeholder={t('searchPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "border h-16 rounded-2xl pl-14 text-lg font-medium transition-all focus-visible:ring-primary/20",
                isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )} 
            />
          </div>
          <Button onClick={fetchOrders} variant="outline" className={cn(
            "h-16 w-16 rounded-2xl p-0 shadow-xl transition-all border",
            isDark ? "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900"
          )}>
            <Receipt className={cn("h-7 w-7", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
         <StatCard title="Active Bookings" value={orders.filter(o => o.status === 'Confirmed').length.toString()} icon={<CheckCircle2 />} color="emerald" isDark={isDark} />
         <StatCard title="Negotiations" value={orders.filter(o => o.status === 'Negotiation').length.toString()} icon={<Clock />} color="amber" isDark={isDark} />
         <StatCard title="Total Revenue" value={`$${orders.reduce((acc, o) => acc + (o.total_price || 0), 0)}`} icon={<DollarSign />} color="blue" isDark={isDark} />
      </div>

      <Card className={cn(
        "shadow-3xl rounded-[3rem] overflow-hidden border transition-colors",
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-xl"
      )}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className={cn(
                "uppercase tracking-[0.3em] text-[11px] font-black border-b transition-colors",
                isDark ? "bg-zinc-950/50 text-zinc-500 border-zinc-800" : "bg-zinc-50 text-zinc-400 border-zinc-100"
              )}>
                <tr>
                  <th className="text-left p-10">{t('table.orderId')}</th>
                  <th className="text-left p-10">{t('table.traveler')}</th>
                  <th className="text-left p-10">{t('table.guide')}</th>
                  <th className="text-left p-10">{t('table.period')}</th>
                  <th className="text-left p-10">{t('table.status')}</th>
                  <th className="text-right p-10">{t('table.amount')}</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y transition-colors", isDark ? "divide-zinc-800" : "divide-zinc-100")}>
                {loading && orders.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="p-10 h-24" />
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-32 text-center text-zinc-500 font-black text-2xl uppercase tracking-widest italic">No orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-primary/[0.01] transition-colors group">
                      <td className="p-10">
                        <span className={cn("font-black text-xs uppercase tracking-widest px-3 py-1 rounded-lg border", isDark ? "bg-zinc-950 border-zinc-800 text-zinc-500" : "bg-zinc-50 border-zinc-100 text-zinc-400")}>
                          #{order.id.split('-')[0]}
                        </span>
                      </td>
                      <td className="p-10">
                        <div className="flex flex-col">
                          <span className={cn("font-black text-lg font-rounded transition-colors", isDark ? "text-white" : "text-zinc-900")}>{order.traveler?.name || 'Unknown'}</span>
                          <span className="text-zinc-500 text-xs font-medium">{order.traveler?.email}</span>
                        </div>
                      </td>
                      <td className="p-10">
                        <div className="flex flex-col">
                          <span className={cn("font-black text-lg font-rounded transition-colors", isDark ? "text-white" : "text-zinc-900")}>{order.guide?.name || 'Unknown'}</span>
                          <span className="text-zinc-500 text-xs font-medium">{order.guide?.email}</span>
                        </div>
                      </td>
                      <td className="p-10">
                        <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm">
                           <Calendar className="h-4 w-4 text-primary" />
                           {order.start_date ? format(new Date(order.start_date), "MM/dd") : 'TBD'} - {order.end_date ? format(new Date(order.end_date), "MM/dd") : 'TBD'}
                        </div>
                      </td>
                      <td className="p-10">
                        <Badge className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shadow-md",
                          getStatusStyle(order.status)
                        )}>
                          {t(`status.${order.status}`)}
                        </Badge>
                      </td>
                      <td className="p-10 text-right">
                        <span className={cn("text-2xl font-black font-rounded transition-colors", isDark ? "text-white" : "text-zinc-900")}>
                          ${order.total_price || 0}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon, color, isDark }: { title: string, value: string, icon: React.ReactNode, color: string, isDark: boolean }) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  }
  
  return (
    <Card className={cn(
      "p-8 rounded-[2.5rem] border shadow-2xl group",
      isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-xl"
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-primary transition-colors">{title}</span>
        <div className={cn("p-3 rounded-2xl border", colorMap[color])}>
          {icon}
        </div>
      </div>
      <div className={cn("text-4xl font-black font-rounded transition-colors", isDark ? "text-white" : "text-zinc-900")}>{value}</div>
    </Card>
  )
}
