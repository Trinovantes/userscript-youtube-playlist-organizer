import { PLAYLIST_VISIBILITIES, playlistPathRe, WATCH_LATER_LIST_ID, LIKED_LIST_ID } from '../../Constants.ts'
import type { Playlist } from '../../store/Playlist.ts'
import { findDelayedElement } from '../../utils/findDelayedElement.ts'
import { findDelayedElementAll } from '../../utils/findDelayedElementAll.ts'

export async function findAllPlaylists(): Promise<Array<Playlist>> {
    console.groupCollapsed(__NAME__, 'findAllPlaylists')

    const playlistTiles = await findDelayedElementAll('#primary #contents ytd-rich-item-renderer')
    const foundPlaylists = new Array<Playlist>()
    console.info('playlistTiles', playlistTiles)

    for (const tile of playlistTiles) {
        try {
            const titleNode = await findDelayedElement('h3 span[role=text]', tile)
            const title = titleNode.textContent
            if (!title) {
                console.warn('Skipping because failed to find title', tile)
                continue
            }

            const metaNodes = await findDelayedElementAll('div.yt-content-metadata-view-model-wiz__metadata-row span[role=text]', tile)
            const visbility = metaNodes.at(0)?.textContent ?? ''
            if (!PLAYLIST_VISIBILITIES.includes(visbility)) {
                console.warn('Skipping because invalid visibility', tile)
                continue
            }

            const link = await findDelayedElement('a[href^="/playlist?list="]', tile)
            const href = link?.getAttribute('href') ?? ''
            const playlistId = playlistPathRe.exec(href)?.groups?.playlistId
            if (!playlistId) {
                console.warn('Skipping because failed to find playlistId', tile)
                continue
            }

            if (playlistId === WATCH_LATER_LIST_ID || playlistId === LIKED_LIST_ID) {
                continue
            }

            foundPlaylists.push({
                name: title,
                youtubeId: playlistId,
            })
        } catch (err) {
            console.warn(err)
        }
    }

    foundPlaylists.sort((a, b) => a.name.localeCompare(b.name))
    console.info('foundPlaylists', foundPlaylists)

    console.groupEnd()
    return foundPlaylists
}
