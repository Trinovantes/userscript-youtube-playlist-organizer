import type { Video } from './Video.ts'

export function addVideosToQueue(videos: Array<Video>) {
    try {
        console.groupCollapsed(__NAME__, 'addVideosToQueue', videos.length)
        if (videos.length === 0) {
            return
        }

        const videoIds = videos.map((v) => v.videoId)
        console.info(videoIds)

        const ytdApp = document.querySelector('ytd-app')
        if (!ytdApp) {
            throw new Error('Failed to get ytdApp')
        }

        const command = {
            addToPlaylistCommand: {
                openMiniplayer: true,
                listType: 'PLAYLIST_EDIT_LIST_TYPE_QUEUE',
                onCreateListCommand: {
                    commandMetadata: {
                        webCommandMetadata: {
                            sendPost: true,
                            apiUrl: '/youtubei/v1/playlist/create',
                        },
                    },
                    createPlaylistServiceEndpoint: {
                        videoIds: videoIds,
                        params: 'CAQ%3D', // WTF is this ???
                    },
                },
                videoId: videoIds[0],
                videoIds: videoIds,
                videoCommand: {
                    commandMetadata: {
                        webCommandMetadata: {
                            url: `/watch?v=${videoIds[0]}`,
                            webPageType: 'WEB_PAGE_TYPE_WATCH',
                            rootVe: 3832, // WTF is this ???
                        },
                    },
                    watchEndpoint: {
                        videoId: videoIds[0],
                    },
                },
            },
        }

        ytdApp.dispatchEvent(new CustomEvent('yt-action', {
            bubbles: true,
            composed: true,
            detail: {
                actionName: 'yt-add-to-playlist-command',
                optionalAction: true,
                args: [
                    command,
                    ytdApp,
                ],
            },
        }))
    } catch (err) {
        console.warn(err)
    } finally {
        console.groupEnd()
    }
}
