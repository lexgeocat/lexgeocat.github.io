import { ref } from 'vue'
import { getSupabase } from '../../lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(true)
const initialized = ref(false)

function init() {
  if (initialized.value) return
  initialized.value = true
  getSupabase()
    .auth.getSession()
    .then(({ data }) => {
      user.value = data.session?.user ?? null
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })

  getSupabase().auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })
}

init()

export function useAdminAuth() {
  async function signIn(email: string, password: string): Promise<string | null> {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.toLowerCase().includes('invalid login')) {
        return 'Correo o contraseña incorrectos.'
      }
      return error.message
    }
    user.value = data.user
    return null
  }

  async function signOut(): Promise<void> {
    await getSupabase().auth.signOut()
    user.value = null
  }

  return { user, loading, signIn, signOut }
}