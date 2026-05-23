"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Globe, Camera, Share2, Mail } from "lucide-react"

export default function Footer() {
  const t = useTranslations("Footer")
  const nt = useTranslations("Navbar")
  const title = nt("title")

  return (
    <footer className="w-full border-t bg-zinc-50/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Logo & Brand Section */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Image src="/logo.svg" alt="Logo" width={24} height={24} className="dark:invert transition-transform group-hover:scale-110" />
              <span className="font-bold text-xl tracking-widest uppercase font-rounded ai-text-gradient">
                {title}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {t("description")}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Link href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <Camera className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <Share2 className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Sitemap */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-sm uppercase tracking-widest">{t("sitemap")}</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/explore" className="text-sm text-muted-foreground hover:text-zinc-900 transition-colors">
                {t("explore")}
              </Link>
              <Link href="/ai-planner" className="text-sm text-muted-foreground hover:text-zinc-900 transition-colors">
                {t("aiPlanner")}
              </Link>
              <Link href="/signup?role=guide" className="text-sm text-muted-foreground hover:text-zinc-900 transition-colors">
                {t("becomeGuide")}
              </Link>
            </nav>
          </div>

          {/* About & Support */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-sm uppercase tracking-widest">{t("support")}</h3>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-muted-foreground hover:text-zinc-900 transition-colors">
                {t("about")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-zinc-900 transition-colors">
                {t("contact")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-zinc-900 transition-colors">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-sm uppercase tracking-widest">{t("legal")}</h3>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-muted-foreground hover:text-zinc-900 transition-colors">
                {t("terms")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-zinc-900 transition-colors">
                {t("privacy")}
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>{t("copyright", { title })}</p>
          <div className="flex items-center gap-6">
            <span>Powered by Trip Buddy Global</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
