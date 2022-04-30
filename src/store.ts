import { defineStore } from 'pinia'

const HYDRATION_KEY = '__INITIAL_STATE__'

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

interface State {
    showActionsAtTop: boolean
}

function createDefaultState(): State {
    const defaultState: State = {
        showActionsAtTop: false,
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
                const stateString = await GM.getValue(HYDRATION_KEY, '{}') || '{}'
                const parsedState = JSON.parse(stateString) as State

                this.$patch({
                    ...createDefaultState(),
                    ...parsedState,
                })

                console.info(DEFINE.NAME, 'LOAD', parsedState)
            } catch (err) {
                console.warn(DEFINE.NAME, err)
            }
        },

        async save() {
            try {
                const stateString = JSON.stringify(this.$state)
                await GM.setValue(HYDRATION_KEY, stateString)
                console.info(DEFINE.NAME, 'SAVE', `'${stateString}'`)
            } catch (err) {
                console.warn(DEFINE.NAME, err)
            }
        },
    },
})
