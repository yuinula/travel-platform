'use client';

import { useTransition, useEffect, useState } from 'react';
import { setUserLocale, getUserLocale } from '@/services/locale';
import { Languages, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Locale = 'en' | 'zh' | 'ja';

export default function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const [locale, setLocale] = useState<string>('en');

  useEffect(() => {
    const fetchLocale = async () => {
      const l = await getUserLocale();
      setLocale(l);
    };
    fetchLocale();
  }, []);

  function handleLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    startTransition(() => {
      setUserLocale(nextLocale);
    });
  }

  const languages: { value: Locale; label: string; short: string }[] = [
    { value: 'en', label: 'English', short: 'EN' },
    { value: 'zh', label: '繁體中文', short: '繁中' },
    { value: 'ja', label: '日本語', short: 'JP' },
  ];

  const currentLang = languages.find(l => l.value === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 px-2 gap-1 md:px-3")} disabled={isPending}>
        <Languages className="h-4 w-4 md:h-5 md:w-5" />
        <span className="text-xs font-bold hidden md:inline uppercase">{currentLang?.short}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => handleLocaleChange(lang.value)}
          >
            <span className="text-xs font-medium">{lang.label}</span>
            {locale === lang.value && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
