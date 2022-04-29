import { createApp } from 'vue'
import '@/assets/css/main.scss'
import UserscriptApp from '@/components/UserscriptApp.vue'

async function main() {
    await $.when($.ready)

    const appContainerId = DEFINE.NAME
    $('body').append(`<div id="${appContainerId}">`)

    const app = createApp(UserscriptApp)
    app.mount(`#${appContainerId}`)
}

main().catch((err) => {
    console.warn(DEFINE.NAME, err)
})
