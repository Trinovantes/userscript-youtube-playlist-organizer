import { createPinia } from 'pinia'
import { createApp } from 'vue'
import '@/assets/css/main.scss'
import UserscriptApp from '@/components/UserscriptApp.vue'
import { useStore } from './store'

async function main() {
    await $.when($.ready)

    const appContainerId = DEFINE.NAME
    $('body').append(`<div id="${appContainerId}">`)

    const app = createApp(UserscriptApp)

    const pinia = createPinia()
    app.use(pinia)

    const store = useStore()
    await store.load()

    app.mount(`#${appContainerId}`)
}

main().catch((err) => {
    console.warn(DEFINE.NAME, err)
})
