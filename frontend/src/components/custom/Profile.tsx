import { Avatar } from "./Avatar"

interface ProfileProps {
    name: string
    email?: string
}

export function Profile({ name, email }: ProfileProps) {

    return (
       <div className="flex flex-row gap-3 items-center">
            <Avatar>JD</Avatar>
            <div className="flex flex-col">
                <span className="font-serif text-neutral-800">{name}</span>
                {email && <span className="text-neutral-400 text-[10px] tracking-[2px]">{email.toUpperCase()}</span>}
            </div>
        </div>
    )
}