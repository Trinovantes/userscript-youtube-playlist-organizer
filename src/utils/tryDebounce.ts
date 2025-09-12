import { UI_WAIT_TIME } from '../Constants.ts'
import debounce from 'lodash.debounce'

export function tryDebounce<T>(syncFn: () => T): ReturnType<typeof debounce> {
    return debounce(() => {
        try {
            syncFn()
        } catch (err: unknown) {
            console.warn(err)
        }
    }, UI_WAIT_TIME)
}

export function tryDebounceAsync<T>(asyncFn: () => Promise<T>): ReturnType<typeof debounce> {
    return debounce(() => {
        asyncFn().catch((err: unknown) => {
            console.warn(err)
        })
    }, UI_WAIT_TIME)
}
