export type Video = {
    videoId: string
    ytdPlaylistVideoRenderer: Element
}

export function getVideoId(url: string): string {
    const videoId = /\/watch\?v=(?<videoId>[\w-]+)&?/.exec(url)?.groups?.videoId
    if (!videoId) {
        throw new Error(`Failed to get videoId from "${url}"`)
    }

    return videoId
}
