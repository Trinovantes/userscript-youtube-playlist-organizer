import { computed } from 'vue'
import { useSettingStore } from '../../store/useSettingStore.ts'
import { usePlaylistPageStore } from '../../store/usePlaylistPageStore.ts'

export type DropZoneAction =
    | 'MOVE_TO_PLAYLIST'
    | 'ADD_WATCH_LATER'
    | 'ADD_QUEUE'
    | 'REMOVE'

type DropZone = {
    action: DropZoneAction
    label: string
    key: string
    htmlClass?: string
    url?: string
}

export function usePlaylistPageDropZones() {
    const settingStore = useSettingStore()
    const playlistPageStore = usePlaylistPageStore()

    const dropZones = computed<Array<DropZone>>(() => {
        const actionsZones: Array<DropZone> = [
            {
                action: 'REMOVE',
                label: 'Remove from List',
                key: 'remove-from-list',
                htmlClass: 'remove-from-list',
            },
            {
                action: 'ADD_QUEUE',
                label: 'Add to Queue',
                key: 'add-to-queue',
                htmlClass: 'add-to-queue',
            },
        ]

        if (!playlistPageStore.isWatchLaterPage) {
            actionsZones.push({
                action: 'ADD_WATCH_LATER',
                label: 'Add to Watch Later',
                key: 'add-to-watch-later',
                htmlClass: 'add-to-watch-later',
                url: 'https://www.youtube.com/playlist?list=WL',
            })
        }

        const playlistZones: Array<DropZone> = []
        for (const playlist of playlistPageStore.userPlaylists) {
            if (settingStore.hiddenPlaylists.includes(playlist.name)) {
                continue
            }

            playlistZones.push({
                action: 'MOVE_TO_PLAYLIST',
                label: playlist.name,
                key: playlist.playlistId,
                url: `https://www.youtube.com/playlist?list=${playlist.playlistId}`,
            })
        }

        return settingStore.showActionsAtTop
            ? [...actionsZones, ...playlistZones]
            : [...playlistZones, ...actionsZones]
    })

    return {
        dropZones,
    }
}
