"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, MessageSquare, Calendar, ChevronLeft } from "lucide-react"
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

export default function GuideDetailPage() {
  const t = useTranslations('GuideDetail')
  const { id } = useParams()
  const router = useRouter()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true)
      // Mock data for the specific guide
      const mockGuides: Record<string, Guide> = {
        "1": {
          user_id: "1",
          bio: "Expert in Japanese traditional culture and food. I can show you the hidden gems of Kyoto. I have been living in Kyoto for over 15 years and have a deep connection with local artisans and tea houses. My tours focus on the 'wabi-sabi' philosophy and finding peace in the bustling city.",
          languages: ["English", "Japanese", "Mandarin"],
          service_areas: ["Kyoto", "Osaka", "Nara"],
          hourly_rate: 50,
          rating_avg: 4.9,
          review_count: 124,
          profiles: {
            name: "Kenji Tanaka",
            avatar_url: "https://i.pravatar.cc/150?u=kenji",
          }
        },
        "2": {
          user_id: "2",
          bio: "Specialized in family-friendly tours in Taipei. Stroller-accessible routes and kid-friendly activities. As a mother of two, I know exactly what families need when traveling. I focus on making travel educational and fun for children while ensuring parents can also relax and enjoy the local culture.",
          languages: ["English", "Mandarin", "Taiwanese"],
          service_areas: ["Taipei", "Yilan", "Keelung"],
          hourly_rate: 40,
          rating_avg: 4.8,
          review_count: 89,
          profiles: {
            name: "Sophie Chen",
            avatar_url: "https://i.pravatar.cc/150?u=sophie",
          }
        }
      }
      
      setGuide(mockGuides[id as string] || mockGuides["1"])
      setLoading(false)
    }

    fetchGuide()
  }, [id])

  const handleContact = () => {
    router.push(`/messages?guide=${id}`)
  }

  if (loading) return <div className="container py-20 text-center mx-auto">{t('notFound')}...</div>
  if (!guide) return <div className="container py-20 text-center mx-auto">{t('notFound')}</div>

  return (
    <div className="container py-8 max-w-5xl mx-auto px-4">
      <Link href="/explore">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('back')}
        </Button>
      </Link>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 border-4 border-zinc-100 shadow-sm">
              <AvatarImage src={guide.profiles.avatar_url} />
              <AvatarFallback>{guide.profiles.name[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">{guide.profiles.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-zinc-900 text-zinc-900 mr-1" />
                  <span className="font-bold text-zinc-900">{guide.rating_avg}</span>
                  <span className="ml-1">({guide.review_count} {t('back').includes('Explore') ? 'reviews' : '則評論'})</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {guide.service_areas.join(", ")}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('about')}</h2>
            <p className="text-zinc-600 leading-relaxed text-lg whitespace-pre-wrap">
              {guide.bio}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('expertise')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t('languages')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.languages.map((lang: string) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t('serviceAreas')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.service_areas.map((area: string) => (
                      <Badge key={area} variant="secondary">{area}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24 border-2 border-zinc-900/5 shadow-xl">
            <CardHeader>
              <CardTitle>{t('bookTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline justify-between border-b pb-4">
                <span className="text-muted-foreground">{t('hourlyRate')}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${guide.hourly_rate}</span>
                  <span className="text-sm text-muted-foreground">/ hr</span>
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <Button className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all" size="lg" onClick={handleContact}>
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {t('contact')}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                  {t('contactHint')}
                </p>
              </div>

              <div className="pt-6 border-t space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{t('availability')}</span>
                </div>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <div className="h-2 w-2 rounded-full bg-green-600 mr-3 animate-pulse" />
                  <span>{t('currentlyAvailable')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
