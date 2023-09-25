import { UI_WAIT_TIME } from '@/Constants'
import debounce from 'lodash.debounce'
import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useIsOnPlaylistPage() {
    const isOnPlaylistPage = ref(false)
    const onNavigation = debounce(() => {
        isOnPlaylistPage.value = /youtube\.com\/playlist\?.*list=([\w]+)/.test(location.href)

        console.groupCollapsed(DEFINE.NAME, 'useIsOnPlaylistPage::onNavigation')
        console.info('isOnPlaylistPage', isOnPlaylistPage.value)
        console.groupEnd()
    }, UI_WAIT_TIME)

    onMounted(() => {
        onNavigation()
        window.addEventListener('yt-navigate-finish', onNavigation)
    })
    onBeforeUnmount(() => {
        window.removeEventListener('yt-navigate-finish', onNavigation)
    })

    return {
        isOnPlaylistPage,
    }
}
