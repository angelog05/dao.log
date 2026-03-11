import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ThemeName = 'seb' | 'consola'

export default function UserMenu() {
  const [theme, setTheme] = useState<ThemeName>('seb')

  useEffect(() => {
    const saved = (localStorage.getItem('themeName') as ThemeName) || 'seb'
    setTheme(saved)
  }, [])

  function selectTheme(name: ThemeName) {
    document.documentElement.classList.toggle('theme-consola', name === 'consola')
    localStorage.setItem('themeName', name)
    setTheme(name)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)]"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8 cursor-pointer transition-opacity hover:opacity-80">
            <AvatarFallback
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
              className="font-mono text-sm font-semibold"
            >
              B
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="font-mono text-[0.78rem] min-w-[8rem]">
        <DropdownMenuLabel className="text-[0.65rem] uppercase tracking-widest opacity-60 pb-1">
          themes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => selectTheme('seb')}
          className="flex items-center justify-between cursor-pointer"
        >
          seb
          {theme === 'seb' && <Check className="h-3 w-3 ml-2 opacity-70" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => selectTheme('consola')}
          className="flex items-center justify-between cursor-pointer"
        >
          consola
          {theme === 'consola' && <Check className="h-3 w-3 ml-2 opacity-70" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
