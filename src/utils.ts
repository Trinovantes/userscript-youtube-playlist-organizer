import { MAX_UI_WAIT_ATTEMPTS, UI_WAIT_TIME } from '@/Constants'

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export async function waitDelayedPredicate(pred: () => boolean): Promise<void> {
    let attempts = 0
    while (attempts < MAX_UI_WAIT_ATTEMPTS) {
        // Exponential back off
        const delay = UI_WAIT_TIME * Math.pow(2, attempts)
        console.info(DEFINE.NAME, `Waiting ${delay}ms`)
        await sleep(delay)
        attempts += 1

        if (pred()) {
            return
        }
    }

    throw new Error('waitDelayedPredicate() reached max attempts')
}
