import { tryDebounce } from '../../utils/tryDebounce.ts'
import { onMounted, onUnmounted, ref } from 'vue'

export function useIsMiniPlayerVisible() {
    const isMiniPlayerVisible = ref(false)
    const update = tryDebounce(() => {
        const miniPlayer = document.querySelector('ytd-app ytd-miniplayer')
        isMiniPlayerVisible.value = miniPlayer?.classList.contains('ytdMiniplayerComponentVisible') ?? false

        console.groupCollapsed(__NAME__, 'useIsMiniPlayerVisible::update')
        console.info('isMiniPlayerVisible', isMiniPlayerVisible.value)
        console.groupEnd()
    })

    const observer = new MutationObserver(update)
    const onNavigation = tryDebounce(() => {
        const miniPlayer = document.querySelector('ytd-app ytd-miniplayer')
        if (!miniPlayer) {
            return
        }

        observer?.disconnect()
        observer?.observe(miniPlayer, {
            attributes: true,
            attributeFilter: ['class'],
        })

        console.groupCollapsed(__NAME__, 'useIsMiniPlayerVisible::onNavigation')
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
