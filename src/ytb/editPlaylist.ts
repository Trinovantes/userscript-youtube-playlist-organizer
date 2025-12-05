import type { Video } from './Video.ts'

export function editPlaylist(playlistId: string, add: boolean, videos: Array<Video>) {
    try {
        console.groupCollapsed(__NAME__, 'editPlaylist', `add:${add}`, `playlistId:${playlistId}`)
        console.info(videos.map((v) => v.videoId))

        const ytdApp = document.querySelector('ytd-app')
        if (!ytdApp) {
            throw new Error('Failed to query ytd-app')
        }

        ytdApp.dispatchEvent(new CustomEvent('yt-action', {
            detail: {
                actionName: 'yt-service-request',
                returnValue: [],
                args: [
                    {
                        data: {},
                    },
                    {
                        commandMetadata: {
                            webCommandMetadata: {
                                sendPost: true,
                                apiUrl: '/youtubei/v1/browse/edit_playlist',
                            },
                        },
                        playlistEditEndpoint: {
                            playlistId: playlistId,
                            actions: videos.map((v) => (
                                add
                                    ? {
                                        action: 'ACTION_ADD_VIDEO',
                                        addedVideoId: v.videoId,
                                    }
                                    : {
                                        action: 'ACTION_REMOVE_VIDEO_BY_VIDEO_ID',
                                        removedVideoId: v.videoId,
                                    }
                            )),
                        },
                    },
                ],
                optionalAction: false,
            },
        }))
    } catch (err) {
        console.warn(err)
    } finally {
        console.groupEnd()
    }
}
