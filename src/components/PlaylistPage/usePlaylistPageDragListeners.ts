import { DATA_ATTR_VIDEO_ID, DRAG_EVENT_DATA_KEY_VIDEO_ID } from '../../Constants.ts'
import { tryFnDebounceAsync } from '../../utils/tryFn.ts'
import { getVideoId } from '../../ytb/Video.ts'
import { findDelayedElementAll } from '../../utils/findDelayedElementAll.ts'
import { useObserver } from './useObserver.ts'
import { onMounted } from 'vue'

type DragEventName = 'dragleave' | 'dragstart'
type DragHandler = (ev: Event) => void
type ElementListenersMap = Map<string, DragHandler>

export function usePlaylistPageDragListeners() {
    // Need to keep reference to original handlers in order to properly unregister them
    const listeners = new Map<DragEventName, ElementListenersMap>()
    const addListener = (eventName: DragEventName, node: Node, videoId: string, handler: DragHandler) => {
        if (!listeners.has(eventName)) {
            listeners.set(eventName, new Map())
        }

        node.addEventListener(eventName, handler)
        listeners.get(eventName)?.set(videoId, handler)
    }
    const removeListenerIfExist = (eventName: DragEventName, node: Node) => {
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

    const update = tryFnDebounceAsync('usePlaylistPageDragListeners::update', async () => {
        const videoRows = await findDelayedElementAll('#contents.ytd-playlist-video-list-renderer ytd-playlist-video-renderer')

        for (const videoRow of videoRows) {
            const href = videoRow.querySelector('a#thumbnail')?.getAttribute('href')
            const videoId = getVideoId(href ?? '')

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

        console.info('videoRows', videoRows.length)
        console.info('listeners.dragstart', listeners.get('dragstart')?.size)
        console.info('listeners.dragleave', listeners.get('dragleave')?.size)
    })

    onMounted(update)
    useObserver('#contents.ytd-playlist-video-list-renderer', {
        childList: true,
    }, (mutations) => {
        for (const node of mutations[0].removedNodes) {
            removeListenerIfExist('dragstart', node)
            removeListenerIfExist('dragleave', node)
        }
        update()
    })
}
