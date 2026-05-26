"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Clock,
  User,
  Activity,
  Calendar,
  Filter,
  ArrowRight,
  ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

interface SystemLog {
  id: string;
  admin_username: string;
  action_type: string;
  description: string;
  details: any;
  created_at: string;
}

export default function SystemLogsPage() {
  const t = useTranslations("Backoffice.logs")
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()

  const fetchLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('system_log')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setLogs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter(log => 
    log.admin_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getActionColor = (type: string) => {
    switch (type) {
      case 'LOGIN': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'LOGOUT': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
      case 'CREATE_ADMIN': 
      case 'CREATE_LANDMARK':
      case 'CREATE_GUIDE': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'DELETE_ADMIN':
      case 'DELETE_LANDMARK': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'EDIT_ADMIN':
      case 'EDIT_LANDMARK':
      case 'EDIT_GUIDE': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'CHANGE_PASSWORD': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-white uppercase font-rounded italic tracking-widest">{t('title')}</h1>
          <p className="text-zinc-500 font-bold text-xl">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64 md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-600" />
            <Input 
              placeholder={t('searchPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white pl-14 h-16 rounded-2xl focus-visible:ring-zinc-700 text-lg font-medium" 
            />
          </div>
          <Button onClick={fetchLogs} variant="outline" className="h-16 w-16 rounded-2xl border-zinc-800 p-0 hover:bg-zinc-900 shadow-xl transition-all">
            <Activity className={cn("h-7 w-7", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-3xl rounded-[3rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-zinc-950/50 text-zinc-500 uppercase tracking-[0.3em] text-[11px] font-black border-b border-zinc-800">
                <tr>
                  <th className="text-left p-10">{t('table.timestamp')}</th>
                  <th className="text-left p-10">{t('table.administrator')}</th>
                  <th className="text-left p-10">{t('table.action')}</th>
                  <th className="text-left p-10">{t('table.description')}</th>
                  <th className="text-right p-10">{t('table.trace')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading && logs.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="p-10 bg-zinc-900/50 h-24" />
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-32 text-center text-zinc-700 font-black text-2xl italic tracking-widest uppercase">No security logs recorded.</td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-10">
                        <div className="flex flex-col space-y-1">
                          <span className="text-white font-black text-lg">{format(new Date(log.created_at), "yyyy/MM/dd")}</span>
                          <span className="text-zinc-600 font-bold text-xs tracking-widest">{format(new Date(log.created_at), "HH:mm:ss")}</span>
                        </div>
                      </td>
                      <td className="p-10">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-500 group-hover:text-white group-hover:border-primary/50 transition-all duration-500">
                            <User className="h-6 w-6" />
                          </div>
                          <span className="font-black text-white text-lg font-rounded">{log.admin_username}</span>
                        </div>
                      </td>
                      <td className="p-10">
                        <Badge className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                          getActionColor(log.action_type)
                        )}>
                          {log.action_type.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-10">
                        <p className="text-zinc-400 font-medium max-w-lg leading-relaxed">{log.description}</p>
                      </td>
                      <td className="p-10 text-right">
                         <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] bg-zinc-950/50 px-3 py-1 rounded-lg border border-zinc-800/50">
                           {log.id.split('-')[0]}
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
