import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function UserMenu() {
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
        <DropdownMenuItem disabled className="cursor-not-allowed">
          themes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
