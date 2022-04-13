export function determineIsOnPlaylistPage(): boolean {
    const re = /youtube\.com\/playlist\?list=([\w]+)/
    const matches = re.exec(location.href)
    return !!matches
}
