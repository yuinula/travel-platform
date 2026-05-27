"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  MessageSquare,
  Settings,
  Star,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: string | null
}

interface GuideProfile {
  bio: string | null
  languages: string[] | null
  service_areas: string[] | null
  is_available: boolean | null
  hourly_rate: number | null
  rating_avg: number | null
  review_count: number | null
}

interface Trip {
  id: string
  status: string
  total_price: number | null
  deposit_amount: number | null
  start_date: string | null
  end_date: string | null
  created_at: string
  traveler?: {
    name: string | null
    email: string | null
    avatar_url: string | null
  } | null
}

export default function GuideDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [updatingAvailability, setUpdatingAvailability] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [guideProfile, setGuideProfile] = useState<GuideProfile | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])

  const fetchDashboard = useCallback(async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, avatar_url, role")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      toast.error("Unable to load your profile.")
      setLoading(false)
      return
    }

    if (!profileData || profileData.role !== "guide") {
      router.push("/explore")
      return
    }

    setProfile(profileData)

    const [{ data: guideData }, { data: tripData }] = await Promise.all([
      supabase
        .from("guide_profiles")
        .select("bio, languages, service_areas, is_available, hourly_rate, rating_avg, review_count")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("trips")
        .select(`
          id, status, total_price, deposit_amount, start_date, end_date, created_at,
          traveler:traveler_id (name, email, avatar_url)
        `)
        .eq("guide_id", user.id)
        .order("created_at", { ascending: false }),
    ])

    setGuideProfile(guideData)
    setTrips((tripData || []) as Trip[])
    setLoading(false)
  }, [router, supabase])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchDashboard()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchDashboard])

  const activeTrips = useMemo(
    () => trips.filter((trip) => ["Negotiation", "Booked", "In-Progress"].includes(trip.status)),
    [trips]
  )

  const negotiationTrips = useMemo(
    () => trips.filter((trip) => trip.status === "Negotiation"),
    [trips]
  )

  const completedTrips = useMemo(
    () => trips.filter((trip) => ["Completed", "Settled"].includes(trip.status)),
    [trips]
  )

  const totalRevenue = useMemo(
    () => trips.reduce((sum, trip) => sum + Number(trip.total_price || 0), 0),
    [trips]
  )

  const toggleAvailability = async () => {
    if (!profile || !guideProfile) return

    setUpdatingAvailability(true)
    const nextValue = !guideProfile.is_available
    const { error } = await supabase
      .from("guide_profiles")
      .update({ is_available: nextValue })
      .eq("user_id", profile.id)

    if (error) {
      toast.error("Failed to update availability.")
    } else {
      setGuideProfile({ ...guideProfile, is_available: nextValue })
      toast.success(nextValue ? "You are now accepting matches." : "You are now hidden from new matches.")
    }

    setUpdatingAvailability(false)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl ai-gradient flex items-center justify-center animate-spin">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <p className="text-xs font-black tracking-[0.3em] uppercase text-zinc-400">Loading guide desk</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50/50 py-10 md:py-14">
      <div className="container max-w-7xl mx-auto px-4 space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="bg-white border border-zinc-100 rounded-[2rem] shadow-xl shadow-zinc-200/50 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 rounded-3xl border-4 border-white shadow-xl">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-zinc-100 text-zinc-400 text-2xl font-black">
                    {profile?.name?.[0] || "G"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Badge className="rounded-full bg-primary/10 text-primary border border-primary/10 font-black uppercase tracking-widest text-[9px] px-3">
                    Guide Dashboard
                  </Badge>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 font-rounded">
                      {profile?.name || "Local Guide"}
                    </h1>
                    <p className="text-zinc-500 font-medium">{profile?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={toggleAvailability}
                  disabled={!guideProfile || updatingAvailability}
                  variant={guideProfile?.is_available ? "default" : "outline"}
                  className={cn(
                    "h-12 rounded-2xl px-5 font-black",
                    guideProfile?.is_available && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {updatingAvailability ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  {guideProfile?.is_available ? "Accepting Matches" : "Unavailable"}
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl px-5 font-black" render={
                  <Link href="/profile" className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Edit Profile
                  </Link>
                } />
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Stat title="Active trips" value={activeTrips.length.toString()} icon={<Briefcase className="h-5 w-5" />} tone="blue" />
              <Stat title="Negotiations" value={negotiationTrips.length.toString()} icon={<MessageSquare className="h-5 w-5" />} tone="amber" />
              <Stat title="Revenue" value={`$${totalRevenue}`} icon={<DollarSign className="h-5 w-5" />} tone="emerald" />
            </div>
          </div>

          <div className="bg-white border border-zinc-100 rounded-[2rem] shadow-xl shadow-zinc-200/50 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-xl text-zinc-900 font-rounded">Guide Profile</h2>
                <p className="text-sm text-zinc-500 font-medium">Public matching details</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-black">
                <Star className="h-5 w-5 fill-current" />
                {Number(guideProfile?.rating_avg || 0).toFixed(1)}
              </div>
            </div>

            <div className="space-y-4">
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Service areas" value={formatList(guideProfile?.service_areas)} />
              <InfoRow icon={<UserRound className="h-4 w-4" />} label="Languages" value={formatList(guideProfile?.languages)} />
              <InfoRow icon={<Clock className="h-4 w-4" />} label="Hourly rate" value={guideProfile?.hourly_rate ? `$${guideProfile.hourly_rate} / hr` : "Not set"} />
            </div>

            <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-5">
              <p className="text-sm text-zinc-600 font-medium leading-relaxed line-clamp-5">
                {guideProfile?.bio || "Add a guide bio so travelers can understand your local expertise before they contact you."}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="bg-white border border-zinc-100 rounded-[2rem] shadow-xl shadow-zinc-200/50 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-black text-xl text-zinc-900 font-rounded">Traveler Requests</h2>
                <p className="text-sm text-zinc-500 font-medium">Trips where travelers selected you as guide</p>
              </div>
              <Button variant="outline" className="hidden sm:inline-flex rounded-xl font-black" onClick={fetchDashboard}>
                Refresh
              </Button>
            </div>

            {trips.length === 0 ? (
              <div className="p-12 md:p-20 text-center space-y-5">
                <div className="h-20 w-20 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mx-auto">
                  <Calendar className="h-10 w-10 text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-900">No requests yet</h3>
                  <p className="text-zinc-500 font-medium mt-2">Keep your guide profile complete to improve matching quality.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {trips.map((trip) => (
                  <div key={trip.id} className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-zinc-50/50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar className="h-12 w-12 rounded-2xl border border-zinc-100">
                        <AvatarImage src={trip.traveler?.avatar_url || ""} />
                        <AvatarFallback className="bg-zinc-50 text-zinc-400 font-black">
                          {trip.traveler?.name?.[0] || "T"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-zinc-900 truncate">{trip.traveler?.name || "Traveler"}</h3>
                          <Badge className={cn("rounded-full border px-2.5 text-[9px] font-black uppercase tracking-widest", statusTone(trip.status))}>
                            {trip.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium truncate">{trip.traveler?.email || "No email"}</p>
                        <p className="text-xs text-zinc-400 font-black uppercase tracking-widest mt-1">
                          {formatDateRange(trip.start_date, trip.end_date)} · #{trip.id.split("-")[0]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:justify-end">
                      <div className="text-right hidden sm:block">
                        <p className="text-lg font-black text-zinc-900">${trip.total_price || 0}</p>
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">quoted value</p>
                      </div>
                      <Button className="h-11 rounded-xl font-black" render={
                        <Link href={`/messages?tripId=${trip.id}`} className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Open Chat
                        </Link>
                      } />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-white border border-zinc-100 rounded-[2rem] shadow-xl shadow-zinc-200/50 p-6 space-y-4">
              <h2 className="font-black text-xl text-zinc-900 font-rounded">Pipeline</h2>
              <PipelineRow label="Negotiation" count={negotiationTrips.length} tone="amber" />
              <PipelineRow label="Active" count={activeTrips.length} tone="blue" />
              <PipelineRow label="Completed" count={completedTrips.length} tone="emerald" />
            </div>

            <div className="bg-zinc-900 text-white rounded-[2rem] shadow-xl p-6 space-y-4">
              <h2 className="font-black text-xl font-rounded">Next Action</h2>
              <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                Respond to negotiation chats quickly and keep service areas updated. Traveler matching uses your profile fields.
              </p>
              <Button variant="secondary" className="w-full h-11 rounded-xl font-black" render={
                <Link href="/messages" className="flex items-center justify-center">
                  Messages
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              } />
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}

function Stat({ title, value, icon, tone }: { title: string; value: string; icon: React.ReactNode; tone: "blue" | "amber" | "emerald" }) {
  const toneClass = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  }[tone]

  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</p>
        <div className={cn("h-9 w-9 rounded-xl border flex items-center justify-center", toneClass)}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-zinc-900 mt-3 font-rounded">{value}</p>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{label}</p>
        <p className="text-sm text-zinc-800 font-bold mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function PipelineRow({ label, count, tone }: { label: string; count: number; tone: "blue" | "amber" | "emerald" }) {
  const dotClass = {
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
  }[tone]

  return (
    <div className="flex items-center justify-between rounded-2xl bg-zinc-50 border border-zinc-100 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={cn("h-2.5 w-2.5 rounded-full", dotClass)} />
        <span className="text-sm font-black text-zinc-700">{label}</span>
      </div>
      <span className="text-lg font-black text-zinc-900">{count}</span>
    </div>
  )
}

function formatList(value?: string[] | null) {
  if (!value || value.length === 0) return "Not set"
  return value.join(", ")
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start || !end) return "Dates TBD"
  return `${format(new Date(start), "MMM d")} - ${format(new Date(end), "MMM d")}`
}

function statusTone(status: string) {
  switch (status) {
    case "Negotiation":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    case "Booked":
    case "In-Progress":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    case "Completed":
    case "Settled":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    default:
      return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
  }
}
