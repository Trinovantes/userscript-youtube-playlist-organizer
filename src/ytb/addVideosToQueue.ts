import type { Video } from './Video.ts'

type YtbThumbnail = HTMLElement & {
    resolveCommand: (command: unknown) => void
}

export function addVideosToQueue(videos: Array<Video>) {
    try {
        console.groupCollapsed(__NAME__, 'addVideosToQueue', videos.length)
        if (videos.length === 0) {
            return
        }

        const videoIds = videos.map((v) => v.videoId)
        console.info(videoIds)

        const ytdThumbnail = videos[0].ytdPlaylistVideoRenderer.querySelector('ytd-thumbnail#thumbnail') as YtbThumbnail | undefined
        if (!ytdThumbnail) {
            throw new Error('Failed to find thumbnail')
        }

        ytdThumbnail.resolveCommand({
            signalServiceEndpoint: {
                signal: 'CLIENT_SIGNAL',
                actions: [
                    {
                        addToPlaylistCommand: {
                            openMiniplayer: true,
                            listType: 'PLAYLIST_EDIT_LIST_TYPE_QUEUE',
                            onCreateListCommand: {
                                createPlaylistServiceEndpoint: {
                                    videoIds: videoIds,
                                    params: 'CAQ%3D', // WTF is this ???
                                },
                            },
                            videoIds: videoIds,
                        },
                    },
                ],
            },
        })
    } catch (err) {
        console.warn(err)
    } finally {
        console.groupEnd()
    }
}
