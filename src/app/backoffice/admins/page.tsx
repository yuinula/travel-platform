"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Trash2, 
  Shield, 
  Lock, 
  UserPlus, 
  Search,
  CheckCircle2,
  Settings2,
  ArrowRight,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase"
import { useTranslations } from "next-intl"

interface AdminUser {
  id: string;
  username: string;
  password?: string;
  role: string;
  permissions: string[];
  created_at: string;
}

export default function AdminManagementPage() {
  const t = useTranslations("Backoffice.admins")
  const st = useTranslations("Backoffice.sidebar")
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['dashboard'])
  const [isSyncing, setIsSyncing] = useState(true)
  const supabase = createClient()

  const MODULES = [
    { id: 'dashboard', name: st('dashboard') },
    { id: 'admin-portal', name: st('adminPortal') },
    { id: 'manage-landmarks', name: st('manageLandmarks') },
    { id: 'manage-guides', name: st('manageGuides') },
    { id: 'manage-admins', name: st('manageAdmins') },
  ]

  const fetchAdmins = async () => {
    setIsSyncing(true)
    const { data } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (data) setAdmins(data)
    setIsSyncing(false)
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleAddAdmin = async () => {
    if (!newUsername || !newPassword) {
      toast.error("Please fill in all fields")
      return
    }

    const { error } = await supabase
      .from('admins')
      .insert([
        { 
          username: newUsername, 
          password: newPassword, 
          role: 'Sub Admin', 
          permissions: selectedPerms 
        }
      ])

    if (error) {
      toast.error("Error creating account")
    } else {
      const currentUser = JSON.parse(localStorage.getItem('trip-butler-admin-user') || '{}');
      await supabase.from('system_log').insert([{
        admin_username: currentUser.username || 'System',
        action_type: 'CREATE_ADMIN',
        description: `Created new admin account: ${newUsername}`,
        details: { target: newUsername, permissions: selectedPerms }
      }]);

      toast.success(`Admin ${newUsername} added`)
      setIsAddOpen(false)
      setNewUsername("")
      setNewPassword("")
      setSelectedPerms(['dashboard'])
      fetchAdmins()
    }
  }

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return

    const { error } = await supabase
      .from('admins')
      .update({
        password: newPassword || editingAdmin.password,
        permissions: selectedPerms
      })
      .eq('id', editingAdmin.id)

    if (error) {
      toast.error("Error updating account")
    } else {
      const currentUser = JSON.parse(localStorage.getItem('trip-butler-admin-user') || '{}');
      await supabase.from('system_log').insert([{
        admin_username: currentUser.username || 'System',
        action_type: 'EDIT_ADMIN',
        description: `Updated admin account: ${editingAdmin.username}`,
        details: { target: editingAdmin.username, new_permissions: selectedPerms, password_changed: !!newPassword }
      }]);

      toast.success(`Admin ${editingAdmin.username} updated`)
      setIsEditOpen(false)
      setEditingAdmin(null)
      setNewPassword("")
      fetchAdmins()
    }
  }

  const handleDelete = async (id: string, role: string) => {
    const adminToDelete = admins.find(a => a.id === id);
    if (role === 'Super Admin') {
      toast.error("Cannot delete Super Admin")
      return
    }

    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error("Error removing account")
    } else {
      const currentUser = JSON.parse(localStorage.getItem('trip-butler-admin-user') || '{}');
      await supabase.from('system_log').insert([{
        admin_username: currentUser.username || 'System',
        action_type: 'DELETE_ADMIN',
        description: `Deleted admin account: ${adminToDelete?.username}`,
        details: { target: adminToDelete?.username }
      }]);

      toast.success("Account removed")
      fetchAdmins()
    }
  }

  const togglePerm = (id: string) => {
    setSelectedPerms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const openEdit = (admin: AdminUser) => {
    setEditingAdmin(admin)
    setSelectedPerms(admin.permissions)
    setNewPassword("")
    setIsEditOpen(true)
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-white uppercase font-rounded italic tracking-widest">{t('title')}</h1>
          <p className="text-zinc-500 font-bold text-xl">{t('subtitle')}</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 font-black px-10 h-18 text-xl shadow-2xl shadow-white/5 gap-3 hover:scale-[1.02] transition-all active:scale-[0.98]">
              <UserPlus className="h-6 w-6" />
              {t('addNew')}
            </Button>
          } />
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl p-12 rounded-[3.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl">
            <DialogHeader className="space-y-6">
              <DialogTitle className="text-4xl font-black uppercase text-white font-rounded tracking-widest ai-text-gradient">{t('addNew')}</DialogTitle>
              <DialogDescription className="text-zinc-500 text-xl font-bold">{t('subtitle')}</DialogDescription>
            </DialogHeader>
            
            <div className="mt-10 space-y-10">
               <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3">
                   <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-1">{t('table.username')}</Label>
                   <Input 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white h-14 rounded-2xl px-6 text-lg font-bold" 
                    placeholder="staff_admin" 
                   />
                 </div>
                 <div className="space-y-3">
                   <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-1">Password</Label>
                   <Input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white h-14 rounded-2xl px-6 text-lg font-bold" 
                    placeholder="••••••••" 
                   />
                 </div>
               </div>

               <div className="space-y-5">
                 <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-1">{t('table.permissions')}</Label>
                 <div className="grid grid-cols-2 gap-4">
                    {MODULES.map(module => (
                      <button 
                        key={module.id}
                        onClick={() => togglePerm(module.id)}
                        className={cn(
                          "flex items-center justify-between p-5 rounded-2xl border-2 transition-all font-black text-sm uppercase tracking-wider",
                          selectedPerms.includes(module.id) 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500"
                        )}
                      >
                        {module.name}
                        {selectedPerms.includes(module.id) ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <div className="h-5 w-5 rounded-full border border-zinc-700" />}
                      </button>
                    ))}
                 </div>
               </div>

               <Button onClick={handleAddAdmin} className="w-full h-20 rounded-[1.5rem] font-black text-2xl mt-4 shadow-xl shadow-primary/20 ai-gradient-hover scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
                 {t('addNew')}
               </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-2xl rounded-[3rem] overflow-hidden">
        <CardContent className="p-0">
           <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead className="bg-zinc-950/50 text-zinc-500 uppercase tracking-[0.3em] text-[11px] font-black border-b border-zinc-800">
                  <tr>
                    <th className="text-left p-10">{t('table.username')}</th>
                    <th className="text-left p-10">{t('table.role')}</th>
                    <th className="text-left p-10">{t('table.permissions')}</th>
                    <th className="text-right p-10">{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {admins.map(admin => (
                    <tr key={admin.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-10">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-[1.5rem] bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-400 group-hover:text-primary transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                            <Shield className="h-8 w-8" />
                          </div>
                          <div className="space-y-1">
                             <span className="font-black text-white text-2xl font-rounded">{admin.username}</span>
                             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{t('table.createdAt')}: {new Date(admin.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-10">
                        <Badge className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all",
                          admin.role === 'Super Admin' ? 'bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        )}>
                          {admin.role}
                        </Badge>
                      </td>
                      <td className="p-10">
                        <div className="flex flex-wrap gap-2 max-w-[300px]">
                           {admin.permissions.map(p => (
                             <span key={p} className="text-[10px] font-black text-zinc-500 uppercase bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                               {MODULES.find(m => m.id === p)?.name || p}
                             </span>
                           ))}
                        </div>
                      </td>
                      <td className="p-10 text-right">
                        <div className="flex justify-end gap-3">
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-12 w-12 rounded-2xl transition-all border border-transparent",
                              admin.role === 'Super Admin' ? "opacity-10 cursor-not-allowed" : "hover:text-white hover:bg-zinc-800 hover:border-zinc-700"
                            )}
                            disabled={admin.role === 'Super Admin'}
                            onClick={() => openEdit(admin)}
                           >
                             <Settings2 className="h-6 w-6" />
                           </Button>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-12 w-12 rounded-2xl transition-all border border-transparent",
                              admin.role === 'Super Admin' ? "opacity-10 cursor-not-allowed" : "hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20"
                            )}
                            onClick={() => handleDelete(admin.id, admin.role)}
                            disabled={admin.role === 'Super Admin'}
                           >
                             <Trash2 className="h-6 w-6" />
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

      {/* Edit Admin Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl p-12 rounded-[3.5rem] backdrop-blur-2xl shadow-2xl overflow-hidden">
          <DialogHeader className="space-y-6">
            <DialogTitle className="text-4xl font-black uppercase font-rounded tracking-widest ai-text-gradient">{t('editAdmin')}</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xl font-bold">
              {t('table.username')}: <span className="text-white underline underline-offset-8 decoration-primary/50">{editingAdmin?.username}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-10 space-y-10">
             <div className="space-y-3">
               <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-1">New Password (Optional)</Label>
               <div className="relative">
                 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-600" />
                 <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white h-16 pl-16 rounded-2xl focus-visible:ring-primary/20 text-lg font-bold" 
                  placeholder="••••••••" 
                 />
               </div>
             </div>

             <div className="space-y-6">
               <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-1">{t('table.permissions')}</Label>
               <div className="grid grid-cols-2 gap-4">
                  {MODULES.map(module => (
                    <button 
                      key={module.id}
                      onClick={() => togglePerm(module.id)}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-2xl border-2 transition-all font-black text-sm uppercase tracking-wider",
                        selectedPerms.includes(module.id) 
                          ? "bg-primary/10 border-primary text-primary shadow-2xl shadow-primary/5" 
                          : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500"
                      )}
                    >
                      {module.name}
                      {selectedPerms.includes(module.id) ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <div className="h-5 w-5 rounded-full border border-zinc-700" />}
                    </button>
                  ))}
               </div>
             </div>

             <Button onClick={handleUpdateAdmin} className="w-full h-20 rounded-[1.5rem] font-black text-2xl mt-4 shadow-2xl shadow-primary/30 scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
               Update Credentials
               <ChevronRight className="ml-3 h-8 w-8" />
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
