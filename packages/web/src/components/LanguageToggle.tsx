import { useState, useEffect } from 'react'
import type { Lang } from '@/i18n/translations'

export default function LanguageToggle() {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = (localStorage.getItem('lang') as Lang) || 'en'
    setLang(saved)
  }, [])

  function toggle() {
    const next: Lang = lang === 'en' ? 'es' : 'en'
    localStorage.setItem('lang', next)
    document.documentElement.setAttribute('data-lang', next)
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: next } }))
    setLang(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="font-mono text-[0.72rem] tracking-widest text-muted transition-colors hover:text-text cursor-pointer px-1 py-2"
    >
      {lang === 'en' ? 'ES' : 'EN'}
    </button>
  )
}
