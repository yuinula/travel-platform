"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  Plus, 
  GripVertical, 
  MapPin, 
  Clock, 
  Save,
  Search,
  Info
} from "lucide-react"
import Link from "next/link"

// Types for our itinerary
interface HiddenGem {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
}

interface ItineraryItem {
  id: string;
  gem_id?: string;
  title: string;
  description: string;
  time: string;
}

interface DayPlan {
  day: number;
  items: ItineraryItem[];
}

export default function ItineraryBuilderPage() {
  const { tripId } = useParams()
  const router = useRouter()
  
  // Mock Hidden Gems Library
  const [hiddenGems] = useState<HiddenGem[]>([
    { id: "g1", name: "Fushimi Inari Secret Path", category: "Culture", location: "Kyoto", description: "Less crowded trail through the thousands of torii gates." },
    { id: "g2", name: "Nishiki Market Early Bird", category: "Food", location: "Kyoto", description: "Best time to see the market waking up and try fresh soy milk donuts." },
    { id: "g3", name: "Gion Night Walk", category: "Culture", location: "Kyoto", description: "Silent streets where you might spot a Geiko on her way to an appointment." },
    { id: "g4", name: "Arashiyama Hidden Temple", category: "Nature", location: "Kyoto", description: "Otagi Nenbutsu-ji with 1200 unique stone statues." },
  ])

  // Current Trip Itinerary
  const [itinerary, setItinerary] = useState<DayPlan[]>([
    { day: 1, items: [] },
    { day: 2, items: [] },
  ])

  const [searchTerm, setSearchTerm] = useState("")

  const addToDay = (dayIndex: number, gem: HiddenGem) => {
    const newItinerary = [...itinerary]
    const newItemId = "item-" + (newItinerary[dayIndex].items.length + 1)
    newItinerary[dayIndex].items.push({
      id: newItemId,
      gem_id: gem.id,
      title: gem.name,
      description: gem.description,
      time: "09:00 AM"
    })
    setItinerary(newItinerary)
  }

  const handleSave = () => {
    // In a real app, this would save to Supabase
    router.push(`/messages?trip=${tripId}`)
  }

  const filteredGems = hiddenGems.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Itinerary Builder</h1>
            <p className="text-xs text-muted-foreground">Trip ID: {tripId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4 mr-2" />
            AI Suggestions
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Itinerary
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Hidden Gems Library */}
        <div className="w-80 border-r bg-zinc-50 flex flex-col">
          <div className="p-4 border-b bg-white">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search gems..." 
                className="pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Hidden Gem Library</h2>
            {filteredGems.map(gem => (
              <Card key={gem.id} className="cursor-pointer hover:border-zinc-900 transition-colors group">
                <CardHeader className="p-3 pb-1">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0">
                      {gem.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm mt-1">{gem.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {gem.description}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-7 text-[10px]"
                    onClick={() => addToDay(0, gem)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add to Day 1
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content: Trip Timeline */}
        <div className="flex-1 overflow-y-auto p-8 bg-zinc-100/50">
          <div className="max-w-3xl mx-auto space-y-8">
            {itinerary.map((dayPlan) => (
              <div key={dayPlan.day} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center">
                    Day {dayPlan.day}
                    <span className="ml-3 text-sm font-normal text-muted-foreground">Kyoto Discovery</span>
                  </h2>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Custom Item
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {dayPlan.items.length === 0 ? (
                    <div className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground bg-white/50">
                      Drag and drop gems here or click &quot;Add&quot; from the library.
                    </div>
                  ) : (
                    dayPlan.items.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl shadow-sm border p-4 flex gap-4 items-start group">
                        <div className="mt-1 text-zinc-400 cursor-grab active:cursor-grabbing">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="h-5 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {item.time}
                              </Badge>
                              <h3 className="font-bold">{item.title}</h3>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                              <span className="text-xs text-red-500 font-bold">×</span>
                            </Button>
                          </div>
                          <p className="text-sm text-zinc-600">{item.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            Kyoto, Japan
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full border-dashed py-8 h-auto" onClick={() => setItinerary([...itinerary, { day: itinerary.length + 1, items: [] }])}>
              <Plus className="h-5 w-5 mr-2" />
              Add Another Day
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
