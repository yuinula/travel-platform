"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Plus, 
  Shield, 
  Trash2, 
  Edit2, 
  Loader2, 
  ShieldCheck, 
  KeyRound, 
  Check, 
  X,
  ChevronRight,
  ShieldAlert
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useBackofficeTheme } from "../layout"
import { format } from "date-fns"

interface Admin {
  id: string;
  username: string;
  role: string;
  permissions: string[];
  created_at: string;
}

const PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard Access' },
  { id: 'admin-portal', label: 'Order Management' },
  { id: 'manage-admins', label: 'System Admin' }
]

export default function ManageAdminsPage() {
  const t = useTranslations("Backoffice.admins")
  const { theme } = useBackofficeTheme()
  const isDark = theme === "dark"
  const supabase = createClient()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Edit/Add State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "Admin",
    permissions: ['dashboard'] as string[]
  })

  const fetchAdmins = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setAdmins(data as any)
    setLoading(false)
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const logAction = async (action: string, desc: string, details?: any) => {
    const adminStr = localStorage.getItem("trip-butler-admin-user")
    const admin = adminStr ? JSON.parse(adminStr) : { username: "Unknown" }
    await supabase.from('system_log').insert([{
      admin_username: admin.username,
      action_type: action,
      description: desc,
      details: details
    }])
  }

  const handleSave = async () => {
    if (!formData.username) {
      toast.error("Username is required")
      return
    }

    let error;
    if (isAddOpen) {
      if (!formData.password) {
        toast.error("Password is required")
        return
      }
      const { error: err } = await supabase.from('admins').insert([formData])
      error = err
      if (!error) await logAction('CREATE_ADMIN', `Added new administrator: ${formData.username}`, formData)
    } else {
      const updateData: any = { ...formData }
      if (!updateData.password) delete updateData.password
      
      const { error: err } = await supabase.from('admins').update(updateData).eq('id', editingAdmin?.id)
      error = err
      if (!error) await logAction('EDIT_ADMIN', `Updated administrator: ${formData.username}`, { id: editingAdmin?.id, ...formData })
    }

    if (error) {
      toast.error("Operation failed")
    } else {
      toast.success(isAddOpen ? "Admin created" : "Admin updated")
      setIsAddOpen(false)
      setIsEditOpen(false)
      fetchAdmins()
    }
  }

  const handleDelete = async (admin: Admin) => {
    if (admin.role === 'Super Admin') {
      toast.error("Cannot delete Super Admin")
      return
    }
    if (!confirm(`Are you sure you want to delete admin ${admin.username}?`)) return
    
    const { error } = await supabase.from('admins').delete().eq('id', admin.id)
    if (error) {
      toast.error("Delete failed")
    } else {
      toast.success("Admin deleted")
      await logAction('DELETE_ADMIN', `Deleted administrator: ${admin.username}`, { id: admin.id })
      fetchAdmins()
    }
  }

  const openEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      password: "", // Don't show password
      role: admin.role,
      permissions: admin.permissions || []
    })
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({ username: "", password: "", role: "Admin", permissions: ['dashboard'] })
    setEditingAdmin(null)
  }

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }))
  }

  const filtered = admins.filter(a => 
    a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="h-10 rounded-xl ai-gradient px-4 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            {t('addNew')}
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
                  <th className="text-left p-6">{t('table.username')}</th>
                  <th className="text-left p-6">{t('table.role')}</th>
                  <th className="text-left p-6">{t('table.permissions')}</th>
                  <th className="text-left p-6">{t('table.createdAt')}</th>
                  <th className="text-right p-6">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y transition-colors", isDark ? "divide-zinc-800" : "divide-zinc-100")}>
                {loading && admins.length === 0 ? (
                  [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="p-6 h-12" /></tr>)
                ) : filtered.map(admin => (
                  <tr key={admin.id} className="hover:bg-primary/[0.01] group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center border",
                          isDark ? "bg-zinc-800 border-zinc-700 text-zinc-400" : "bg-zinc-50 border-zinc-200 text-zinc-400 group-hover:text-primary"
                        )}>
                          <Shield className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className={cn("font-black text-sm", isDark ? "text-white" : "text-zinc-900")}>{admin.username}</span>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">System Personnel</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                       <Badge className={cn(
                         "rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest border-none transition-all shadow-sm",
                         admin.role === 'Super Admin' ? 'bg-primary text-white' : (isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600')
                       )}>{admin.role}</Badge>
                    </td>
                    <td className="p-6">
                       <div className="flex flex-wrap gap-1.5">
                         {admin.permissions?.map(p => (
                           <span key={p} className={cn("text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border", isDark ? "bg-zinc-950 border-zinc-800 text-zinc-500" : "bg-zinc-50 border-zinc-100 text-zinc-400")}>
                             {p.replace('-', ' ')}
                           </span>
                         ))}
                       </div>
                    </td>
                    <td className="p-6 text-zinc-500 font-bold text-xs uppercase tracking-widest">
                      {format(new Date(admin.created_at), "yyyy/MM/dd")}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => openEdit(admin)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDelete(admin)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen || isAddOpen} onOpenChange={(val) => { if(!val) { setIsEditOpen(false); setIsAddOpen(false); resetForm(); }}}>
        <DialogContent className={cn(
          "max-w-2xl p-8 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl border transition-colors",
          isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}>
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-black uppercase font-rounded tracking-widest ai-text-gradient">
              {isAddOpen ? t('addNew') : t('editAdmin')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 mt-8">
            <div className={cn(
              "grid grid-cols-2 gap-4 p-6 rounded-[2rem] border transition-colors",
              isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-100"
            )}>
               <div className="col-span-2">
                  <div className="flex items-center gap-2">
                     <ShieldCheck className="h-4 w-4 text-primary" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Identity Configuration</p>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Admin Username</Label>
                  <Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className={cn("rounded-xl h-11 px-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} placeholder="e.g. j.doe" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Access Role</Label>
                  <Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className={cn("rounded-xl h-11 px-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} placeholder="e.g. Manager" />
               </div>
               <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{isEditOpen ? "Update Password (Optional)" : "Security Key"}</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={cn("rounded-xl h-11 pl-10 pr-4 text-sm font-bold border", isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200")} placeholder="••••••••" />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Functional Permissions</Label>
              <div className="grid grid-cols-2 gap-3">
                {PERMISSIONS.map(perm => (
                  <button
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                      formData.permissions.includes(perm.id)
                        ? "bg-primary/10 border-primary/20"
                        : (isDark ? "bg-zinc-800/50 border-zinc-700 hover:border-zinc-500" : "bg-white border-zinc-200 hover:bg-zinc-50")
                    )}
                  >
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-tight",
                      formData.permissions.includes(perm.id) ? "text-primary" : "text-zinc-500 group-hover:text-zinc-900"
                    )}>{perm.label}</span>
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                      formData.permissions.includes(perm.id) ? "bg-primary border-primary" : "border-zinc-300"
                    )}>
                      {formData.permissions.includes(perm.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-10">
            <Button 
              onClick={handleSave} 
              className="w-full h-16 rounded-xl ai-gradient font-black text-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              {isAddOpen ? "Authorize Account" : "Apply Changes"}
              <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
