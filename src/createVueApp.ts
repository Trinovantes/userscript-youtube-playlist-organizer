import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { useStore } from './store/useStore.ts'
import UserscriptApp from './components/UserscriptApp.vue'
import { getAllPlaylists } from './ytb/getAllPlaylists.ts'

export async function createVueApp() {
    const app = createApp(UserscriptApp)

    const pinia = createPinia()
    app.use(pinia)

    const store = useStore(pinia)
    await store.load()

    store.userPlaylists = await getAllPlaylists()
    await store.save()

    return app
}
