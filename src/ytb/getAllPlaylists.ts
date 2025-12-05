import { YTB_LIKED_LIST_ID, YTB_PLAYLIST_VISIBILITIES, YTB_WATCH_LATER_LIST_ID } from '../Constants.ts'
import type { Playlist } from './Playlist.ts'
import { sleep } from '../utils/sleep.ts'

// Since we are interacting with YouTube's internal API that can change at any time, we have to assume any fields can be removed at any time
type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T

type YtGetAllPlaylistResponse = {
    ajaxPromise: Promise<DeepPartial<{
        data: {
            contents: {
                twoColumnBrowseResultsRenderer: {
                    tabs: Array<{
                        tabRenderer: {
                            content: {
                                richGridRenderer: {
                                    contents: Array<{ // Each item is a playlist
                                        richItemRenderer: {
                                            content: {
                                                lockupViewModel: {
                                                    contentId: string // Playlist id
                                                    metadata: {
                                                        lockupMetadataViewModel: {
                                                            title: {
                                                                content: string // Playlist name
                                                            }
                                                            metadata: {
                                                                contentMetadataViewModel: {
                                                                    metadataRows: Array<{ // Need to flatten this array of array of items to single meta array
                                                                        metadataParts: Array<{
                                                                            text: {
                                                                                content: string // May contain playlist visibility
                                                                            }
                                                                        }>
                                                                    }>
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }>
                                }
                            }
                        }
                    }>
                }
            }
        }
    }>>
}

export async function getAllPlaylists() {
    try {
        console.groupCollapsed(__NAME__, 'getAllPlaylists')

        const ytdApp = document.querySelector('ytd-app')
        if (!ytdApp) {
            throw new Error('Failed to query ytd-app')
        }

        const returnValue = Array<YtGetAllPlaylistResponse>()
        ytdApp.dispatchEvent(new CustomEvent('yt-action', {
            detail: {
                actionName: 'yt-service-request',
                returnValue,
                args: [
                    {
                        data: {},
                    },
                    {
                        commandMetadata: {
                            webCommandMetadata: {
                                sendPost: true,
                                apiUrl: '/youtubei/v1/browse',
                            },
                        },
                        browseEndpoint: {
                            browseId: 'FEplaylist_aggregation',
                        },
                    },
                ],
                optionalAction: false,
            },
        }))

        // Busy wait for result
        for (let attempt = 0; attempt < 5; attempt++) {
            while (returnValue.length === 0) {
                await sleep(100)
            }
        }
        if (returnValue.length === 0) {
            throw new Error('Failed to get response from InnerTube (missing returnValue)')
        }

        console.info('returnValue', returnValue)

        const res = await returnValue.at(-1)?.ajaxPromise
        if (!res) {
            throw new Error('Failed to get response from InnerTube (missing ajaxPromise)')
        }

        const ytPlaylists = res.data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.at(0)?.tabRenderer?.content?.richGridRenderer?.contents
        if (!Array.isArray(ytPlaylists)) {
            throw new Error('Failed to get response from InnerTube (missing contents)')
        }

        const playlists = new Array<Playlist>()
        for (const ytPlaylist of ytPlaylists) {
            const playlistId = ytPlaylist?.richItemRenderer?.content?.lockupViewModel?.contentId
            if (!playlistId || playlistId === YTB_WATCH_LATER_LIST_ID || playlistId === YTB_LIKED_LIST_ID) {
                console.info(`Skipping id:${playlistId}`)
                continue
            }

            const playlistName = ytPlaylist?.richItemRenderer?.content?.lockupViewModel?.metadata?.lockupMetadataViewModel?.title?.content
            if (!playlistName) {
                console.info(`Skipping id:${playlistId} (missing playlistName)`)
                continue
            }

            const playlistMeta = new Set(ytPlaylist?.richItemRenderer?.content?.lockupViewModel?.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.flatMap((row) => row?.metadataParts?.map((part) => part?.text?.content)) ?? [])
            if (playlistMeta.intersection(YTB_PLAYLIST_VISIBILITIES).size === 0) {
                console.info(`Skipping id:${playlistId} (missing visibility)`)
                continue
            }

            playlists.push({
                name: playlistName,
                playlistId: playlistId,
            })

            console.info('Found', playlists.at(-1))
        }

        return playlists.toSorted((a, b) => a.name.localeCompare(b.name))
    } catch (err) {
        console.warn(err)
        return []
    } finally {
        console.groupEnd()
    }
}
