import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Playlist } from '../ytb/Playlist.ts'
import { tryFn, tryFnAsync, tryFnDebounce, tryFnDebounceAsync } from '../utils/tryFn.ts'
import { getCurrentPlaylist } from '../ytb/getCurrentPlaylist.ts'
import { getAllPlaylists } from '../ytb/getAllPlaylists.ts'
import { YTB_WATCH_LATER_LIST_ID } from '../Constants.ts'
import { findDelayedElementAll } from '../utils/findDelayedElementAll.ts'
import { getVideoId, type Video } from '../ytb/Video.ts'
import { editPlaylist } from '../ytb/editPlaylist.ts'
import { addVideosToQueue } from '../ytb/addVideosToQueue.ts'

export const usePlaylistPageStore = defineStore('PlaylistPageStore', () => {
    // ------------------------------------------------------------------------
    // MiniPlayer
    // ------------------------------------------------------------------------

    const isMiniPlayerVisible = ref(false)
    const updateMiniPlayer = tryFn('PlaylistPageStore::updateMiniPlayer', () => {
        const miniPlayer = document.querySelector('ytd-app ytd-miniplayer')
        isMiniPlayerVisible.value = miniPlayer?.classList.contains('ytdMiniplayerComponentVisible') ?? false
        console.info('isMiniPlayerVisible', isMiniPlayerVisible.value)
    })

    const miniPlayerObserver = new MutationObserver(updateMiniPlayer)
    const updateMiniPlayerObserver = tryFn('PlaylistPageStore::updateMiniPlayerObserver', () => {
        const miniPlayer = document.querySelector('ytd-app ytd-miniplayer')
        if (!miniPlayer) {
            console.warn('Failed to find miniPlayer')
            return
        }

        miniPlayerObserver.disconnect()
        miniPlayerObserver.observe(miniPlayer, {
            attributes: true,
            attributeFilter: ['class'],
        })
        console.info('Observing', miniPlayer)
    })

    // ------------------------------------------------------------------------
    // Playlist Page
    // ------------------------------------------------------------------------

    const currentPlaylist = ref<Playlist | null>(null)
    const isWatchLaterPage = computed(() => currentPlaylist.value?.playlistId === YTB_WATCH_LATER_LIST_ID)
    const updateCurrentPlaylist = tryFn('PlaylistPageStore::updateCurrentPlaylist', () => {
        currentPlaylist.value = getCurrentPlaylist()
        console.info('currentPlaylist', currentPlaylist.value)
    })

    // ------------------------------------------------------------------------
    // Playlist Page - Checkboxes
    // ------------------------------------------------------------------------

    const checkedVideos = ref<Array<Video>>([])
    const updateCheckedVideos = tryFnAsync('PlaylistPageStore::updateCheckedVideos', async () => {
        const videoRows = await findDelayedElementAll('#contents.ytd-playlist-video-list-renderer ytd-playlist-video-renderer')
        const videos = new Array<Video>()

        for (const videoRow of videoRows) {
            const checkbox = videoRow.querySelector<HTMLInputElement>('input[type="checkbox"]')
            if (!checkbox?.checked) {
                continue
            }

            const href = videoRow.querySelector('a#thumbnail')?.getAttribute('href')
            const videoId = getVideoId(href ?? '')

            videos.push({
                videoId,
                ytdPlaylistVideoRenderer: videoRow,
            })
        }

        checkedVideos.value = videos
    })

    const toggleAllVideos = tryFnDebounceAsync('PlaylistPageStore::toggleAllVideos', async (enable: boolean) => {
        const videoRows = await findDelayedElementAll('#contents.ytd-playlist-video-list-renderer ytd-playlist-video-renderer')

        for (const videoRow of videoRows) {
            const checkbox = videoRow.querySelector<HTMLInputElement>('input[type="checkbox"]')
            if (!checkbox) {
                continue
            }

            checkbox.checked = enable
            checkbox.dispatchEvent(new Event('change'))
        }
    })

    const moveAllCheckedVideosToPlaylist = tryFnDebounce('PlaylistPageStore::moveAllCheckedVideosToPlaylist', (targetPlaylist: Playlist | null) => {
        if (!targetPlaylist) {
            throw new Error('Invalid targetPlaylist')
        }
        if (!currentPlaylist.value) {
            throw new Error('Invalid currentPlaylist')
        }
        if (currentPlaylist.value.playlistId === targetPlaylist.playlistId) {
            throw new Error(`Trying to move to same playlist "${currentPlaylist.value.name}"`)
        }

        // Confirm destructive changes
        if (!window.confirm(`Are you sure you wish to move ${checkedVideos.value.length} video(s) from ${currentPlaylist.value.name} to ${targetPlaylist.name}?`)) {
            return
        }

        editPlaylist(targetPlaylist.playlistId, true, checkedVideos.value)
        editPlaylist(currentPlaylist.value.playlistId, false, checkedVideos.value)
        for (const video of checkedVideos.value) {
            video.ytdPlaylistVideoRenderer.remove()
        }

        updateCheckedVideos()
    })

    const removeAllCheckedVideos = tryFnDebounce('PlaylistPageStore::removeAllCheckedVideos', () => {
        if (!currentPlaylist.value) {
            throw new Error('Invalid currentPlaylist')
        }

        // Confirm destructive changes
        if (!window.confirm(`Are you sure you wish to remove ${checkedVideos.value.length} video(s)?`)) {
            return
        }

        editPlaylist(currentPlaylist.value.playlistId, false, checkedVideos.value)
        for (const video of checkedVideos.value) {
            video.ytdPlaylistVideoRenderer.remove()
        }

        updateCheckedVideos()
    })

    const addAllCheckedVideosToQueue = tryFnDebounce('PlaylistPageStore::addAllCheckedVideosToQueue', () => {
        addVideosToQueue(checkedVideos.value)
    })

    const addAllCheckedVideosToWatchLater = tryFnDebounce('PlaylistPageStore::addAllCheckedVideosToWatchLater', () => {
        editPlaylist(YTB_WATCH_LATER_LIST_ID, true, checkedVideos.value)
    })

    // ------------------------------------------------------------------------
    // Global
    // ------------------------------------------------------------------------

    const onNavigation = tryFnDebounce('PlaylistPageStore::onNavigation', () => {
        updateCurrentPlaylist()
        updateMiniPlayer()
        updateMiniPlayerObserver()
    })

    const userPlaylists = ref<Array<Playlist>>([])
    const init = async () => {
        userPlaylists.value = await getAllPlaylists()

        onNavigation()
        window.addEventListener('yt-navigate-finish', onNavigation)
    }

    return {
        init,
        userPlaylists,
        isMiniPlayerVisible,
        currentPlaylist,
        isWatchLaterPage,

        checkedVideos,
        updateCheckedVideos,
        toggleAllVideos,
        moveAllCheckedVideosToPlaylist,
        removeAllCheckedVideos,
        addAllCheckedVideosToQueue,
        addAllCheckedVideosToWatchLater,
    }
})
