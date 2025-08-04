import './assets/css/main.scss'
import { createVueApp } from './createVueApp'

async function main() {
    // Do not activate inside youtube's ad iframe
    if (window.self !== window.top) {
        return
    }

    // Do not activate on ytb music
    if (window.location.origin === 'https://music.youtube.com') {
        return
    }

    const node = document.createElement('div')
    node.id = DEFINE.NAME
    document.querySelector('body')?.appendChild(node)

    const app = await createVueApp()
    app.mount(node)
}

if (document.readyState !== 'loading') {
    main().catch((err: unknown) => {
        console.warn(DEFINE.NAME, err)
    })
} else {
    window.addEventListener('DOMContentLoaded', () => {
        main().catch((err: unknown) => {
            console.warn(DEFINE.NAME, err)
        })
    })
}
