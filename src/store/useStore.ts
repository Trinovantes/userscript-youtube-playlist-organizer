import { defineStore } from 'pinia'
import type { Playlist } from './Playlist.ts'

const HYDRATION_KEY = '__INITIAL_STATE__'

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

type State = {
    dropZoneWidth: number
    clickDelay: number
    showActionsAtTop: boolean
    showNoPlaylistWarning: boolean
    hiddenPlaylists: Array<string>
    userPlaylists: Array<Playlist>
}

function createDefaultState(): State {
    const defaultState: State = {
        dropZoneWidth: 400,
        clickDelay: 100,
        showActionsAtTop: false,
        showNoPlaylistWarning: true,
        hiddenPlaylists: [],
        userPlaylists: [],
    }

    return defaultState
}

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export const useStore = defineStore('Store', {
    state: createDefaultState,

    actions: {
        async load() {
            try {
                const stateString = await GM.getValue(HYDRATION_KEY, '{}')
                const parsedState = JSON.parse(stateString) as Partial<State>

                this.$patch({
                    ...createDefaultState(),
                    ...parsedState,
                })

                console.info(__NAME__, 'LOAD', parsedState)
            } catch (err) {
                console.warn(__NAME__, err)
            }
        },

        async save() {
            try {
                const stateString = JSON.stringify(this.$state)
                await GM.setValue(HYDRATION_KEY, stateString)
                console.info(__NAME__, 'SAVE', JSON.parse(stateString))
            } catch (err) {
                console.warn(__NAME__, err)
            }
        },

        async addHiddenPlaylist(playlistName: string) {
            console.info(__NAME__, `addHiddenPlaylist "${playlistName}"`)

            this.hiddenPlaylists.unshift(playlistName)
            await this.save()
        },

        async removeHiddenPlaylist(idx: string) {
            console.info(__NAME__, `removeHiddenPlaylist idx:${idx}`)

            const i = parseInt(idx)
            if (isNaN(i) || i < 0 || i >= this.hiddenPlaylists.length) {
                throw new Error(`Invalid index (${idx})`)
            }

            this.hiddenPlaylists.splice(i, 1)
            await this.save()
        },
    },
})
