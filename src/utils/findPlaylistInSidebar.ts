import { LIKED_LIST_ID, WATCH_LATER_LIST_ID } from '@/Constants'
import { findDelayedElement } from '@/utils/findDelayedElement'
import { Playlist } from './determineCurrentPlaylist'
import { findDelayedElementAll } from './findDelayedElementAll'

export async function findPlaylistsInSidebar(): Promise<Array<Playlist>> {
    // Need to wait for YouTube to finish lazy loading
    const homeSection = await findDelayedElement('#contentContainer ytd-guide-section-renderer:nth-child(1)')
    const showMoreBtn = await findDelayedElement('ytd-guide-collapsible-entry-renderer #expander-item', homeSection)
    showMoreBtn.click()

    const playlistLinks = await findDelayedElementAll('ytd-guide-entry-renderer', homeSection)
    const playlists: Array<Playlist> = []

    for (const playlistLink of playlistLinks) {
        const name = playlistLink.querySelector('.title')?.textContent?.trim()
        if (!name) {
            continue
        }

        const href = playlistLink.querySelector('a#endpoint')?.getAttribute('href')
        if (!href) {
            continue
        }

        const youtubeId = /playlist\?list=([\w-]+)/.exec(href)?.[1]
        if (!youtubeId) {
            continue
        }

        // We can't modify Liked videos so we skip this list
        if (youtubeId === LIKED_LIST_ID) {
            continue
        }

        //  We have a special area for WL so we don't need this list
        if (youtubeId === WATCH_LATER_LIST_ID) {
            continue
        }

        playlists.push({ youtubeId, name })
    }

    return playlists.sort((a, b) => a.name.localeCompare(b.name))
}
