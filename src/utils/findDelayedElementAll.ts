import { MAX_UI_WAIT_ATTEMPTS, UI_WAIT_TIME } from '../Constants.ts'
import { sleep } from './sleep.ts'

export async function findDelayedElementAll(selector: string, parent?: HTMLElement): Promise<Array<HTMLElement>> {
    let target: NodeListOf<HTMLElement> | null = null
    const logTarget = (msg: string) => {
        console.groupCollapsed(__NAME__, `findDelayedElementAll("${selector}")`, msg)
        console.info(target)
        console.groupEnd()
    }

    for (let attempts = 0; attempts < MAX_UI_WAIT_ATTEMPTS; attempts++) {
        if (parent) {
            target = parent.querySelectorAll(selector)
        } else {
            target = document.querySelectorAll(selector)
        }

        if (target.length > 0) {
            logTarget('[FOUND]')
            break
        }

        // Exponential back off
        const delay = UI_WAIT_TIME * Math.pow(2, attempts)
        logTarget(`[Waiting ${delay}ms]`)
        await sleep(delay)
    }

    if (!target) {
        throw new Error(`findDelayedElementAll() failed to find "${selector}"`)
    }

    return [...target]
}
