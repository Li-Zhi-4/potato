interface AvatarProps {
    children: string
    size?: number
}

export function Avatar({ children, size=10 }: AvatarProps) {

    return (
       <div className={`border border-neutral-950 h-${size} w-${size} flex items-center justify-center text-sm`}>
            {children}
        </div>
    )
}