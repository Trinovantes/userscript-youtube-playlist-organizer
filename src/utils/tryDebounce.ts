import { UI_WAIT_TIME } from '../Constants.ts'
import debounce from 'lodash.debounce'

export function tryDebounce<T>(msg: string, syncFn: () => T): ReturnType<typeof debounce> {
    return debounce(() => {
        try {
            console.groupCollapsed(__NAME__, msg)
            syncFn()
        } catch (err: unknown) {
            console.warn(err)
        } finally {
            console.groupEnd()
        }
    }, UI_WAIT_TIME)
}

export function tryDebounceAsync<T>(msg: string, asyncFn: () => Promise<T>): ReturnType<typeof debounce> {
    return debounce(() => {
        console.groupCollapsed(__NAME__, msg)
        asyncFn()
            .catch((err: unknown) => {
                console.warn(err)
            }).finally(() => {
                console.groupEnd()
            })
    }, UI_WAIT_TIME)
}
