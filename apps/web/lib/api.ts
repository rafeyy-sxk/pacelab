const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export interface APIResponse<T> {
  data: T | null
  error: string | null
  status: string
}

export async function fetchAPI<T>(path: string): Promise<APIResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) {
    return { data: null, error: `HTTP ${res.status}`, status: "error" }
  }
  return res.json() as Promise<APIResponse<T>>
}
