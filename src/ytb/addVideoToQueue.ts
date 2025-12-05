import type { Video } from './Video.ts'

type YtbThumbnail = HTMLElement & {
    resolveCommand: (command: unknown) => void
}

export function addVideoToQueue(video: Video) {
    try {
        console.groupCollapsed(__NAME__, 'addVideoToQueue', video.videoId)
        console.info(video.ytdPlaylistVideoRenderer)

        const ytdThumbnail = video.ytdPlaylistVideoRenderer.querySelector('ytd-thumbnail#thumbnail') as YtbThumbnail | undefined
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
                                    videoIds: [video.videoId],
                                    params: 'CAQ%3D', // WTF is this ???
                                },
                            },
                            videoIds: [video.videoId],
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
