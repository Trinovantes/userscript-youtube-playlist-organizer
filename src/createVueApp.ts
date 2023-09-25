import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { useStore } from './store/useStore'
import UserscriptApp from './components/UserscriptApp.vue'

export async function createVueApp() {
    const app = createApp(UserscriptApp)

    const pinia = createPinia()
    app.use(pinia)

    const store = useStore()
    await store.load()

    return app
}
