import { MAX_UI_WAIT_ATTEMPTS, UI_WAIT_TIME } from '../Constants.ts'
import { sleep } from './sleep.ts'

export async function findDelayedElement(selector: string, parent?: Element): Promise<HTMLElement> {
    let target: HTMLElement | null = null
    const logTarget = (msg: string) => {
        console.groupCollapsed(__NAME__, `findDelayedElement("${selector}")`, msg)
        console.info(target)
        console.groupEnd()
    }

    for (let attempts = 0; attempts < MAX_UI_WAIT_ATTEMPTS; attempts++) {
        if (parent) {
            target = parent.querySelector(selector)
        } else {
            target = document.querySelector(selector)
        }

        if (target) {
            logTarget('[FOUND]')
            break
        }

        // Exponential back off
        const delay = UI_WAIT_TIME * Math.pow(2, attempts)
        logTarget(`[Waiting ${delay}ms]`)
        await sleep(delay)
    }

    if (!target) {
        throw new Error(`findDelayedElement() failed to find "${selector}"`)
    }

    return target
}
