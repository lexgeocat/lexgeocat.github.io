<template>
  <div
    id="admin-app"
    data-theme="light"
  >
    <div
      v-if="loading"
      class="admin-boot"
    >
      <i
        aria-hidden="true"
        class="fa-solid fa-spinner fa-spin"
      />
    </div>
    <template v-else>
      <aside
        v-if="user"
        class="admin-sidebar"
      >
        <div class="admin-sidebar__header">
          <router-link
            to="/admin/servicios"
            class="admin-brand"
          >
            <span class="admin-brand__mark">Lex<span class="geo">Geo</span><span class="cat">Cat</span></span>
            <span class="admin-brand__sub">Panel administrativo</span>
          </router-link>
        </div>
        <nav class="admin-sidebar__nav">
          <router-link
            to="/admin/servicios"
            class="admin-nav-link"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-briefcase"
            />
            <span>Servicios</span>
          </router-link>
          <router-link
            to="/admin/cotizaciones"
            class="admin-nav-link"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-file-invoice"
            />
            <span>Cotizaciones</span>
          </router-link>
          <router-link
            to="/admin/factores"
            class="admin-nav-link"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-sliders"
            />
            <span>Factores</span>
          </router-link>
          <router-link
            to="/admin/normativa"
            class="admin-nav-link"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-gavel"
            />
            <span>Normativa</span>
          </router-link>
        </nav>
        <div class="admin-sidebar__footer">
          <a
            href="/"
            class="admin-btn admin-btn--outline admin-btn--sm"
            target="_blank"
            rel="noopener"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-arrow-up-right-from-square"
            />
            Ver sitio público
          </a>
          <div class="admin-sidebar__user">
            <i
              aria-hidden="true"
              class="fa-solid fa-circle-user"
            />
            <span class="admin-sidebar__email">{{ user.email }}</span>
          </div>
          <button
            class="admin-btn admin-btn--outline admin-btn--sm"
            @click="onSignOut"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-right-from-bracket"
            />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main
        class="admin-main"
        :class="{ 'admin-main--full': !user }"
      >
        <router-view />
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAdminAuth } from './composables/useAdminAuth'

const { user, loading, signOut } = useAdminAuth()
const router = useRouter()

async function onSignOut() {
  await signOut()
  router.push('/admin/login')
}
</script>

<style lang="scss">
#admin-app {
  display: flex;
  min-height: 100vh;
  font-family: var(--font-body);
  background: var(--bg2);
  color: var(--text);
}

.admin-boot {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 1.6rem;
  color: var(--copper);
}

.admin-sidebar {
  width: 250px;
  flex-shrink: 0;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  border-right: 1px solid var(--border);

  &__header {
    padding: 24px 20px;
    border-bottom: 1px solid rgb(255 255 255 / 8%);
  }

  &__nav {
    flex: 1;
    padding: 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__footer {
    padding: 16px 18px 20px;
    border-top: 1px solid rgb(255 255 255 / 8%);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text-secondary);
    font-size: 0.8rem;

    i {
      color: var(--copper2);
      font-size: 1rem;
    }
  }

  &__email {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.admin-brand {
  text-decoration: none;
  display: block;

  &__mark {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 800;
    color: #fff;

    .geo { color: var(--sapphire2); }
    .cat { color: var(--copper2); }
  }

  &__sub {
    display: block;
    margin-top: 2px;
    font-family: var(--font-heading);
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }
}

.admin-nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.18s;

  i {
    width: 16px;
    text-align: center;
    font-size: 0.85rem;
  }

  &:hover {
    background: rgb(255 255 255 / 6%);
    color: #fff;
  }

  &.router-link-active {
    background: var(--copper);
    color: #fff;
    box-shadow: var(--sh-copper);
  }
}

.admin-main {
  flex: 1;
  padding: 32px 36px 60px;
  overflow-y: auto;
  max-width: 1280px;

  &--full {
    max-width: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.admin-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r);
  box-shadow: var(--sh);
  padding: 24px;
  margin-bottom: 20px;
}

.admin-page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;

  h1 {
    font-family: var(--font-display);
    font-size: 1.7rem;
    font-weight: 400;
    color: var(--text);
    margin-bottom: 4px;
  }

  p {
    font-size: 0.85rem;
    color: var(--text2);
  }
}

.admin-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  background: var(--copper);
  color: #fff;

  &:hover { background: var(--copper2); transform: translateY(-1px); }
  &:active { transform: translateY(0); }

  &--sm { padding: 6px 12px; font-size: 0.75rem; }

  &--danger { background: #c0392b; }
  &--danger:hover { background: #d9483a; }

  &--outline {
    background: transparent;
    border-color: var(--border3);
    color: var(--text2);
  }
  &--outline:hover { border-color: var(--copper); color: var(--copper); background: var(--copper-lt); }

  &--ghost {
    background: transparent;
    color: var(--text2);
  }
  &--ghost:hover { color: var(--copper); }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
}

.admin-sidebar .admin-btn--outline {
  border-color: rgb(255 255 255 / 18%);
  color: var(--color-text-secondary);
}
.admin-sidebar .admin-btn--outline:hover {
  border-color: var(--copper2);
  color: #fff;
  background: rgb(255 255 255 / 6%);
}

.admin-table-wrap {
  overflow-x: auto;
  border-radius: var(--r);
  border: 1px solid var(--border);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
  min-width: 640px;

  th, td {
    text-align: left;
    padding: 11px 14px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }

  th {
    font-family: var(--font-heading);
    font-weight: 700;
    color: var(--text3);
    font-size: 0.66rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: var(--bg2);
  }

  tbody tr:hover td { background: var(--bg2); }
  tbody tr:last-child td { border-bottom: none; }
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  label {
    font-family: var(--font-heading);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text2);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  input, textarea, select {
    padding: 9px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.88rem;
    font-family: var(--font-body);
    color: var(--text);
    background: var(--bg2);
    text-transform: none;
    letter-spacing: normal;
    font-weight: 400;
    transition: all 0.18s;

    &:focus {
      outline: none;
      border-color: var(--copper);
      background: var(--card);
      box-shadow: var(--sh-copper);
    }
  }

  textarea { min-height: 90px; resize: vertical; }
}

.admin-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (width <= 720px) {
    grid-template-columns: 1fr;
  }
}

.admin-empty {
  text-align: center;
  color: var(--text3);
  padding: 48px 20px;
  font-size: 0.88rem;

  i { font-size: 1.6rem; display: block; margin-bottom: 10px; color: var(--border3); }
}

.admin-error {
  background: rgb(192 57 43 / 8%);
  border: 1px solid rgb(192 57 43 / 25%);
  color: #c0392b;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--color-bg-primary);
  color: #fff;
  padding: 12px 18px;
  border-radius: 8px;
  box-shadow: var(--sh2);
  font-size: 0.85rem;
  font-family: var(--font-heading);
  font-weight: 600;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  /* D. Slide-up + fade-in, fade-out antes del setTimeout. */
  animation: admin-toast-in 0.32s var(--ease-out) both;
  will-change: transform, opacity;

  i { color: var(--color-success); }
  &.error i { color: #ff6b5b; }
}

@keyframes admin-toast-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes admin-toast-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
}

.admin-toast.is-leaving {
  animation: admin-toast-out 0.28s var(--ease-out) both;
  pointer-events: none;
}

.admin-loading {
  text-align: center;
  padding: 48px;
  color: var(--text3);
  font-size: 1.4rem;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 9px;
  border-radius: 5px;

  &--on { background: rgb(34 197 94 / 12%); color: #16a34a; }
  &--off { background: rgb(150 150 150 / 14%); color: var(--text3); }
}

.admin-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(10 12 16 / 55%);
  backdrop-filter: blur(4px);
  z-index: 9000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  overflow-y: auto;
  /* C. Animación de entrada consistente con el modal público. */
  animation: admin-modal-overlay-in 0.22s var(--ease-out) both;
  will-change: opacity;
}

.admin-modal {
  width: 100%;
  max-width: 640px;
  background: var(--card);
  border-radius: var(--rl);
  box-shadow: var(--sh3);
  overflow: hidden;
  animation: admin-modal-in 0.26s var(--ease-out) both;
  will-change: transform, opacity;
}

@keyframes admin-modal-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes admin-modal-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.admin-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);

  h3 {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
  }
}

.admin-modal-body {
  padding: 22px;
  max-height: 70vh;
  overflow-y: auto;
}

.admin-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 18px;
  margin-top: 4px;
  border-top: 1px solid var(--border);
}

@media (width <= 880px) {
  .admin-sidebar {
    position: fixed;
    z-index: 500;
    transform: translateX(-100%);
    transition: transform 0.25s;
  }

  .admin-main { padding: 20px 16px 50px; }
}
.admin-page-head__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-btn--icon {
  padding: 9px 11px;
  position: relative;

  &[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--color-bg-primary);
    color: #fff;
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 500;
    text-transform: none;
    letter-spacing: normal;
    padding: 6px 10px;
    border-radius: 6px;
    white-space: nowrap;
    box-shadow: var(--sh2);
    z-index: 20;
    pointer-events: none;
  }

  &[data-tooltip]:hover::before {
    content: '';
    position: absolute;
    top: calc(100% + 3px);
    right: 12px;
    border: 5px solid transparent;
    border-bottom-color: var(--color-bg-primary);
    z-index: 20;
    pointer-events: none;
  }
}

/* ── Clases compartidas entre NormativaAdmin y ServiciosAdmin ──────────────── */

.admin-filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
  background: var(--bg2);
  color: var(--text);
}

.admin-count {
  font-size: 0.78rem;
  color: var(--text3);
  margin-left: auto;
  white-space: nowrap;
}

.admin-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: var(--copper);
  font-weight: 600;
}

.admin-link-btn {
  background: none;
  border: none;
  color: var(--copper);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.76rem;
  margin-left: 6px;
}

.admin-hint {
  font-size: 0.76rem;
  color: var(--text3);
  display: flex;
  align-items: center;
  gap: 6px;

  i { color: var(--copper); }
}

.admin-img-preview {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
  flex-shrink: 0;
  display: block;

  &--placeholder {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--copper-lt);
    border-radius: 8px;
    border: 1px solid var(--border);
    color: var(--copper);
    font-size: 1.2rem;
    flex-shrink: 0;
  }
}

.admin-img-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;

  &--error {
    border-color: #c0392b;
    background: rgb(192 57 43 / 5%);
  }
}

.admin-img-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

/* Modal pequeño (confirmación de borrado) */
.admin-modal--sm {
  max-width: 460px;
}

/* Barra de progreso indeterminada durante upload */
.admin-progress-bar {
  width: 100%;
  height: 4px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.admin-progress-bar__fill {
  height: 100%;
  width: 40%;
  background: var(--copper);
  border-radius: 4px;
  animation: admin-progress-indeterminate 1.4s ease-in-out infinite;
  will-change: transform;
}

@keyframes admin-progress-indeterminate {
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(130%); }
  100% { transform: translateX(300%); }
}
</style>