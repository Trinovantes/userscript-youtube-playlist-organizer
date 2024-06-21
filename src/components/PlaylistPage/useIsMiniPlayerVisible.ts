import { tryDebounce } from '@/utils/tryDebounce'
import { onMounted, onUnmounted, ref } from 'vue'

export function useIsMiniPlayerVisible() {
    const isMiniPlayerVisible = ref(false)
    const update = tryDebounce(() => {
        const miniPlayer = document.querySelector('ytd-app ytd-miniplayer #video-container #player-container')
        isMiniPlayerVisible.value = (miniPlayer?.children.length ?? 0) > 0

        console.groupCollapsed(DEFINE.NAME, 'useIsMiniPlayerVisible::update')
        console.info('isMiniPlayerVisible', isMiniPlayerVisible.value)
        console.groupEnd()
    })

    const observer = new MutationObserver(update)
    const onNavigation = tryDebounce(() => {
        const miniPlayer = document.querySelector('ytd-app ytd-miniplayer #video-container #player-container')
        if (!miniPlayer) {
            return
        }

        observer?.disconnect()
        observer?.observe(miniPlayer, { childList: true })

        console.groupCollapsed(DEFINE.NAME, 'useIsMiniPlayerVisible::onNavigation')
        console.info('Observing', miniPlayer)
        console.groupEnd()
    })

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
