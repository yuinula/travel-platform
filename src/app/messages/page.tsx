"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, ImageIcon, FileText, CheckCircle2, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  type?: 'quote';
  price?: number;
  deposit?: number;
  details?: string;
}

interface ChatPartner {
  id: string;
  name: string;
  avatar_url: string;
}

interface TripData {
  id: string;
  status: string;
  traveler_id: string;
  guide_id: string;
}

function ChatRoom() {
  const t = useTranslations('Messages')
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const tripId = searchParams.get("tripId")
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [trip, setTrip] = useState<TripData | null>(null)
  const [partner, setPartner] = useState<ChatPartner | null>(null)
  const [loading, setLoading] = useState(true)
  const [myId, setMyId] = useState<string | null>(null)
  const [myRole, setMyRole] = useState<string | null>(null)

  useEffect(() => {
    const initChat = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setMyId(user.id)

      // Fetch user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile) setMyRole(profile.role)

      if (tripId) {
        const { data: tripData } = await supabase
          .from('trips')
          .select('*, traveler:traveler_id(id, name, avatar_url), guide:guide_id(id, name, avatar_url)')
          .eq('id', tripId)
          .single()

        if (tripData) {
          setTrip(tripData as any)
          const partnerData = user.id === tripData.traveler_id ? tripData.guide : tripData.traveler
          setPartner(partnerData as any)
          
          const { data: msgData } = await supabase
            .from('messages')
            .select('*')
            .eq('trip_id', tripId)
            .order('created_at', { ascending: true })
          
          if (msgData) setMessages(msgData as any)
        }
      }
      setLoading(false)
    }

    initChat()

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tripId, supabase, router])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !myId || !tripId) return

    const { error } = await supabase
      .from('messages')
      .insert([{
        trip_id: tripId,
        sender_id: myId,
        content: input
      }])

    if (error) {
      toast.error("Failed to send message")
    } else {
      setInput("")
    }
  }

  const handleSendQuote = async () => {
    if (!myId || !tripId) return
    
    const { error } = await supabase
      .from('messages')
      .insert([{
        trip_id: tripId,
        sender_id: myId,
        content: "I have prepared a custom itinerary and quote for you.",
        type: 'quote',
        price: 500,
        deposit: 100,
        details: "Full day curated experience including primary landmarks and hidden gems."
      }])

    if (error) {
      toast.error("Failed to send quote")
    } else {
      toast.success("Quote sent successfully")
    }
  }

  const renderSidebarContent = () => (
    <div className="space-y-2 overflow-y-auto mt-4">
      {partner && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 text-white shadow-lg border border-zinc-800 cursor-pointer">
          <Avatar className="h-10 w-10 border border-zinc-700">
            <AvatarImage src={partner.avatar_url} />
            <AvatarFallback className="bg-zinc-800">{partner.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-sm">{partner.name}</p>
            <p className="text-[10px] text-zinc-400 truncate uppercase tracking-widest">{trip?.status}</p>
          </div>
        </div>
      )}
    </div>
  )

  if (loading) {
    return <div className="h-full flex items-center justify-center font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">Establishing Secure Link...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="md:col-span-1 border rounded-xl bg-zinc-50/50 p-4 hidden md:flex overflow-hidden flex-col">
        <h2 className="font-black uppercase text-xs tracking-widest text-zinc-400 mb-4">{t('sidebarTitle')}</h2>
        {renderSidebarContent()}
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-3 flex flex-col border rounded-3xl bg-white shadow-xl overflow-hidden relative">
        <div className="p-4 md:p-6 border-b flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 md:gap-4">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden -ml-2")}>
                <MessageSquare className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader className="text-left">
                  <SheetTitle className="font-black uppercase text-xs tracking-widest">{t('sidebarTitle')}</SheetTitle>
                </SheetHeader>
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>

            <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-zinc-100 shadow-sm">
              <AvatarImage src={partner?.avatar_url} />
              <AvatarFallback className="bg-zinc-50 text-zinc-400 font-black">{partner?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-base md:text-lg text-zinc-900 font-rounded">{partner?.name || 'Local Expert'}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] uppercase font-black tracking-tighter border-primary/20 text-primary bg-primary/5">
                  {trip?.status || 'Active'}
                </Badge>
                <span className="text-[10px] text-green-500 font-black flex items-center gap-1.5 uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  {t('statusOnline')}
                </span>
              </div>
            </div>
          </div>
          
          {myRole === 'guide' && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSendQuote} className="rounded-xl h-10 md:h-12 border-2 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50">
                <FileText className="h-4 w-4 mr-2" />
                {t('sendQuote')}
              </Button>
            </div>
          )}
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-zinc-50/30"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
               <MessageSquare className="h-12 w-12" />
               <p className="font-black uppercase text-xs tracking-[0.2em]">Start your conversation with {partner?.name}</p>
            </div>
          )}
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex ${m.sender_id === myId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] ${m.sender_id === myId ? 'order-1' : 'order-2'}`}>
                {m.type === 'quote' ? (
                  <Card className="border-zinc-900 border-2 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <CardHeader className="bg-zinc-900 text-white py-2 md:py-3">
                      <CardTitle className="text-xs md:text-sm font-bold flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        {t('quoteTitle')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 md:pt-4 space-y-2 md:space-y-3">
                      <p className="text-xs md:text-sm font-medium text-zinc-700 leading-relaxed">{m.details}</p>
                      <div className="flex justify-between items-end border-t border-dashed pt-3 md:pt-4">
                        <div>
                          <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t('totalPrice')}</p>
                          <p className="text-xl md:text-2xl font-black">${m.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t('depositDue')}</p>
                          <p className="text-base md:text-lg font-bold text-zinc-600">${m.deposit}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-zinc-50 border-t py-2 md:py-3">
                      <Button className="w-full font-bold shadow-md h-8 md:h-9 text-xs md:text-sm" size="sm">
                        <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                        {t('acceptButton')}
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <div className={cn(
                    "p-4 md:p-5 rounded-2xl text-sm shadow-sm leading-relaxed font-medium",
                    m.sender_id === myId 
                      ? 'bg-zinc-900 text-white rounded-tr-none shadow-zinc-900/10' 
                      : 'bg-white border border-zinc-100 rounded-tl-none'
                  )}>
                    {m.content}
                    <p className={cn(
                      "text-[9px] mt-2 font-black uppercase tracking-widest opacity-40",
                      m.sender_id === myId ? 'text-right' : 'text-left'
                    )}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t bg-white/80 backdrop-blur-md">
          <div className="flex gap-3">
            <Button type="button" variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-muted-foreground hover:bg-zinc-100 hidden sm:inline-flex">
              <ImageIcon className="h-6 w-6" />
            </Button>
            <Input 
              placeholder={t('inputPlaceholder')} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-12 md:h-14 bg-zinc-50 border-zinc-100 rounded-2xl focus:bg-white transition-all shadow-inner px-6 text-base font-medium"
            />
            <Button type="submit" size="icon" className="h-12 w-12 md:h-14 md:w-14 rounded-2xl shadow-xl shadow-primary/20 shrink-0 ai-gradient">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <div className="container py-4 md:py-10 h-[calc(100vh-4rem)] flex flex-col mx-auto px-4">
      <Suspense fallback={<div className="h-full flex items-center justify-center font-black uppercase tracking-widest opacity-20">Loading Channel...</div>}>
        <ChatRoom />
      </Suspense>
    </div>
  )
}
