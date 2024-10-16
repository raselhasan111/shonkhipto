import { useSession } from "next-auth/react"
import { useState, useCallback } from "react"

export function useAuthenticatedFetch() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!session?.accessToken) {
      throw new Error("No access token available")
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An unknown error occurred'))
      throw e
    } finally {
      setLoading(false)
    }
  }, [session])

  return { authFetch, loading, error }
}