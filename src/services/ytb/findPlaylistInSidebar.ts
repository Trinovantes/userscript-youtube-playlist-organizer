import { LIKED_LIST_ID } from '@/Constants'
import { findDelayedElement } from '@/utils/findDelayedElement'
import { Playlist } from './determineCurrentPlaylist'

export async function findPlaylistsInSidebar(): Promise<Array<Playlist>> {
    // Need to wait for YouTube to finish lazy loading
    const $homeSection = await findDelayedElement('#contentContainer ytd-guide-section-renderer:nth-child(1)')
    if (!$homeSection.length) {
        throw new Error('Cannot find playlist container')
    }

    const $showMoreBtn = $homeSection.find('ytd-guide-collapsible-entry-renderer #expander-item')
    $showMoreBtn.trigger('click')

    const $playlistLinks = await findDelayedElement('#expandable-items > ytd-guide-entry-renderer', $homeSection)
    if (!$playlistLinks.length) {
        throw new Error('Cannot find playlists inside container')
    }

    const playlists: Array<Playlist> = []

    for (const playlistLink of $playlistLinks) {
        const name = $(playlistLink).text().trim()
        const href = $(playlistLink).find('a#endpoint').attr('href')

        // Skip playlists that failed to parse
        if (!name || !href) {
            continue
        }

        const matches = /playlist\?list=([\w]+)/.exec(href)
        if (!matches) {
            continue
        }

        const youtubeId = matches[1]

        // We can't modify Liked videos so we skip this list
        if (youtubeId.startsWith(LIKED_LIST_ID)) {
            continue
        }

        playlists.push({ youtubeId, name })
    }

    return playlists.sort((a, b) => {
        return a.name.localeCompare(b.name)
    })
}
