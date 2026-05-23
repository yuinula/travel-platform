"use client"

import { useTranslations } from 'next-intl';
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ShieldCheck, MessageSquare, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "@/components/footer";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function FadeInScroll({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    }, { threshold: 0.1 });
    
    const current = domRef.current;
    if (current) observer.observe(current);
    
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={cn(
        "transition-all duration-1000 ease-out transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const t = useTranslations('Home');

  const features = [
    { id: 'escrow', icon: <ShieldCheck className="h-10 w-10" />, title: t('escrowTitle'), desc: t('escrowDesc'), detail: t('escrowDetail') },
    { id: 'smart', icon: <Sparkles className="h-10 w-10" />, title: t('smartTitle'), desc: t('smartDesc'), detail: t('smartDetail') },
    { id: 'comm', icon: <MessageSquare className="h-10 w-10" />, title: t('commTitle'), desc: t('commDesc'), detail: t('commDetail') },
    { id: 'expert', icon: <MapPin className="h-10 w-10" />, title: t('expertTitle'), desc: t('expertDesc'), detail: t('expertDetail') },
  ];

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
          <FadeInScroll>
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-white/50 text-zinc-800 text-xs md:text-sm font-bold backdrop-blur-md shadow-lg">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>{t('badge')}</span>
              </div>
              
              <div className="space-y-4 w-full">
                <h1 className="font-black tracking-tight leading-[1.1] text-[clamp(1.75rem,8vw,5.5rem)] max-w-5xl mx-auto flex flex-col items-center text-zinc-900 drop-shadow-sm">
                  <span className="block whitespace-nowrap w-full text-[0.8em]">
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
          </FadeInScroll>
        </div>
      </section>

      {/* Destination Gallery Section */}
      <section className="w-full py-20 bg-zinc-50/50">
        <div className="container px-4 md:px-6 mx-auto">
          <FadeInScroll>
            <div className="flex flex-col space-y-10">
              <div className="flex items-end justify-between px-2">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900">{t('destinations.title')}</h2>
                  <div className="h-1.5 w-20 ai-gradient rounded-full" />
                </div>
                <div className="hidden md:flex gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-12 w-12 border-2"
                    onClick={() => {
                      const el = document.getElementById('dest-scroll');
                      if (el) el.scrollBy({ left: -400, behavior: 'smooth' });
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-12 w-12 border-2"
                    onClick={() => {
                      const el = document.getElementById('dest-scroll');
                      if (el) el.scrollBy({ left: 400, behavior: 'smooth' });
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              <div 
                id="dest-scroll"
                className="flex gap-6 overflow-x-auto pb-8 pt-2 no-scrollbar snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {[
                  { id: 'kyoto', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800' },
                  { id: 'paris', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800' },
                  { id: 'bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800' },
                  { id: 'taipei', img: 'https://images.unsplash.com/photo-1598935900064-5ee8670ade64?q=80&w=800' } 
                ].map((dest) => (
                  <Dialog key={dest.id}>
                    <DialogTrigger asChild>
                      <div className="flex-none w-[280px] md:w-[350px] aspect-[3/4] rounded-[2.5rem] overflow-hidden relative group cursor-pointer snap-center shadow-xl shadow-zinc-200/50 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
                        <img 
                          src={dest.img} 
                          alt={t(`destinations.${dest.id}.name`)}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-2">
                          <h3 className="text-2xl font-black tracking-tight font-rounded">{t(`destinations.${dest.id}.name`)}</h3>
                          <p className="text-sm text-zinc-200 font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                            {t(`destinations.${dest.id}.desc`)}
                          </p>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-2xl rounded-[3rem]">
                      <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[600px]">
                        {/* Left Side: Large Image (Desktop) / Top Image (Mobile) */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                          <img 
                            src={dest.img} 
                            alt={t(`destinations.${dest.id}.name`)} 
                            className="absolute inset-0 w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                          <div className="absolute bottom-6 left-8 md:bottom-12 md:left-12 text-white">
                            <p className="text-sm font-black uppercase tracking-[0.3em] opacity-80 mb-2">Featured Destination</p>
                            <h3 className="text-4xl md:text-5xl font-black font-rounded tracking-widest leading-none">{t(`destinations.${dest.id}.name`).split('，')[0]}</h3>
                          </div>
                        </div>

                        {/* Right Side: Content */}
                        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center space-y-6 md:space-y-8 overflow-y-auto">
                          <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
                                {t(`destinations.${dest.id}.name`).split('，')[1]}
                              </span>
                              <div className="h-px flex-1 bg-zinc-100" />
                            </div>
                            <p className="text-xl md:text-2xl text-zinc-800 font-bold leading-relaxed">
                              {t(`destinations.${dest.id}.desc`)}
                            </p>
                          </div>

                          <div className="p-6 md:p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100 space-y-3 relative group/tip">
                            <div className="absolute -top-3 left-6 px-4 py-1 bg-white border border-zinc-100 rounded-full shadow-sm">
                              <h4 className="text-xs uppercase font-black tracking-widest text-primary flex items-center gap-2">
                                <Sparkles className="h-3 w-3" />
                                Butler Tips
                              </h4>
                            </div>
                            <p className="text-zinc-600 font-medium leading-relaxed italic">
                              "{t(`destinations.${dest.id}.tips`)}"
                            </p>
                          </div>

                          <div className="pt-4">
                            <Button className="w-full h-16 md:h-18 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
                              <Link href="/ai-planner">
                                {t('findGuide')}
                                <ArrowRight className="ml-2 h-6 w-6" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          </FadeInScroll>
        </div>
      </section>

      <section className="w-full py-20 md:py-32 bg-white relative">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 md:gap-12 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FadeInScroll key={feature.id} delay={(index + 1) * 100}>
                <Dialog>
                  <DialogTrigger render={<Card variant="feature" icon={feature.icon} title={feature.title} desc={feature.desc} />} />
                  <DialogContent className="sm:max-w-md p-10">
                    <DialogHeader className="space-y-6">
                      <div className="p-5 bg-zinc-50 rounded-2xl w-fit mx-auto sm:mx-0 shadow-sm border border-zinc-100 ai-gradient text-white">
                        {feature.icon}
                      </div>
                      <div className="space-y-2">
                        <DialogTitle className="text-3xl font-black text-zinc-900">{feature.title}</DialogTitle>
                        <DialogDescription className="text-lg text-zinc-500 font-bold leading-relaxed">
                          {feature.desc}
                        </DialogDescription>
                      </div>
                    </DialogHeader>
                    <div className="mt-6 py-6 border-t border-zinc-100/50">
                      <p className="text-zinc-700 leading-relaxed text-base font-medium">
                        {feature.detail}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </FadeInScroll>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Card({ variant, icon, title, desc, ...props }: { variant: string, icon: React.ReactNode, title: string, desc: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      type="button"
      {...props}
      className={cn(
        "flex flex-col items-center md:items-start space-y-5 text-center md:text-left group p-8 rounded-[2.5rem] hover:bg-zinc-50/80 transition-all duration-500 border border-transparent hover:border-zinc-100 hover:shadow-2xl hover:shadow-zinc-200/50 cursor-pointer w-full appearance-none",
        props.className
      )}
    >
      <div className="p-5 bg-zinc-50 rounded-2xl shadow-sm border border-zinc-100 group-hover:ai-gradient group-hover:text-white group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:-translate-y-2 transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-2 transition-transform duration-500 group-hover:translate-x-1 text-left">
        <h3 className="text-2xl font-black tracking-tight text-zinc-800">{title}</h3>
        <p className="text-zinc-500 leading-relaxed font-medium">
          {desc}
        </p>
      </div>
    </button>
  )
}
