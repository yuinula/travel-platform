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
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { format } from "date-fns"

interface SystemLog {
  id: string;
  admin_username: string;
  action_type: string;
  description: string;
  details: any;
  created_at: string;
}

export default function SystemLogsPage() {
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
      case 'CREATE_ADMIN': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'DELETE_ADMIN': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'EDIT_ADMIN': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'CHANGE_PASSWORD': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase font-rounded tracking-widest">System Logs</h1>
          <p className="text-zinc-500 font-medium text-lg mt-1">Audit trail for all administrative operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
            <Input 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white pl-12 h-14 rounded-2xl focus-visible:ring-zinc-700" 
            />
          </div>
          <Button onClick={fetchLogs} variant="outline" className="h-14 w-14 rounded-2xl border-zinc-800 p-0 hover:bg-zinc-900">
            <Activity className={cn("h-6 w-6", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950/50 text-zinc-500 uppercase tracking-widest text-[10px] font-black border-b border-zinc-800">
                <tr>
                  <th className="text-left p-8">Timestamp</th>
                  <th className="text-left p-8">Administrator</th>
                  <th className="text-left p-8">Action</th>
                  <th className="text-left p-8">Description</th>
                  <th className="text-right p-8">Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="p-8 bg-zinc-900/50 h-20" />
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-zinc-600 font-bold text-lg italic">No matching security logs found.</td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{format(new Date(log.created_at), "yyyy/MM/dd")}</span>
                          <span className="text-zinc-500 font-medium text-xs">{format(new Date(log.created_at), "HH:mm:ss")}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-black text-white">{log.admin_username}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <Badge className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          getActionColor(log.action_type)
                        )}>
                          {log.action_type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-8">
                        <p className="text-zinc-400 font-medium max-w-md">{log.description}</p>
                      </td>
                      <td className="p-8 text-right">
                         <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">
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
