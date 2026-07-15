import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { CircleUserRoundIcon, BellIcon, LogOutIcon } from "lucide-react"
import { useAuth } from "@/context/authContext"
import { useNavigate } from "react-router-dom"

function initials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 0 || !words[0]) return "?"
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-2 w-full rounded-sm hover:bg-neutral-100 transition-colors text-left">
          <div className="size-8 border border-neutral-900 flex items-center justify-center shrink-0">
            <span className="font-mono text-[11px] uppercase text-neutral-900 leading-none">
              {initials(user.name)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-serif text-[14px] text-neutral-900 leading-tight truncate">
              {user.name}
            </span>
            <span className="font-light text-[10px] tracking-[2px] uppercase text-neutral-400 leading-tight truncate">
              {user.email}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="size-8 border border-neutral-900 flex items-center justify-center shrink-0">
              <span className="font-mono text-[11px] uppercase text-neutral-900 leading-none">
                {initials(user.name)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-serif text-[14px] text-neutral-900 leading-tight truncate">
                {user.name}
              </span>
              <span className="font-light text-[10px] tracking-[2px] uppercase text-neutral-400 leading-tight truncate">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CircleUserRoundIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
