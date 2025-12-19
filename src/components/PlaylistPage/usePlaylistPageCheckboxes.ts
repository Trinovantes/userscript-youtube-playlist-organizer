import { onMounted } from 'vue'
import { tryFnDebounceAsync } from '../../utils/tryFn.ts'
import { getVideoId } from '../../ytb/Video.ts'
import { DATA_ATTR_VIDEO_ID } from '../../Constants.ts'
import { findDelayedElementAll } from '../../utils/findDelayedElementAll.ts'
import { usePlaylistPageStore } from '../../store/usePlaylistPageStore.ts'
import { useObserver } from './useObserver.ts'

export function usePlaylistPageCheckboxes() {
    const playlistPageStore = usePlaylistPageStore()

    const update = tryFnDebounceAsync('usePlaylistPageCheckboxes::update', async () => {
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
                checkbox.addEventListener('change', () => {
                    void playlistPageStore.updateCheckedVideos()
                })

                const label = document.createElement('label')
                label.htmlFor = `bulk-action-checkbox-${videoId}`
                label.classList.add('bulk-action')
                label.append(checkbox)

                const menu = videoRow.querySelector('#menu')
                videoRow.insertBefore(label, menu)
            }

            checkbox.setAttribute(DATA_ATTR_VIDEO_ID, videoId)
            checkbox.checked = Boolean(playlistPageStore.checkedVideos.find((video) => video.videoId === videoId))
        }

        playlistPageStore.updateCheckedVideos()
    })

    onMounted(update)
    useObserver('#contents.ytd-playlist-video-list-renderer', {
        childList: true,
    }, () => {
        update()
    })
}
