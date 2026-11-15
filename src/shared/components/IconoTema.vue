<script setup lang="ts">
withDefaults(
  defineProps<{
    tipo: 'tema' | 'paleta'
    oscuro?: boolean
    color?: string
    tam?: number
  }>(),
  {
    oscuro: false,
    color: 'currentColor',
    tam: 16,
  },
)
</script>

<template>
  <svg
    v-if="tipo === 'tema' && oscuro"
    :width="tam"
    :height="tam"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill="currentColor"
      fill-opacity="0.16"
    />
    <path d="M18 4v3M16.5 5.5h3" />
  </svg>
  <svg
    v-else-if="tipo === 'tema'"
    :width="tam"
    :height="tam"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="4"
      fill="currentColor"
      fill-opacity="0.18"
    />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
  <svg
    v-else
    :width="tam"
    :height="tam"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.9"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2a10 10 0 0 0 0 20c1.3 0 2-.9 2-2 0-.55-.2-1.05-.58-1.45-.38-.4-.58-.9-.58-1.45 0-1.1.9-2 2-2h2.25A4.9 4.9 0 0 0 22 10.2C22 5.65 17.52 2 12 2z" />
    <circle
      cx="7.2"
      cy="12.2"
      r="1.15"
      fill="currentColor"
      stroke="none"
    />
    <circle
      cx="9.8"
      cy="7.7"
      r="1.15"
      fill="currentColor"
      stroke="none"
    />
    <circle
      cx="14.7"
      cy="7.5"
      r="1.15"
      fill="currentColor"
      stroke="none"
    />
    <circle
      cx="17.3"
      cy="11.2"
      r="1.9"
      :fill="color || 'currentColor'"
      stroke="none"
    />
  </svg>
</template>
