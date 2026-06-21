<template>
  <div class="login-screen">
    <div class="login-card">
      <div class="login-brand">
        <span class="login-brand__mark">Lex<span class="geo">Geo</span><span class="cat">Cat</span></span>
        <span class="login-brand__sub">Panel administrativo</span>
      </div>

      <form
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <p
          v-if="error"
          class="admin-error"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-triangle-exclamation"
          />
          {{ error }}
        </p>

        <label>
          Correo electrónico
          <div class="login-input-wrap">
            <i
              aria-hidden="true"
              class="fa-solid fa-envelope"
            />
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="tu@email.com"
            >
          </div>
        </label>

        <label>
          Contraseña
          <div class="login-input-wrap">
            <i
              aria-hidden="true"
              class="fa-solid fa-lock"
            />
            <input
              v-model="password"
              :type="showPass ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="••••••••"
            >
            <button
              type="button"
              class="login-toggle-pass"
              :aria-label="showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPass = !showPass"
            >
              <i
                aria-hidden="true"
                :class="'fa-solid ' + (showPass ? 'fa-eye-slash' : 'fa-eye')"
              />
            </button>
          </div>
        </label>

        <button
          class="login-submit"
          type="submit"
          :disabled="busy"
        >
          <i
            v-if="busy"
            aria-hidden="true"
            class="fa-solid fa-spinner fa-spin"
          />
          <i
            v-else
            aria-hidden="true"
            class="fa-solid fa-right-to-bracket"
          />
          {{ busy ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>
      <router-link
        to="/"
        class="login-back-home"
      >
        <i
          aria-hidden="true"
          class="fa-solid fa-arrow-left"
        />
        Ir a inicio
      </router-link>

      <p class="login-footer">
        Acceso exclusivo para administración de contenidos.
      </p>
    </div>
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
const showPass = ref(false)

async function handleLogin() {
  error.value = ''
  busy.value = true
  const msg = await signIn(email.value, password.value)
  busy.value = false
  if (msg) error.value = msg
  else router.push('/admin/servicios')
}
</script>

<style lang="scss" scoped>
.login-screen {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    ellipse 120% 100% at 50% 0%,
    var(--color-bg-surface) 0%,
    var(--color-bg-primary) 70%
  );
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 20px 56px rgb(0 0 0 / 45%);
  padding: 36px 32px 28px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-copper), var(--color-sapphire));
  }
}

.login-brand {
  text-align: center;
  margin-bottom: 28px;

  &__mark {
    font-family: var(--font-display);
    font-size: 1.7rem;
    font-weight: 800;
    color: var(--color-text-primary);

    .geo { color: var(--color-sapphire-glow); }
    .cat { color: var(--color-copper-glow); }
  }

  &__sub {
    display: block;
    margin-top: 6px;
    font-family: var(--font-heading);
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--font-heading);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.login-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgb(255 255 255 / 4%);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 11px 14px;
  transition: all 0.2s;

  &:focus-within {
    border-color: var(--color-copper-glow);
    box-shadow: 0 0 0 3px rgb(184 115 51 / 15%);
  }

  i:first-child {
    color: var(--color-copper-glow);
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    color: var(--color-text-primary);
    font-family: var(--font-body);
    font-size: 0.92rem;
    text-transform: none;
    letter-spacing: normal;

    &::placeholder { color: var(--color-text-muted); }
  }
}

.login-toggle-pass {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 0.82rem;
  padding: 2px;
  transition: color 0.18s;

  &:hover { color: var(--color-copper-glow); }
}

.login-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-copper);
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;

  &:hover:not(:disabled) {
    background: var(--color-copper-glow);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgb(184 115 51 / 30%);
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.admin-error {
  background: rgb(220 80 70 / 12%);
  border: 1px solid rgb(220 80 70 / 30%);
  color: #ff8b7e;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.login-footer {
  text-align: center;
  margin-top: 22px;
  font-size: 0.72rem;
  color: var(--color-text-muted);
}
.login-back-home {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 18px;
  font-family: var(--font-heading);
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 9px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  transition: all 0.18s;

  &:hover {
    color: var(--color-copper-glow);
    border-color: var(--color-copper-glow);
    background: rgb(255 255 255 / 4%);
  }
}
</style>