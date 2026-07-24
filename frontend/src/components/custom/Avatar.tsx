interface AvatarProps {
    children: string
    size?: number
}

export function Avatar({ children }: AvatarProps) {

    return (
       <div className={`border border-neutral-950 h-10 w-10 flex items-center justify-center text-sm`}>
            {children}
        </div>
    )
}