import { UI_WAIT_TIME } from '../Constants.ts'
import debounce from 'lodash.debounce'

type NotPromiseReturn<T extends (...args: Array<never>) => unknown> = ReturnType<T> extends Promise<unknown> ? never : T

export function tryFn<T extends (...args: Array<never>) => unknown>(msg: string, syncFn: NotPromiseReturn<T>) {
    return (...args: Parameters<T>) => {
        try {
            console.groupCollapsed(__NAME__, msg)
            syncFn(...args)
        } catch (err: unknown) {
            console.warn(err)
        } finally {
            console.groupEnd()
        }
    }
}

export function tryFnAsync<T extends (...args: Array<never>) => Promise<unknown>>(msg: string, asyncFn: T) {
    return (...args: Parameters<T>) => {
        console.groupCollapsed(__NAME__, msg)
        asyncFn(...args)
            .catch((err: unknown) => {
                console.warn(err)
            }).finally(() => {
                console.groupEnd()
            })
    }
}

export function tryFnDebounce<T extends (...args: Array<never>) => unknown>(msg: string, syncFn: NotPromiseReturn<T>) {
    return debounce((...args: Parameters<T>) => {
        try {
            console.groupCollapsed(__NAME__, msg)
            syncFn(...args)
        } catch (err: unknown) {
            console.warn(err)
        } finally {
            console.groupEnd()
        }
    }, UI_WAIT_TIME)
}

export function tryFnDebounceAsync<T extends (...args: Array<never>) => Promise<unknown>>(msg: string, asyncFn: T) {
    return debounce((...args: Parameters<T>) => {
        console.groupCollapsed(__NAME__, msg)
        asyncFn(...args)
            .catch((err: unknown) => {
                console.warn(err)
            }).finally(() => {
                console.groupEnd()
            })
    }, UI_WAIT_TIME)
}
