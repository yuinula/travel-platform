"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Search, 
  Settings, 
  User, 
  ShieldAlert, 
  Clock, 
  AlertCircle,
  Database,
  ShieldCheck,
  KeyRound,
  Trash2,
  Edit2,
  Plus
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { useTranslations } from "next-intl"
import { useBackofficeTheme } from "../layout"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SystemLog {
  id: string;
  created_at: string;
  admin_username: string;
  action_type: string;
  description: string;
  details?: any;
}

export default function SystemLogsPage() {
  const t = useTranslations("Backoffice.logs")
  const { theme } = useBackofficeTheme()
  const isDark = theme === "dark"
  const supabase = createClient()

  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchLogs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('system_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (data) setLogs(data as any)
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
    if (type.includes('CREATE')) return 'text-emerald-500'
    if (type.includes('DELETE')) return 'text-red-500'
    if (type.includes('EDIT')) return 'text-amber-500'
    if (type.includes('LOGIN')) return 'text-blue-500'
    return 'text-zinc-500'
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={cn(
            "text-2xl font-black tracking-tight uppercase tracking-widest font-rounded transition-colors",
            isDark ? "text-white" : "text-zinc-900"
          )}>{t('title')}</h1>
          <p className="text-zinc-500 font-bold text-sm">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-48 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder={t('searchPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "border h-10 rounded-xl pl-10 text-sm font-medium transition-all focus-visible:ring-primary/20",
                isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )} 
            />
          </div>
          <Button onClick={fetchLogs} variant="outline" className={cn(
            "h-10 w-10 rounded-xl p-0 shadow-sm transition-all border",
            isDark ? "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900"
          )}>
            <Clock className={cn("h-5 w-5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <Card className={cn(
        "shadow-xl rounded-[2rem] overflow-hidden border transition-colors",
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={cn(
                "uppercase tracking-[0.2em] text-[10px] font-black border-b transition-colors",
                isDark ? "bg-zinc-950/50 text-zinc-500 border-zinc-800" : "bg-zinc-50 text-zinc-400 border-zinc-100"
              )}>
                <tr>
                  <th className="text-left p-6">{t('table.timestamp')}</th>
                  <th className="text-left p-6">{t('table.administrator')}</th>
                  <th className="text-left p-6">{t('table.action')}</th>
                  <th className="text-left p-6">{t('table.details')}</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y transition-colors", isDark ? "divide-zinc-800" : "divide-zinc-100")}>
                {loading && logs.length === 0 ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="p-6 h-12" />
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center font-black text-xl uppercase tracking-[0.5em] transition-colors" style={{ color: isDark ? '#18181b' : '#f4f4f5' }}>
                      No Logs Found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-primary/[0.01] group transition-colors">
                      <td className="p-6">
                        <div className="flex flex-col space-y-0.5">
                          <span className={cn("font-black text-sm", isDark ? "text-white" : "text-zinc-900")}>{format(new Date(log.created_at), "yyyy/MM/dd")}</span>
                          <span className="text-zinc-500 font-bold text-[10px] tracking-widest">{format(new Date(log.created_at), "HH:mm:ss")}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center border",
                            isDark ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-400 group-hover:text-primary"
                          )}>
                            <User className="h-5 w-5" />
                          </div>
                          <span className={cn("font-black text-sm font-rounded transition-colors", isDark ? "text-white" : "text-zinc-900")}>{log.admin_username}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <Badge variant="outline" className={cn(
                          "px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all shadow-sm",
                          getActionColor(log.action_type)
                        )}>
                          {log.action_type}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <p className="text-zinc-500 text-xs font-medium leading-relaxed max-w-md">{log.description}</p>
                        {log.details && (
                           <div className="mt-1 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Database className="h-3 w-3 text-zinc-400" />
                              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Metadata Attached</span>
                           </div>
                        )}
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
