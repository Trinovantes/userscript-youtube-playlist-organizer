import { defineStore } from 'pinia'

const HYDRATION_KEY = '__INITIAL_STATE__'

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

type SettingState = {
    dropZoneWidth: number
    showActionsAtTop: boolean
    hiddenPlaylists: Array<string>
}

function createDefaultState(): SettingState {
    const defaultState: SettingState = {
        dropZoneWidth: 400,
        showActionsAtTop: false,
        hiddenPlaylists: [],
    }

    return defaultState
}

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export const useSettingStore = defineStore('SettingStore', {
    state: createDefaultState,

    actions: {
        async load() {
            try {
                const stateString = await GM.getValue(HYDRATION_KEY, '{}')
                const parsedState = JSON.parse(stateString) as Partial<SettingState>

                this.$patch({
                    ...createDefaultState(),
                    ...parsedState,
                })

                console.info(__NAME__, 'SettingStore::LOAD', parsedState)
            } catch (err) {
                console.warn(__NAME__, err)
            }
        },

        async save() {
            try {
                const stateString = JSON.stringify(this.$state)
                await GM.setValue(HYDRATION_KEY, stateString)
                console.info(__NAME__, 'SettingStore::SAVE', JSON.parse(stateString))
            } catch (err) {
                console.warn(__NAME__, err)
            }
        },

        async addHiddenPlaylist(playlistName: string) {
            console.info(__NAME__, `SettingStore::addHiddenPlaylist "${playlistName}"`)

            this.hiddenPlaylists.unshift(playlistName)
            await this.save()
        },

        async removeHiddenPlaylist(idx: string) {
            console.info(__NAME__, `SettingStore::removeHiddenPlaylist idx:${idx}`)

            const i = parseInt(idx)
            if (isNaN(i) || i < 0 || i >= this.hiddenPlaylists.length) {
                throw new Error(`Invalid index (${idx})`)
            }

            this.hiddenPlaylists.splice(i, 1)
            await this.save()
        },
    },
})
