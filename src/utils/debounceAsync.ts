import { UI_WAIT_TIME } from '@/Constants'
import debounce from 'lodash.debounce'

export function debounceAsync<T>(asyncFn: () => Promise<T>): ReturnType<typeof debounce> {
    return debounce(() => {
        asyncFn().catch((err: unknown) => {
            console.warn(err)
        })
    }, UI_WAIT_TIME)
}
