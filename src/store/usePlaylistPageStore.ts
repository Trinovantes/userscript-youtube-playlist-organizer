import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Playlist } from '../ytb/Playlist.ts'
import { tryDebounce } from '../utils/tryDebounce.ts'
import { getCurrentPlaylist } from '../ytb/getCurrentPlaylist.ts'
import { getAllPlaylists } from '../ytb/getAllPlaylists.ts'
import { YTB_WATCH_LATER_LIST_ID } from '../Constants.ts'

export const usePlaylistPageStore = defineStore('PlaylistPageStore', () => {
    const userPlaylists = ref<Array<Playlist>>([])
    const currentPlaylist = ref<Playlist | null>(null)
    const isWatchLaterPage = computed(() => currentPlaylist.value?.playlistId === YTB_WATCH_LATER_LIST_ID)

    const onNavigation = tryDebounce('PlaylistPageStore::onNavigation', () => {
        currentPlaylist.value = getCurrentPlaylist()
        console.info('currentPlaylist', currentPlaylist.value)
    })

    const init = async () => {
        userPlaylists.value = await getAllPlaylists()
        onNavigation()
        window.addEventListener('yt-navigate-finish', onNavigation)
    }

    return {
        init,
        userPlaylists,
        currentPlaylist,
        isWatchLaterPage,
    }
})
