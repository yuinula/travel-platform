"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Trash2, 
  Shield, 
  Lock, 
  UserPlus, 
  Search,
  CheckCircle2,
  XCircle,
  Settings2
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
  createdAt: string;
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

  const handleDelete = async (id: string, username: string) => {
    if (username === 'admin01') {
      toast.error("Cannot delete the primary Super Admin")
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
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl p-10">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black uppercase text-white">Create Admin Account</DialogTitle>
              <DialogDescription className="text-zinc-500 text-lg">Define credentials and module permissions.</DialogDescription>
            </DialogHeader>
            
            <div className="mt-8 space-y-8">
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Username</Label>
                   <Input 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl" 
                    placeholder="e.g. staff_tokyo" 
                   />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Password</Label>
                   <Input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl" 
                    placeholder="••••••••" 
                   />
                 </div>
               </div>

               <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Module Access</Label>
                 <div className="grid grid-cols-2 gap-3">
                    {MODULES.map(module => (
                      <button 
                        key={module.id}
                        onClick={() => togglePerm(module.id)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-sm",
                          selectedPerms.includes(module.id) 
                            ? "bg-primary/10 border-primary text-white" 
                            : "bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        )}
                      >
                        {module.name}
                        {selectedPerms.includes(module.id) ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <div className="h-4 w-4 rounded-full border border-zinc-700" />}
                      </button>
                    ))}
                 </div>
               </div>

               <Button onClick={handleAddAdmin} className="w-full h-16 rounded-2xl font-black text-xl mt-4">
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
                          admin.role === 'Super Admin' ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-400'
                        )}>
                          {admin.role}
                        </Badge>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                           {admin.permissions.map(p => (
                             <span key={p} className="text-[9px] font-black text-zinc-500 uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                               {MODULES.find(m => m.id === p)?.name}
                             </span>
                           ))}
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-2">
                           <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-xl">
                             <Settings2 className="h-5 w-5" />
                           </Button>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-zinc-600 hover:text-red-500 hover:bg-red-50 rounded-xl"
                            onClick={() => handleDelete(admin.id, admin.username)}
                            disabled={admin.username === 'admin01'}
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
    </div>
  )
}
