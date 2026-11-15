import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import App from './App.vue'
import router from './router'
import './assets/scss/main.scss'
import { createPinia } from 'pinia'
import { initTheme } from './shared/composables/useTheme'

initTheme()

const app = createApp(App)
const head = createHead()
app.use(createPinia())
app.use(router)
app.use(head)
app.mount('#app')
