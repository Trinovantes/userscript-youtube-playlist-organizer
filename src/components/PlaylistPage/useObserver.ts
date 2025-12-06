import { onMounted, onUnmounted } from 'vue'
import { findDelayedElement } from '../../utils/findDelayedElement.ts'

export function useObserver(selector: string, opts: MutationObserverInit, onMutation: MutationCallback) {
    const observer = new MutationObserver(onMutation)

    onMounted(async () => {
        const node = await findDelayedElement(selector)
        observer.observe(node, {
            childList: true,
        })
    })

    onUnmounted(() => {
        observer.disconnect()
    })
}
