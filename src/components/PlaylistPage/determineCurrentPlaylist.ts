import { playlistPathRe } from '@/Constants'
import { Playlist } from '@/store/Playlist'

export function determineCurrentPlaylist(): Playlist | null {
    const youtubeId = playlistPathRe.exec(location.href)?.groups?.playlistId
    if (!youtubeId) {
        return null
    }

    const name = document.querySelector('ytd-page-manager ytd-playlist-header-renderer .metadata-wrapper > yt-dynamic-sizing-formatted-string yt-formatted-string')?.textContent?.trim()
    if (!name) {
        return null
    }

    return {
        youtubeId,
        name,
    }
}
