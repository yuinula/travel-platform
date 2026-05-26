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
import { useBackofficeTheme } from "../layout"

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
  const { theme } = useBackofficeTheme()
  const isDark = theme === "dark"
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
          <Button onClick={fetchLogs} variant="outline" className={cn(
            "h-16 w-16 rounded-2xl p-0 shadow-xl transition-all border",
            isDark ? "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900"
          )}>
            <Activity className={cn("h-7 w-7", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <Card className={cn(
        "shadow-3xl rounded-[3.5rem] overflow-hidden border transition-colors",
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
                  <th className="text-left p-10">{t('table.timestamp')}</th>
                  <th className="text-left p-10">{t('table.administrator')}</th>
                  <th className="text-left p-10">{t('table.action')}</th>
                  <th className="text-left p-10">{t('table.description')}</th>
                  <th className="text-right p-10">{t('table.trace')}</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y transition-colors", isDark ? "divide-zinc-800" : "divide-zinc-100")}>
                {loading && logs.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="p-10 bg-zinc-900/50 h-24" />
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={cn(
                      "p-32 text-center font-black text-2xl italic tracking-widest uppercase",
                      isDark ? "text-zinc-800" : "text-zinc-200"
                    )}>No security logs recorded.</td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-primary/[0.01] transition-colors group">
                      <td className="p-10">
                        <div className="flex flex-col space-y-1">
                          <span className={cn("font-black text-lg transition-colors", isDark ? "text-white" : "text-zinc-900")}>{format(new Date(log.created_at), "yyyy/MM/dd")}</span>
                          <span className="text-zinc-500 font-bold text-xs tracking-widest">{format(new Date(log.created_at), "HH:mm:ss")}</span>
                        </div>
                      </td>
                      <td className="p-10">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:border-primary/50",
                            isDark ? "bg-zinc-800 border-zinc-700 text-zinc-500 group-hover:text-white" : "bg-zinc-50 border-zinc-200 text-zinc-400 group-hover:text-primary"
                          )}>
                            <User className="h-6 w-6" />
                          </div>
                          <span className={cn("font-black text-lg font-rounded transition-colors", isDark ? "text-white" : "text-zinc-900")}>{log.admin_username}</span>
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
                        <p className={cn(
                          "font-medium max-w-lg leading-relaxed transition-colors",
                          isDark ? "text-zinc-400" : "text-zinc-600"
                        )}>{log.description}</p>
                      </td>
                      <td className="p-10 text-right">
                         <span className={cn(
                           "text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 rounded-lg border transition-all",
                           isDark ? "bg-zinc-950/50 text-zinc-800 border-zinc-800/50" : "bg-zinc-50 text-zinc-300 border-zinc-100"
                         )}>
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
