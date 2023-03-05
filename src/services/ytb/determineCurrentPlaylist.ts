export type Playlist = {
    youtubeId: string
    name: string
}

export function determineCurrentPlaylist(): Playlist | null {
    const re = /youtube\.com\/playlist\?.*list=([\w]+)/
    const matches = re.exec(location.href)
    if (!matches) {
        return null
    }

    const youtubeId = matches[1]
    const name = $('ytd-page-manager ytd-playlist-header-renderer .metadata-wrapper > yt-dynamic-sizing-formatted-string yt-formatted-string').text().trim()
    console.info(DEFINE.NAME, 'determineCurrentPlaylist()', `youtubeId:"${youtubeId}" name:"${name}"`)

    if (!youtubeId || !name) {
        return null
    }

    return { youtubeId, name }
}
