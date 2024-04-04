import { WATCH_LATER_LIST_ID } from '@/Constants'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Playlist, determineCurrentPlaylist } from './determineCurrentPlaylist'
import { ActionType } from './triggerAction'
import { useStore } from '@/store/useStore'
import { findPlaylistsInSidebar } from './findPlaylistInSidebar'
import { debounceAsync } from './debounceAsync'

type DropZone = {
    key: string
    class?: string
    label: string
    action: ActionType
}

export function useDropZones() {
    const playlists = ref<Array<Playlist>>([])
    const currentPlaylist = ref<Playlist | null>(null)
    const isOnWatchLater = computed(() => currentPlaylist.value?.youtubeId === WATCH_LATER_LIST_ID)

    const hasUpdatedOnce = ref(false)
    const onNavigation = debounceAsync(async() => {
        playlists.value = await findPlaylistsInSidebar()
        currentPlaylist.value = determineCurrentPlaylist()
        hasUpdatedOnce.value = true

        console.groupCollapsed(DEFINE.NAME, 'useDropZones::onNavigation')
        console.info('playlists', [...playlists.value])
        console.info('currentPlaylist', { ...currentPlaylist.value })
        console.groupEnd()
    })

    onMounted(() => {
        onNavigation()
        window.addEventListener('yt-navigate-finish', onNavigation)
    })
    onUnmounted(() => {
        window.removeEventListener('yt-navigate-finish', onNavigation)
    })

    const store = useStore()
    const showActionsAtTop = computed(() => store.showActionsAtTop)
    const dropZones = computed<Array<DropZone>>(() => {
        const actionsZones: Array<DropZone> = [
            {
                key: 'remove-from-list',
                class: 'remove-from-list',
                label: 'Remove from List',
                action: ActionType.REMOVE,
            },
            {
                key: 'add-to-queue',
                class: 'add-to-queue',
                label: 'Add to Queue',
                action: ActionType.ADD_QUEUE,
            },
        ]

        if (!isOnWatchLater.value) {
            actionsZones.push({
                key: 'add-to-watch-later',
                class: 'add-to-watch-later',
                label: 'Add to Watch Later',
                action: ActionType.ADD_WATCH_LATER,
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
                action: ActionType.ADD_PLAYLIST,
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
