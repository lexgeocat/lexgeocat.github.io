<template>
  <div
    id="admin-app"
    data-theme="light"
  >
    <aside
      v-if="user"
      class="admin-sidebar"
    >
      <div class="admin-sidebar__header">
        <h2>Admin</h2>
      </div>
      <nav class="admin-sidebar__nav">
        <router-link
          to="/admin/dashboard"
          class="admin-nav-link"
        >
          Dashboard
        </router-link>
        <router-link
          to="/admin/servicios"
          class="admin-nav-link"
        >
          Servicios
        </router-link>
        <router-link
          to="/admin/cotizaciones"
          class="admin-nav-link"
        >
          Cotizaciones
        </router-link>
        <router-link
          to="/admin/factores"
          class="admin-nav-link"
        >
          Factores
        </router-link>
        <router-link
          to="/admin/normativa"
          class="admin-nav-link"
        >
          Normativa
        </router-link>
      </nav>
      <div class="admin-sidebar__footer">
        <span class="admin-sidebar__email">{{ user.email }}</span>
        <button
          class="admin-btn admin-btn--sm"
          @click="signOut"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAdminAuth } from './composables/useAdminAuth'

const { user, signOut } = useAdminAuth()
</script>

<style lang="scss">
#admin-app {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  background: #f5f5f5;
}

.admin-sidebar {
  width: 240px;
  background: var(--copper);
  color: #fff;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;

  &__header {
    padding: 1.25rem;
    border-bottom: 1px solid rgba(255,255,255,.15);

    h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
  }

  &__nav {
    flex: 1;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__footer {
    padding: 1rem 1.25rem;
    border-top: 1px solid rgba(255,255,255,.15);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__email {
    font-size: 0.8rem;
    opacity: 0.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.admin-nav-link {
  color: rgba(255,255,255,.75);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background .15s, color .15s;

  &:hover { background: rgba(255,255,255,.1); color: #fff; }
  &.router-link-active { background: rgba(255,255,255,.2); color: #fff; font-weight: 500; }
}

.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  max-width: 1200px;
}

.admin-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.admin-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s;
  background: var(--copper);
  color: #fff;

  &:hover { filter: brightness(1.1); }
  &--sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
  &--danger { background: #dc2626; }
  &--outline { background: transparent; border: 1px solid var(--copper); color: var(--copper); }
  &--outline-danger { background: transparent; border: 1px solid #dc2626; color: #dc2626; }
  &:disabled { opacity: 0.5; cursor: not-allowed; filter: none; }
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  th, td {
    text-align: left;
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid #eee;
  }

  th {
    font-weight: 600;
    color: #666;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  tr:hover td { background: #f9f9f9; }
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 480px;

  label {
    font-size: 0.85rem;
    font-weight: 500;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  input, textarea, select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: inherit;

    &:focus { outline: none; border-color: var(--copper); box-shadow: 0 0 0 2px color-mix(in srgb, var(--copper) 30%, transparent); }
  }

  textarea { min-height: 80px; resize: vertical; }
}

.admin-empty {
  text-align: center;
  color: #999;
  padding: 2rem;
  font-size: 0.9rem;
}

.admin-error {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.admin-loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}
</style>
