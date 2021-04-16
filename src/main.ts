import UserscriptApp from '@/components/UserscriptApp.vue'
import { createApp } from 'vue'

async function main() {
    await $.when($.ready)

    const appContainerId = 'userscript-app'
    $('body').append(`<div id="${appContainerId}">`)

    const app = createApp(UserscriptApp)
    app.mount(`#${appContainerId}`)
}

main().catch((err) => {
    console.warn(DEFINE.NAME, err)
})
