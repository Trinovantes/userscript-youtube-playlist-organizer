import { DRAG_EV_DATA_ATTR, DRAG_EV_TRANSFER_KEY } from '../../Constants.ts'
import { onUnmounted, onMounted } from 'vue'
import { findDelayedElement } from '../../utils/findDelayedElement.ts'
import { tryDebounceAsync } from '../../utils/tryDebounce.ts'

// Give each video row a globally unique id
let videoCounter = 0

// Need to keep reference to original handlers in order to properly unregister them
type DragHandler = (ev: Event) => void
type ElementListenersMap = Map<number, DragHandler>
const listeners = new Map<string, ElementListenersMap>()

export function useRegisterPlaylistVideosListeners() {
    const update = tryDebounceAsync(async () => {
        console.groupCollapsed(__NAME__, 'useRegisterPlaylistVideosListeners::update')

        const videoListContainer = await findDelayedElement('#contents.ytd-playlist-video-list-renderer')
        const videoRows = videoListContainer.children

        for (const videoRow of videoRows) {
            const elementId = videoCounter++

            removeListenerIfExist(videoRow, 'dragstart')
            addListener(videoRow, elementId, 'dragstart', (ev) => {
                const event = ev as DragEvent
                const targetEl = event.target as HTMLElement
                event.dataTransfer?.setData(DRAG_EV_TRANSFER_KEY, elementId.toString())
                targetEl.classList.add('dragging')
            })

            removeListenerIfExist(videoRow, 'dragleave')
            addListener(videoRow, elementId, 'dragleave', (ev) => {
                const event = ev as DragEvent
                const targetEl = event.target as HTMLElement
                targetEl.classList.remove('dragging')
            })

            videoRow.classList.add('draggable-video')
            videoRow.setAttribute('draggable', 'true')
            videoRow.setAttribute(DRAG_EV_DATA_ATTR, elementId.toString())
        }

        console.info('videoRows', videoRows)
        console.info('listeners', listeners)

        console.groupEnd()
    })

    const observer = new MutationObserver((mutations) => {
        for (const node of mutations[0].removedNodes) {
            removeListenerIfExist(node as Element, 'dragstart')
            removeListenerIfExist(node as Element, 'dragleave')
        }
        update()
    })

    const onNavigation = tryDebounceAsync(async () => {
        console.groupCollapsed(__NAME__, 'useRegisterPlaylistVideosListeners::onNavigation')

        const videoListContainer = await findDelayedElement('#contents.ytd-playlist-video-list-renderer')
        observer?.disconnect()
        observer?.observe(videoListContainer, { childList: true })
        listeners.clear()
        console.info('Observing', videoListContainer)

        console.groupEnd()
    })

    onMounted(() => {
        onNavigation()
        update()
        window.addEventListener('yt-navigate-finish', onNavigation)
    })
    onUnmounted(() => {
        window.removeEventListener('yt-navigate-finish', onNavigation)
        observer?.disconnect()
    })
}

function addListener(node: Element, elementId: number, eventName: string, handler: DragHandler) {
    if (!listeners.has(eventName)) {
        listeners.set(eventName, new Map())
    }

    node.addEventListener(eventName, handler)
    listeners.get(eventName)?.set(elementId, handler)
}

function removeListenerIfExist(node: Element, eventName: string) {
    const elementIdStr = node.getAttribute(DRAG_EV_DATA_ATTR)
    if (!elementIdStr) {
        return
    }

    const elementId = parseInt(elementIdStr)
    if (isNaN(elementId)) {
        return
    }

    const prevListener = listeners.get(eventName)?.get(elementId)
    if (!prevListener) {
        return
    }

    node.removeEventListener(eventName, prevListener)
    listeners.get(eventName)?.delete(elementId)
}
