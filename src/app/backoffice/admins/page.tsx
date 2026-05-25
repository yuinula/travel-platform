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
  ArrowRight
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

interface AdminUser {
  id: string;
  username: string;
  password?: string;
  role: string;
  permissions: string[];
  created_at: string;
}

const MODULES = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'admin-portal', name: 'Admin Portal' },
  { id: 'analytics', name: 'Analytics' },
  { id: 'transactions', name: 'Transactions' },
  { id: 'manage-admins', name: 'Manage Admins' },
]

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['dashboard'])
  const [isSyncing, setIsSyncing] = useState(true)
  const supabase = createClient()

  const fetchAdmins = async () => {
    setIsSyncing(true)
    const { data, error } = await supabase
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
      toast.success(`Admin ${newUsername} added and synced`)
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
      toast.success(`Admin ${editingAdmin.username} updated`)
      setIsEditOpen(false)
      setEditingAdmin(null)
      setNewPassword("")
      fetchAdmins()
    }
  }

  const handleDelete = async (id: string, role: string) => {
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
      toast.success("Account removed and synced")
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Manage Admins</h1>
          <p className="text-zinc-500 font-medium text-lg mt-1">Configure staff accounts and access levels.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 font-black px-8 h-14 shadow-xl shadow-white/5 gap-2">
              <UserPlus className="h-5 w-5" />
              Add Sub-Admin
            </Button>
          } />
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl p-10 rounded-[3.5rem] bg-white/80 backdrop-blur-xl">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black uppercase text-zinc-900 font-rounded tracking-widest ai-text-gradient">Create Admin Account</DialogTitle>
              <DialogDescription className="text-zinc-500 text-lg font-bold">Define credentials and module permissions.</DialogDescription>
            </DialogHeader>
            
            <div className="mt-8 space-y-8">
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Username</Label>
                   <Input 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-zinc-100 border-zinc-200 text-zinc-900 h-12 rounded-xl" 
                    placeholder="e.g. staff_tokyo" 
                   />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Password</Label>
                   <Input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-zinc-100 border-zinc-200 text-zinc-900 h-12 rounded-xl" 
                    placeholder="••••••••" 
                   />
                 </div>
               </div>

               <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Module Access</Label>
                 <div className="grid grid-cols-2 gap-3">
                    {MODULES.map(module => (
                      <button 
                        key={module.id}
                        onClick={() => togglePerm(module.id)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-sm",
                          selectedPerms.includes(module.id) 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200"
                        )}
                      >
                        {module.name}
                        {selectedPerms.includes(module.id) ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <div className="h-4 w-4 rounded-full border border-zinc-200" />}
                      </button>
                    ))}
                 </div>
               </div>

               <Button onClick={handleAddAdmin} className="w-full h-16 rounded-2xl font-black text-xl mt-4 shadow-xl shadow-primary/20">
                 Create Account
               </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 md:p-10 border-b border-zinc-800">
           <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Active Personnel</CardTitle>
           <CardDescription className="text-zinc-500 font-medium">Currently authorized administrative accounts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950/50 text-zinc-500 uppercase tracking-widest text-[10px] font-black border-b border-zinc-800">
                  <tr>
                    <th className="text-left p-8">Administrator</th>
                    <th className="text-left p-8">Account Role</th>
                    <th className="text-left p-8">Access Level</th>
                    <th className="text-right p-8">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {admins.map(admin => (
                    <tr key={admin.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-400 group-hover:text-primary transition-colors">
                            <Shield className="h-6 w-6" />
                          </div>
                          <span className="font-black text-white text-lg">{admin.username}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <Badge className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          admin.role === 'Super Admin' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        )}>
                          {admin.role}
                        </Badge>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                           {admin.permissions.map(p => (
                             <span key={p} className="text-[9px] font-black text-zinc-600 uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                               {MODULES.find(m => m.id === p)?.name}
                             </span>
                           ))}
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-2">
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "text-zinc-600 rounded-xl transition-all",
                              admin.role === 'Super Admin' ? "opacity-20 cursor-not-allowed" : "hover:text-white hover:bg-zinc-800"
                            )}
                            disabled={admin.role === 'Super Admin'}
                            onClick={() => openEdit(admin)}
                           >
                             <Settings2 className="h-5 w-5" />
                           </Button>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "text-zinc-600 rounded-xl transition-all",
                              admin.role === 'Super Admin' ? "opacity-20 cursor-not-allowed" : "hover:text-red-500 hover:bg-red-500/10"
                            )}
                            onClick={() => handleDelete(admin.id, admin.role)}
                            disabled={admin.role === 'Super Admin'}
                           >
                             <Trash2 className="h-5 w-5" />
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
        <DialogContent className="bg-white/80 border-white/40 text-zinc-900 max-w-2xl p-10 rounded-[3.5rem] backdrop-blur-xl shadow-2xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-3xl font-black uppercase font-rounded tracking-widest ai-text-gradient">Edit Sub-Admin</DialogTitle>
            <DialogDescription className="text-zinc-500 text-lg font-bold">Update credentials and function access for <span className="text-zinc-900 underline underline-offset-4">{editingAdmin?.username}</span></DialogDescription>
          </DialogHeader>
          
          <div className="mt-8 space-y-8">
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">New Password (Optional)</Label>
               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                 <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-zinc-50 border-zinc-100 text-zinc-900 h-14 pl-12 rounded-xl focus-visible:ring-primary/20" 
                  placeholder="Leave blank to keep current" 
                 />
               </div>
             </div>

             <div className="space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Update Module Access</Label>
               <div className="grid grid-cols-2 gap-3">
                  {MODULES.map(module => (
                    <button 
                      key={module.id}
                      onClick={() => togglePerm(module.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-sm",
                        selectedPerms.includes(module.id) 
                          ? "bg-primary/10 border-primary text-primary shadow-sm" 
                          : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200"
                      )}
                    >
                      {module.name}
                      {selectedPerms.includes(module.id) ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <div className="h-4 w-4 rounded-full border border-zinc-200" />}
                    </button>
                  ))}
               </div>
             </div>

             <Button onClick={handleUpdateAdmin} className="w-full h-18 rounded-2xl font-black text-xl mt-4 shadow-2xl shadow-primary/30 scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
               Save Changes
               <ArrowRight className="ml-2 h-6 w-6" />
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
