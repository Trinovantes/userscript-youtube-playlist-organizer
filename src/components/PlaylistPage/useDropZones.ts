import { WATCH_LATER_LIST_ID } from '../../Constants.ts'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { determineCurrentPlaylist } from './determineCurrentPlaylist.ts'
import type { ActionType } from './triggerAction.ts'
import { useStore } from '../../store/useStore.ts'
import type { Playlist } from '../../store/Playlist.ts'
import { tryDebounce } from '../../utils/tryDebounce.ts'

type DropZone = {
    key: string
    class?: string
    url?: string
    label: string
    action: ActionType
}

export function useDropZones() {
    const store = useStore()
    const playlists = computed(() => store.userPlaylists)

    const currentPlaylist = ref<Playlist | null>(null)
    const isOnWatchLater = computed(() => currentPlaylist.value?.youtubeId === WATCH_LATER_LIST_ID)

    const hasUpdatedOnce = ref(false)
    const onNavigation = tryDebounce(() => {
        currentPlaylist.value = determineCurrentPlaylist()

        console.groupCollapsed(__NAME__, 'useDropZones::onNavigation')
        console.info('playlists', [...playlists.value])
        console.info('currentPlaylist', { ...currentPlaylist.value })
        console.groupEnd()

        hasUpdatedOnce.value = true
    })

    onMounted(() => {
        onNavigation()
        window.addEventListener('yt-navigate-finish', onNavigation)
    })
    onUnmounted(() => {
        window.removeEventListener('yt-navigate-finish', onNavigation)
    })

    const showActionsAtTop = computed(() => store.showActionsAtTop)
    const dropZones = computed<Array<DropZone>>(() => {
        const actionsZones: Array<DropZone> = [
            {
                key: 'remove-from-list',
                class: 'remove-from-list',
                label: 'Remove from List',
                action: 'REMOVE',
            },
            {
                key: 'add-to-queue',
                class: 'add-to-queue',
                label: 'Add to Queue',
                action: 'ADD_QUEUE',
            },
        ]

        if (!isOnWatchLater.value) {
            actionsZones.push({
                key: 'add-to-watch-later',
                class: 'add-to-watch-later',
                label: 'Add to Watch Later',
                url: 'https://www.youtube.com/playlist?list=WL',
                action: 'ADD_WATCH_LATER',
            })
        }

        const playlistZones: Array<DropZone> = []
        for (const playlist of playlists.value) {
            if (store.hiddenPlaylists.includes(playlist.name)) {
                continue
            }

            playlistZones.push({
                key: playlist.youtubeId,
                label: playlist.name,
                url: `https://www.youtube.com/playlist?list=${playlist.youtubeId}`,
                action: 'ADD_PLAYLIST',
            })
        }

        return showActionsAtTop.value
            ? [...actionsZones, ...playlistZones]
            : [...playlistZones, ...actionsZones]
    })

    return {
        playlists,
        currentPlaylist,
        isOnWatchLater,
        hasUpdatedOnce,
        dropZones,
    }
}
