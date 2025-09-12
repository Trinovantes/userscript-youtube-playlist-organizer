import { playlistPathRe } from '../../Constants.ts'
import type { Playlist } from '../../store/Playlist.ts'

export function determineCurrentPlaylist(): Playlist | null {
    const youtubeId = playlistPathRe.exec(location.href)?.groups?.playlistId
    if (!youtubeId) {
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
        youtubeId,
        name,
    }
}
