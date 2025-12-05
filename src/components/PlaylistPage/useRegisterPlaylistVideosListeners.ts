import { DATA_ATTR_VIDEO_ID, DRAG_EVENT_DATA_KEY_VIDEO_ID } from '../../Constants.ts'
import { onUnmounted, onMounted } from 'vue'
import { findDelayedElement } from '../../utils/findDelayedElement.ts'
import { tryDebounceAsync } from '../../utils/tryDebounce.ts'

type DragEventName = 'dragleave' | 'dragstart'
type DragHandler = (ev: Event) => void
type ElementListenersMap = Map<string, DragHandler>

// Need to keep reference to original handlers in order to properly unregister them
const listeners = new Map<DragEventName, ElementListenersMap>()

export function useRegisterPlaylistVideosListeners() {
    const update = tryDebounceAsync('useRegisterPlaylistVideosListeners::update', async () => {
        const videoListContainer = await findDelayedElement('#contents.ytd-playlist-video-list-renderer')
        const videoRows = videoListContainer.children

        for (const videoRow of videoRows) {
            const videoId = getVideoId(videoRow)

            removeListenerIfExist('dragstart', videoRow)
            addListener('dragstart', videoRow, videoId, (ev) => {
                const event = ev as DragEvent
                const targetEl = event.target as HTMLElement
                event.dataTransfer?.setData(DRAG_EVENT_DATA_KEY_VIDEO_ID, videoId.toString())
                targetEl.classList.add('dragging')
            })

            removeListenerIfExist('dragleave', videoRow)
            addListener('dragleave', videoRow, videoId, (ev) => {
                const event = ev as DragEvent
                const targetEl = event.target as HTMLElement
                targetEl.classList.remove('dragging')
            })

            videoRow.classList.add('draggable-video')
            videoRow.setAttribute('draggable', 'true')
            videoRow.setAttribute(DATA_ATTR_VIDEO_ID, videoId.toString())
        }

        console.info('videoRows', videoRows)
        console.info('listeners', listeners)
    })

    const observer = new MutationObserver((mutations) => {
        for (const node of mutations[0].removedNodes) {
            removeListenerIfExist('dragstart', node)
            removeListenerIfExist('dragleave', node)
        }
        update()
    })

    const onNavigation = tryDebounceAsync('useRegisterPlaylistVideosListeners::onNavigation', async () => {
        const videoListContainer = await findDelayedElement('#contents.ytd-playlist-video-list-renderer')
        observer.disconnect()
        observer.observe(videoListContainer, { childList: true })
        console.info('Observing', videoListContainer)

        // If we navigated away from playlist page, then all the nodes are invalid and we can simply clear our references to their handlers
        listeners.clear()
    })

    onMounted(() => {
        update()
        onNavigation()
        window.addEventListener('yt-navigate-finish', onNavigation)
    })
    onUnmounted(() => {
        window.removeEventListener('yt-navigate-finish', onNavigation)
        observer.disconnect()
    })
}

function getVideoId(node: Element): string {
    const href = node.querySelector('a#thumbnail')?.getAttribute('href')
    const videoId = /\/watch\?v=(?<videoId>[\w-]+)&?/.exec(href ?? '')?.groups?.videoId
    if (!videoId) {
        throw new Error(`Failed to get videoId from "${href}"`)
    }

    return videoId
}

function addListener(eventName: DragEventName, node: Node, videoId: string, handler: DragHandler) {
    if (!listeners.has(eventName)) {
        listeners.set(eventName, new Map())
    }

    node.addEventListener(eventName, handler)
    listeners.get(eventName)?.set(videoId, handler)
}

function removeListenerIfExist(eventName: DragEventName, node: Node) {
    if (!(node instanceof Element)) {
        return
    }

    const videoId = node.getAttribute(DATA_ATTR_VIDEO_ID)
    if (!videoId) {
        return
    }

    const prevListener = listeners.get(eventName)?.get(videoId)
    if (!prevListener) {
        return
    }

    node.removeEventListener(eventName, prevListener)
    listeners.get(eventName)?.delete(videoId)
}
