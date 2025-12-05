import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { useSettingStore } from './store/useSettingStore.ts'
import UserscriptApp from './components/UserscriptApp.vue'
import { usePlaylistPageStore } from './store/usePlaylistPageStore.ts'

export async function createVueApp() {
    const app = createApp(UserscriptApp)

    const pinia = createPinia()
    app.use(pinia)

    const settingStore = useSettingStore(pinia)
    await settingStore.load()

    const playlistPageStore = usePlaylistPageStore(pinia)
    await playlistPageStore.init()

    return app
}
