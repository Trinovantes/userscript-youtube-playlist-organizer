import { findDelayedElement } from '../../utils/findDelayedElement.ts'
import { tryDebounce, tryDebounceAsync } from '../../utils/tryDebounce.ts'
import { onMounted, onUnmounted, ref } from 'vue'

export function useIsMiniPlayerVisible() {
    const isMiniPlayerVisible = ref(false)
    const update = tryDebounce('useIsMiniPlayerVisible::update', () => {
        const miniPlayer = document.querySelector('ytd-app ytd-miniplayer')
        isMiniPlayerVisible.value = miniPlayer?.classList.contains('ytdMiniplayerComponentVisible') ?? false
        console.info('isMiniPlayerVisible', isMiniPlayerVisible.value)
    })

    const observer = new MutationObserver(update)
    const onNavigation = tryDebounceAsync('useIsMiniPlayerVisible::onNavigation', async () => {
        const miniPlayer = await findDelayedElement('ytd-app ytd-miniplayer')
        observer.disconnect()
        observer.observe(miniPlayer, {
            attributes: true,
            attributeFilter: ['class'],
        })
        console.info('Observing', miniPlayer)
    })

    onMounted(() => {
        update()
        onNavigation()
        window.addEventListener('yt-navigate-finish', onNavigation)
    })
    onUnmounted(() => {
        window.removeEventListener('yt-navigate-finish', onNavigation)
        observer.disconnect()
    })

    return {
        isMiniPlayerVisible,
    }
}
