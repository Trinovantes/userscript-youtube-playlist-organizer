import { UI_WAIT_TIME } from '@/Constants'
import debounce from 'lodash.debounce'
import { onMounted, onUnmounted, ref } from 'vue'

export function useIsMiniPlayerVisible() {
    const isMiniPlayerVisible = ref(false)
    const update = debounce(() => {
        const miniPlayer = document.querySelector('ytd-app ytd-miniplayer #video-container #player-container')
        isMiniPlayerVisible.value = (miniPlayer?.children.length ?? 0) > 0

        console.groupCollapsed(DEFINE.NAME, 'useIsMiniPlayerVisible::update')
        console.info('isMiniPlayerVisible', isMiniPlayerVisible.value)
        console.groupEnd()
    })

    const onNavigation = debounce(() => {
        const miniPlayer = document.querySelector('ytd-app ytd-miniplayer #video-container #player-container')
        if (!miniPlayer) {
            return
        }

        observer?.disconnect()
        observer?.observe(miniPlayer, { childList: true })

        console.groupCollapsed(DEFINE.NAME, 'useIsMiniPlayerVisible::onNavigation')
        console.info('Observing', miniPlayer)
        console.groupEnd()
    }, UI_WAIT_TIME)

    const observer = new MutationObserver(update)
    onMounted(() => {
        onNavigation()
        update()
        window.addEventListener('yt-navigate-finish', onNavigation)
    })
    onUnmounted(() => {
        window.removeEventListener('yt-navigate-finish', onNavigation)
        observer?.disconnect()
    })

    return {
        isMiniPlayerVisible,
    }
}
