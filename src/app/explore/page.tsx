"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Languages, Search } from "lucide-react"
import Link from "next/link"

interface Guide {
  user_id: string;
  bio: string;
  languages: string[];
  service_areas: string[];
  hourly_rate: number;
  rating_avg: number;
  review_count: number;
  profiles: {
    name: string;
    avatar_url: string;
  }
}

export default function ExplorePage() {
  const t = useTranslations('Explore')
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true)
      
      // Mock data for demonstration
      const mockGuides: Guide[] = [
        {
          user_id: "1",
          bio: "Expert in Japanese traditional culture and food. I can show you the hidden gems of Kyoto.",
          languages: ["English", "Japanese", "Mandarin"],
          service_areas: ["Kyoto", "Osaka"],
          hourly_rate: 50,
          rating_avg: 4.9,
          review_count: 124,
          profiles: {
            name: "Kenji Tanaka",
            avatar_url: "https://i.pravatar.cc/150?u=kenji",
          }
        },
        {
          user_id: "2",
          bio: "Specialized in family-friendly tours in Taipei. Stroller-accessible routes and kid-friendly activities.",
          languages: ["English", "Mandarin", "Taiwanese"],
          service_areas: ["Taipei", "Yilan"],
          hourly_rate: 40,
          rating_avg: 4.8,
          review_count: 89,
          profiles: {
            name: "Sophie Chen",
            avatar_url: "https://i.pravatar.cc/150?u=sophie",
          }
        },
        {
          user_id: "3",
          bio: "Deep dive into Paris art scene. Former museum curator with a passion for hidden street art.",
          languages: ["English", "French"],
          service_areas: ["Paris"],
          hourly_rate: 65,
          rating_avg: 5.0,
          review_count: 45,
          profiles: {
            name: "Marc Lefebvre",
            avatar_url: "https://i.pravatar.cc/150?u=marc",
          }
        }
      ]
      
      setGuides(mockGuides)
      setLoading(false)
    }

    fetchGuides()
  }, [])

  const filteredGuides = guides.filter(guide => 
    guide.profiles.name.toLowerCase().includes(search.toLowerCase()) ||
    guide.service_areas.some((area: string) => area.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container py-8 mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('searchPlaceholder')} 
            className="pl-9 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 rounded-2xl border-2 border-dashed">
          <p className="text-muted-foreground">{t('noGuides')}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <Card key={guide.user_id} className="overflow-hidden transition-all hover:shadow-md group">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-zinc-900 transition-colors">
                  <AvatarImage src={guide.profiles.avatar_url} />
                  <AvatarFallback>{guide.profiles.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <CardTitle className="text-lg">{guide.profiles.name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-zinc-900 text-zinc-900 mr-1" />
                    <span className="font-medium text-zinc-900">{guide.rating_avg}</span>
                    <span className="ml-1">({guide.review_count} {t('reviews')})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 h-40 overflow-hidden">
                <p className="text-sm text-zinc-600 line-clamp-2">
                  {guide.bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {guide.service_areas.map((area: string) => (
                    <Badge key={area} variant="secondary" className="font-normal">
                      <MapPin className="h-3 w-3 mr-1" />
                      {area}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center text-sm text-muted-foreground pt-2 border-t">
                  <Languages className="h-3 w-3 mr-2" />
                  {guide.languages.join(", ")}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t bg-zinc-50/50 px-6 py-4">
                <div className="text-sm">
                  <span className="text-lg font-bold">${guide.hourly_rate}</span>
                  <span className="text-muted-foreground"> / {t('hourlyRate')}</span>
                </div>
                <Link href={`/guides/${guide.user_id}`}>
                  <Button size="sm">{t('viewProfile')}</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
