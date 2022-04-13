export interface Playlist {
    youtubeId: string
    name: string
}

export function determineCurrentPlaylist(): Playlist | null {
    const re = /youtube\.com\/playlist\?list=([\w]+)/
    const matches = re.exec(location.href)
    if (!matches) {
        return null
    }

    const youtubeId = matches[1]
    const name = $('h1#title a.yt-simple-endpoint').text().trim() || $('#title-form #text-displayed').text().trim()
    console.info(DEFINE.NAME, 'determineCurrentPlaylist()', `youtubeId:"${youtubeId}" name:"${name}"`)

    if (!youtubeId || !name) {
        return null
    }

    return { youtubeId, name }
}
