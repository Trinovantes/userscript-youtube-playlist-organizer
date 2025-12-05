import { DRAG_EVENT_DATA_KEY_VIDEO_ID, YTB_WATCH_LATER_LIST_ID } from '../../Constants.ts'
import type { Playlist } from '../../ytb/Playlist.ts'
import { addVideoToQueue } from '../../ytb/addVideoToQueue.ts'
import { editPlaylist } from '../../ytb/editPlaylist.ts'
import type { DropZoneAction } from './useDropZones.ts'

export function triggerDropZoneAction(event: DragEvent, action: DropZoneAction, currentPlaylist: Playlist | null, targetPlaylist: Playlist | null) {
    try {
        console.groupCollapsed(__NAME__, `onDrop:${action}`)
        console.info('currentPlaylist', currentPlaylist)
        console.info('targetPlaylist', targetPlaylist)

        if (!currentPlaylist) {
            throw new Error('Invalid currentPlaylist')
        }
        if (!targetPlaylist) {
            throw new Error('Invalid targetPlaylist')
        }

        const videoId = event.dataTransfer?.getData(DRAG_EVENT_DATA_KEY_VIDEO_ID)
        if (!videoId) {
            throw new Error('Invalid videoId')
        }

        const ytdPlaylistVideoRenderer = document.querySelector(`ytd-playlist-video-renderer[data-video-id="${videoId}"]`)
        if (!ytdPlaylistVideoRenderer) {
            throw new Error('Invalid ytdPlaylistVideoRenderer')
        }

        switch (action) {
            case 'MOVE_TO_PLAYLIST': {
                if (currentPlaylist.playlistId === targetPlaylist.playlistId) {
                    throw new Error(`Trying to add to same playlist "${currentPlaylist.name}"`)
                }

                editPlaylist(targetPlaylist.playlistId, true, [{ ytdPlaylistVideoRenderer, videoId }])
                editPlaylist(currentPlaylist.playlistId, false, [{ ytdPlaylistVideoRenderer, videoId }])
                ytdPlaylistVideoRenderer.remove()
                break
            }

            case 'ADD_WATCH_LATER': {
                editPlaylist(YTB_WATCH_LATER_LIST_ID, true, [{ ytdPlaylistVideoRenderer, videoId }])
                break
            }

            case 'ADD_QUEUE': {
                addVideoToQueue({ ytdPlaylistVideoRenderer, videoId })
                break
            }

            case 'REMOVE': {
                editPlaylist(currentPlaylist.playlistId, false, [{ ytdPlaylistVideoRenderer, videoId }])
                ytdPlaylistVideoRenderer.remove()
                break
            }
        }
    } catch (err) {
        console.warn(err)
    } finally {
        console.groupEnd()
    }
}
