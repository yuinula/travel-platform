import {useTranslations} from 'next-intl';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ShieldCheck, MessageSquare, Sparkles } from "lucide-react";
import Footer from "@/components/footer";

export default function Home() {
  const t = useTranslations('Home');

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/10">
      <section className="w-full py-16 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden flex items-center justify-center">
        {/* Travel Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073')] bg-cover bg-center bg-no-repeat bg-fixed"
        />
        {/* Soft Dark/Glass Overlay */}
        <div className="absolute inset-0 z-1 bg-white/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 z-1 bg-gradient-to-b from-white/20 via-transparent to-white" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-white/50 text-zinc-800 text-xs md:text-sm font-bold backdrop-blur-md shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>{t('badge')}</span>
            </div>
            
            <div className="space-y-4 w-full">
              <h1 className="font-black tracking-tight leading-[1.1] text-[clamp(1.75rem,8vw,5.5rem)] max-w-5xl mx-auto flex flex-col items-center text-zinc-900 drop-shadow-sm">
                <span className="block whitespace-nowrap w-full">
                  {t('title')}
                </span>
                <span className="block whitespace-nowrap w-full ai-text-gradient">
                  {t('subtitle')}
                </span>
              </h1>
              <p className="mx-auto max-w-[750px] text-zinc-800 text-sm md:text-xl px-4 leading-relaxed font-semibold drop-shadow-sm">
                {t('description')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5 pt-6 w-full sm:w-auto px-6">
              <Link href="/ai-planner" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:px-12 h-14 md:h-18 text-xl rounded-[1.25rem] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95] font-black">
                  {t('findGuide')}
                  <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </Link>
              <Link href="/signup?role=guide" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:px-12 h-14 md:h-18 text-xl rounded-[1.25rem] bg-white/80 backdrop-blur-md border-2 border-white transition-all hover:bg-white hover:border-zinc-900 shadow-xl font-bold">
                  {t('becomeGuide')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-20 md:py-32 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 lg:grid-cols-3">
            <Card variant="feature" icon={<ShieldCheck className="h-10 w-10" />} title={t('escrowTitle')} desc={t('escrowDesc')} />
            <Card variant="feature" icon={<MessageSquare className="h-10 w-10" />} title={t('commTitle')} desc={t('commDesc')} />
            <Card variant="feature" icon={<MapPin className="h-10 w-10" />} title={t('expertTitle')} desc={t('expertDesc')} />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Card({ variant, icon, title, desc }: { variant: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center md:items-start space-y-5 text-center md:text-left group p-8 rounded-[2rem] hover:bg-zinc-50 transition-all duration-500">
      <div className="p-5 bg-white rounded-2xl shadow-sm border border-zinc-100 group-hover:ai-gradient group-hover:text-white group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        <p className="text-zinc-500 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  )
}
