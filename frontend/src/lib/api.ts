export const API_BASE = 'http://127.0.0.1:5000/api'

// returns the {"error": "error message"} or the res in a pre-defined interface
export async function handle<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error((err as { error?: string }).error || res.statusText)
    }
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
}

export function getHealth(): Promise<{ status: string }> {
    return fetch(`${API_BASE}/health`).then((r) => handle<{ status: string }>(r))
}