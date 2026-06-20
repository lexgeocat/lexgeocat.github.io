const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

interface SupabaseClient {
  from(table: string): {
    insert(data: Record<string, unknown>): Promise<{ error: unknown }>
  }
}

function createSupabaseClient(): SupabaseClient {
  return {
    from(table: string) {
      return {
        async insert(data: Record<string, unknown>) {
          try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
              method: 'POST',
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
              },
              body: JSON.stringify(data),
            })
            if (!res.ok) return { error: new Error('HTTP ' + res.status) }
            return { error: null }
          } catch (err) {
            return { error: err }
          }
        },
      }
    },
  }
}

const supabase = createSupabaseClient()

export function useSupabase() {
  return { supabase }
}
