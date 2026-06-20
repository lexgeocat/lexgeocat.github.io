<template>
  <div class="admin-card">
    <h1>Iniciar sesión</h1>
    <form
      class="admin-form"
      @submit.prevent="handleLogin"
    >
      <p
        v-if="error"
        class="admin-error"
      >
        {{ error }}
      </p>
      <label>Email <input
        v-model="email"
        type="email"
        required
        autocomplete="email"
      ></label>
      <label>Contraseña <input
        v-model="password"
        type="password"
        required
        autocomplete="current-password"
      ></label>
      <button
        class="admin-btn"
        type="submit"
        :disabled="busy"
      >
        {{ busy ? 'Ingresando…' : 'Ingresar' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '../composables/useAdminAuth'

const { signIn } = useAdminAuth()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function handleLogin() {
  error.value = ''
  busy.value = true
  const msg = await signIn(email.value, password.value)
  busy.value = false
  if (msg) error.value = msg
  else router.push('/dashboard')
}
</script>
