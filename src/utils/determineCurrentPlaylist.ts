export type Playlist = {
    youtubeId: string
    name: string
}

export function determineCurrentPlaylist(): Playlist | null {
    const youtubeId = /youtube\.com\/playlist\?.*list=([\w]+)/.exec(location.href)?.[1]
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
