import {useTranslations} from 'next-intl';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ShieldCheck, MessageSquare, Sparkles } from "lucide-react";
import Footer from "@/components/footer";

export default function Home() {
  const t = useTranslations('Home');

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/10">
      <section className="w-full py-16 md:py-24 lg:py-32 xl:py-48 bg-background relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100/80 border border-zinc-200 text-zinc-600 text-xs md:text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>{t('badge')}</span>
            </div>
            
            <div className="space-y-4 w-full">
              <h1 className="font-bold tracking-tight leading-[1.1] text-[clamp(1.5rem,8vw,5rem)] max-w-5xl mx-auto flex flex-col items-center">
                <span className="block whitespace-nowrap w-full">
                  {t('title')}
                </span>
                <span className="block whitespace-nowrap w-full ai-text-gradient">
                  {t('subtitle')}
                </span>
              </h1>
              <p className="mx-auto max-w-[750px] text-zinc-500 text-sm md:text-xl px-4 leading-relaxed">
                {t('description')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto px-6">
              <Link href="/ai-planner" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:px-10 h-14 md:h-16 text-lg rounded-2xl shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {t('findGuide')}
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <Link href="/signup?role=guide" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:px-10 h-14 md:h-16 text-lg rounded-2xl bg-white/50 backdrop-blur-sm border-2 transition-all hover:bg-white">
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
