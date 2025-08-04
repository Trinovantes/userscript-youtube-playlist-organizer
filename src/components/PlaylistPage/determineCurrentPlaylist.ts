import { playlistPathRe } from '@/Constants'
import { Playlist } from '@/store/Playlist'

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
