"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from 'next-intl'
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

export default function MessagesPage() {
  const t = useTranslations('Messages')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get("guide")) {
      return [
        {
          id: "1",
          sender_id: "guide",
          content: "Hello! I saw you're interested in a tour. How can I help you plan your trip?",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        }
      ]
    }
    return []
  })
  
  const [input, setInput] = useState("")
  const [tripStatus, setTripStatus] = useState<"Draft" | "Negotiation" | "Booked">("Draft")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: Math.random().toString(),
      sender_id: "me",
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, newMessage])
    setInput("")

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender_id: "guide",
        content: "That sounds like a great plan! Let me draft a quote for you.",
        created_at: new Date().toISOString(),
      }])
    }, 1500)
  }

  const handleSendQuote = () => {
    setTripStatus("Negotiation")
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      sender_id: "guide",
      type: "quote",
      content: "I have prepared a custom itinerary for you.",
      price: 250,
      deposit: 50,
      details: "Full day Kyoto tour including Golden Pavilion and Arashiyama Bamboo Grove.",
      created_at: new Date().toISOString(),
    }])
  }

  const renderSidebarContent = () => (
    <div className="space-y-2 overflow-y-auto mt-4">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm border border-zinc-900/10 cursor-pointer">
        <Avatar className="h-10 w-10 border border-zinc-100">
          <AvatarImage src="https://i.pravatar.cc/150?u=kenji" />
          <AvatarFallback>K</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="font-bold text-sm">Kenji Tanaka</p>
          <p className="text-xs text-muted-foreground truncate">That sounds like a great...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container py-4 md:py-8 h-[calc(100vh-4rem)] flex flex-col mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="md:col-span-1 border rounded-xl bg-zinc-50/50 p-4 hidden md:flex overflow-hidden flex-col">
          <h2 className="font-bold mb-4">{t('sidebarTitle')}</h2>
          {renderSidebarContent()}
        </div>

        {/* Main Chat Area */}
        <div className="md:col-span-3 flex flex-col border rounded-xl bg-white shadow-sm overflow-hidden relative">
          <div className="p-3 md:p-4 border-b flex items-center justify-between bg-white">
            <div className="flex items-center gap-2 md:gap-3">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden -ml-2")}>
                  <MessageSquare className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px]">
                  <SheetHeader className="text-left">
                    <SheetTitle className="font-bold">{t('sidebarTitle')}</SheetTitle>
                  </SheetHeader>
                  {renderSidebarContent()}
                </SheetContent>
              </Sheet>

              <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-zinc-100">
                <AvatarImage src="https://i.pravatar.cc/150?u=kenji" />
                <AvatarFallback>K</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm md:text-base">Kenji Tanaka</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] md:text-[10px] h-3.5 md:h-4 font-bold border-zinc-200">
                    {t(`tripStatus.${tripStatus}`)}
                  </Badge>
                  <span className="text-[9px] md:text-[10px] text-green-500 font-bold flex items-center gap-1">
                    <span className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-green-500 animate-pulse" />
                    {t('statusOnline')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSendQuote} className="h-8 md:h-9 px-2 md:px-4 text-xs md:text-sm">
                <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                {t('sendQuote')}
              </Button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-zinc-50/30"
          >
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex ${m.sender_id === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] md:max-w-[80%] ${m.sender_id === 'me' ? 'order-1' : 'order-2'}`}>
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
                    <div className={`p-3 md:p-4 rounded-2xl text-xs md:text-sm shadow-sm ${
                      m.sender_id === 'me' 
                        ? 'bg-zinc-900 text-white rounded-tr-none' 
                        : 'bg-white border border-zinc-200 rounded-tl-none'
                    }`}>
                      {m.content}
                      <p className={`text-[9px] md:text-[10px] mt-1.5 md:mt-2 font-medium opacity-50 ${
                        m.sender_id === 'me' ? 'text-right' : 'text-left'
                      }`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t bg-white">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:bg-zinc-100 hidden sm:inline-flex">
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Input 
                placeholder={t('inputPlaceholder')} 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-10 md:h-11 bg-zinc-50 border-zinc-200 focus:bg-white transition-all shadow-inner text-sm"
              />
              <Button type="submit" size="icon" className="h-10 w-10 md:h-11 md:w-11 shadow-lg shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
