import { onMounted, onUnmounted, ref } from 'vue'
import { findDelayedElement } from '../../utils/findDelayedElement.ts'
import { tryDebounceAsync } from '../../utils/tryDebounce.ts'
import { getVideoId, type Video } from '../../ytb/Video.ts'
import { DATA_ATTR_VIDEO_ID, YTB_WATCH_LATER_LIST_ID } from '../../Constants.ts'
import { findDelayedElementAll } from '../../utils/findDelayedElementAll.ts'
import { addVideosToQueue } from '../../ytb/addVideosToQueue.ts'
import { editPlaylist } from '../../ytb/editPlaylist.ts'
import { usePlaylistPageStore } from '../../store/usePlaylistPageStore.ts'
import type { Playlist } from '../../ytb/Playlist.ts'

export function usePlaylistPageCheckboxes() {
    const playlistPageStore = usePlaylistPageStore()

    const toggleAll = async (enable: boolean) => {
        console.groupCollapsed('usePlaylistPageCheckboxes::toggleAll', enable)

        const videoRows = await findDelayedElementAll('#contents.ytd-playlist-video-list-renderer ytd-playlist-video-renderer')

        for (const videoRow of videoRows) {
            const checkbox = await findDelayedElement('input[type="checkbox"]', videoRow) as HTMLInputElement
            checkbox.checked = enable
            checkbox.dispatchEvent(new Event('change'))
        }

        console.groupEnd()
    }

    const moveAllToPlaylist = async (targetPlaylist: Playlist | null) => {
        try {
            console.groupCollapsed('usePlaylistPageCheckboxes::moveAllToPlaylist')

            if (!targetPlaylist) {
                throw new Error('Invalid targetPlaylist')
            }
            if (!playlistPageStore.currentPlaylist) {
                throw new Error('Invalid currentPlaylist')
            }
            if (playlistPageStore.currentPlaylist.playlistId === targetPlaylist.playlistId) {
                throw new Error(`Trying to move to same playlist "${playlistPageStore.currentPlaylist.name}"`)
            }

            const videos = await getAllCheckedVideos()
            if (!window.confirm(`Are you sure you wish to move ${videos.length} video(s) from ${playlistPageStore.currentPlaylist.name} to ${targetPlaylist.name}?`)) {
                return
            }

            editPlaylist(targetPlaylist.playlistId, true, videos)
            editPlaylist(playlistPageStore.currentPlaylist.playlistId, false, videos)

            for (const video of videos) {
                video.ytdPlaylistVideoRenderer.remove()
            }
        } catch (err) {
            alert(err)
        } finally {
            console.groupEnd()
        }
    }

    const removeAll = async () => {
        try {
            console.groupCollapsed('usePlaylistPageCheckboxes::removeAll')

            if (!playlistPageStore.currentPlaylist) {
                throw new Error('Invalid currentPlaylist')
            }

            const videos = await getAllCheckedVideos()
            if (!window.confirm(`Are you sure you wish to remove ${videos.length} video(s)?`)) {
                return
            }

            editPlaylist(playlistPageStore.currentPlaylist.playlistId, false, videos)

            for (const video of videos) {
                video.ytdPlaylistVideoRenderer.remove()
            }
        } catch (err) {
            console.warn(err)
        } finally {
            console.groupEnd()
        }
    }

    const addAllToQueue = async () => {
        try {
            console.groupCollapsed('usePlaylistPageCheckboxes::addAllToQueue')
            const videos = await getAllCheckedVideos()
            addVideosToQueue(videos)
        } catch (err) {
            console.warn(err)
        } finally {
            console.groupEnd()
        }
    }

    const addAllToWatchLater = async () => {
        try {
            console.groupCollapsed('usePlaylistPageCheckboxes::addAllToWatchLater')
            const videos = await getAllCheckedVideos()
            editPlaylist(YTB_WATCH_LATER_LIST_ID, true, videos)
        } catch (err) {
            console.warn(err)
        } finally {
            console.groupEnd()
        }
    }

    const numChecked = ref(0)
    const recountChecked = tryDebounceAsync('usePlaylistPageCheckboxes::recountChecked', async () => {
        numChecked.value = (await getAllCheckedVideos()).length
    })

    const update = tryDebounceAsync('usePlaylistPageCheckboxes::update', async () => {
        const videoRows = await findDelayedElementAll('#contents.ytd-playlist-video-list-renderer ytd-playlist-video-renderer')

        for (const videoRow of videoRows) {
            const href = videoRow.querySelector('a#thumbnail')?.getAttribute('href')
            const videoId = getVideoId(href ?? '')

            // The UI can reuse elements so we need to check if it exists already
            let checkbox: HTMLInputElement | null = videoRow.querySelector('label.bulk-action')
            if (!checkbox) {
                checkbox = document.createElement('input')
                checkbox.type = 'checkbox'
                checkbox.id = `bulk-action-checkbox-${videoId}`
                checkbox.addEventListener('change', recountChecked)

                const label = document.createElement('label')
                label.htmlFor = `bulk-action-checkbox-${videoId}`
                label.classList.add('bulk-action')
                label.append(checkbox)

                const menu = await findDelayedElement('#menu', videoRow)
                videoRow.insertBefore(label, menu)
            }

            checkbox.setAttribute(DATA_ATTR_VIDEO_ID, videoId)
        }

        await recountChecked()
    })

    const observer = new MutationObserver(update)
    const onNavigation = tryDebounceAsync('usePlaylistPageCheckboxes::onNavigation', async () => {
        const videoListContainer = await findDelayedElement('#contents.ytd-playlist-video-list-renderer')
        observer.disconnect()
        observer.observe(videoListContainer, {
            childList: true,
        })
        console.info('Observing', videoListContainer)
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
        numChecked,
        toggleAll,
        moveAllToPlaylist,
        removeAll,
        addAllToQueue,
        addAllToWatchLater,
    }
}

async function getAllCheckedVideos() {
    console.groupCollapsed('usePlaylistPageCheckboxes::getAllCheckedVideos')

    const videoRows = await findDelayedElementAll('#contents.ytd-playlist-video-list-renderer ytd-playlist-video-renderer')
    const videos = new Array<Video>()

    for (const videoRow of videoRows) {
        const checkbox = await findDelayedElement('input[type="checkbox"]', videoRow) as HTMLInputElement
        if (!checkbox.checked) {
            continue
        }

        const href = videoRow.querySelector('a#thumbnail')?.getAttribute('href')
        const videoId = getVideoId(href ?? '')

        videos.push({
            videoId,
            ytdPlaylistVideoRenderer: videoRow,
        })
    }

    console.groupEnd()
    return videos
}
