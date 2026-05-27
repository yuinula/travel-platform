"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Mail } from "lucide-react"

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
              <Link href="https://line.me/R/ti/p/@913yknhc" target="_blank" className="text-zinc-400 hover:text-[#06C755] transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-5.617 0-12 4.369-12 9.738 0 4.814 4.454 8.841 10.454 9.601.407.088.96.269 1.1.618.117.292.077.75.038 1.045l-.17 1.023c-.053.305-.258 1.194 1.11 0 1.368-1.194 7.394-4.355 10.077-7.458 1.385-1.564 1.391-3.21 1.391-4.831zm-17.754 3.731h-1.341a.343.343 0 0 1-.343-.343v-4.331c0-.189.154-.343.343-.343h1.341a.343.343 0 0 1 .343.343v4.331a.343.343 0 0 1-.343.343zm4.551-4.674v4.331a.343.343 0 0 1-.343.343h-1.341a.343.343 0 0 1-.343-.343V9.361c0-.189.154-.343.343-.343H10.45c.101 0 .193.044.256.12l1.96 2.37V9.361c0-.189.154-.343.343-.343h1.341a.343.343 0 0 1 .343.343v4.331a.343.343 0 0 1-.343.343h-1.341a.343.343 0 0 1-.256-.12l-1.96-2.37zm7.254 3.32h-1.815v-1.117h1.815a.343.343 0 0 1 .343.343v.431a.343.343 0 0 1-.343.343zm.343-3.04a.343.343 0 0 1-.343.343h-1.815v1.117h1.815a.343.343 0 0 1 .343.343v.431a.343.343 0 0 1-.343.343h-2.158a.343.343 0 0 1-.343-.343v-4.331a.343.343 0 0 1 .343-.343h2.158a.343.343 0 0 1 .343.343v.431a.343.343 0 0 1-.343.343h-1.815v1.117h1.815a.343.343 0 0 1 .343.343v.431z" />
                </svg>
              </Link>
              <Link href="mailto:yuinula@gmail.com" className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <Mail className="h-6 w-6" />
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
              <Link href="/about" className="text-sm text-muted-foreground hover:text-zinc-900 transition-colors">
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
