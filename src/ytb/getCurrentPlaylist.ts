import type { Playlist } from './Playlist.ts'

export function getCurrentPlaylist(): Playlist | null {
    const playlistId = /\/playlist\?.*list=(?<playlistId>[\w-]+)/.exec(location.href)?.groups?.playlistId
    if (!playlistId) {
        console.warn('Failed to determineCurrentPlaylist (invalid url)', location.href)
        return null
    }

    const titleTag = document.querySelector('title')
    const fullTitle = titleTag?.textContent
    const name = fullTitle?.replace(/- YouTube$/, '').trim()
    if (!name) {
        console.warn('Failed to determineCurrentPlaylist (invalid titleTag)', titleTag)
        return null
    }

    return {
        playlistId,
        name,
    }
}
