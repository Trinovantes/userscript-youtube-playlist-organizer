<script lang="ts" setup>
import { debounce } from 'lodash-es'
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'
import { DATA_TRANSFER_KEY, PADDING, UI_WAIT_TIME, WATCH_LATER_LIST_ID, YTB_PLAYER_WIDTH, YTB_MASTHEAD_HEIGHT_PX, YTB_PLAYER_WIDTH_PX } from '@/Constants'
import { Playlist, determineCurrentPlaylist } from '@/services/ytb/determineCurrentPlaylist'
import { findPlaylistsInSidebar } from '@/services/ytb/findPlaylistInSidebar'
import { registerDragListeners } from '@/services/ytb/registerEventListeners'
import { ActionType, triggerAction } from '@/services/ytb/triggerAction'
import { useStore } from '@/store'
import { findDelayedElement } from '@/utils/findDelayedElement'

const store = useStore()
const showActionsAtTop = computed(() => store.showActionsAtTop)

const dropZoneWidth = computed(() => store.dropZoneWidth)
const dropZoneWidthPx = computed(() => `${store.dropZoneWidth}px`)
const updateContainerMargins = async() => {
    const $playlistContainer = await findDelayedElement('ytd-playlist-video-list-renderer.ytd-item-section-renderer')
    $playlistContainer.css({
        margin: '0',
        marginRight: `${dropZoneWidth.value + YTB_PLAYER_WIDTH + PADDING}px`,
    })
}
watch(dropZoneWidth, updateContainerMargins)

interface DropZone {
    key: string
    class?: string
    label: string
    action: ActionType
}
const playlists = ref<Array<Playlist>>([])
const dropZones = computed<Array<DropZone>>(() => {
    const actionsZones: Array<DropZone> = [
        {
            key: 'remove-from-list',
            class: 'remove-from-list',
            label: 'Remove from List',
            action: ActionType.REMOVE,
        },
        {
            key: 'add-to-queue',
            class: 'add-to-queue',
            label: 'Add to Queue',
            action: ActionType.ADD_QUEUE,
        },
    ]

    if (!isOnWatchLater.value) {
        actionsZones.push({
            key: 'add-to-watch-later',
            class: 'add-to-watch-later',
            label: 'Add to Watch Later',
            action: ActionType.ADD_WATCH_LATER,
        })
    }

    const playlistZones: Array<DropZone> = []
    for (const playlist of playlists.value) {
        playlistZones.push({
            key: playlist.youtubeId,
            label: playlist.name,
            action: ActionType.ADD_PLAYLIST,
        })
    }

    return showActionsAtTop.value
        ? [...actionsZones, ...playlistZones]
        : [...playlistZones, ...actionsZones]
})

const currentPlaylist = ref<Playlist | null>(null)
const isOnWatchLater = computed(() => currentPlaylist.value?.youtubeId === WATCH_LATER_LIST_ID)

const observer = new MutationObserver(registerDragListeners)
onUnmounted(() => {
    observer.disconnect()
})

const renderedOnce = ref(false)
const render = debounce(() => {
    void (async() => {
        console.info(DEFINE.NAME, 'PlaylistOrganizer::render')

        playlists.value = await findPlaylistsInSidebar()
        currentPlaylist.value = determineCurrentPlaylist()

        await updateContainerMargins()

        const $videoListContainer = await findDelayedElement('#contents.ytd-playlist-video-list-renderer')
        registerDragListeners()
        observer.disconnect()
        observer.observe($videoListContainer[0], {
            childList: true,
        })

        renderedOnce.value = true
    })()
}, UI_WAIT_TIME)

onBeforeMount(() => {
    render()
})
onMounted(() => {
    window.addEventListener('yt-navigate-finish', render)
})
onUnmounted(() => {
    window.removeEventListener('yt-navigate-finish', render)
})

const onDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
}

const onDragEnter = (event: DragEvent) => {
    if (!event.target) {
        return
    }

    $(event.target).addClass('highlight')
}

const onDragLeave = (event: DragEvent) => {
    if (!event.target) {
        return
    }

    $(event.target).removeClass('highlight')
}

const onDrop = (event: DragEvent, action: ActionType) => {
    if (!event.target) {
        return
    }

    $(event.target).removeClass('highlight')

    const targetPlaylistName = $(event.target).text().trim()
    const elementId = event.dataTransfer?.getData(DATA_TRANSFER_KEY)
    console.info(DEFINE.NAME, 'onDrop()', `action:${action}`, `targetPlaylistName:"${targetPlaylistName}"`, `elementId:"${elementId}"`)

    if (!targetPlaylistName || !elementId) {
        return
    }

    void triggerAction(action, elementId, targetPlaylistName, currentPlaylist.value?.name ?? '')
}
</script>

<template>
    <div
        v-if="renderedOnce"
        class="playlist-organizer"
    >
        <div
            v-for="dropZone of dropZones"
            :key="dropZone.key"
            :class="`dropzone ${dropZone.class ?? ''}`"
            @dragover="onDragOver"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @drop="(ev) => onDrop(ev, dropZone.action)"
        >
            {{ dropZone.label }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.playlist-organizer{
    color: white;
    overflow-x: hidden;
    overflow-y: auto;

    position: fixed;
    top: v-bind(YTB_MASTHEAD_HEIGHT_PX);
    right: v-bind(YTB_PLAYER_WIDTH_PX);
    width: v-bind(dropZoneWidthPx);
    height: calc(100vh - v-bind(YTB_MASTHEAD_HEIGHT_PX));

    display: flex;
    flex-direction: column;
    gap: math.div($padding, 4);

    .dropzone{
        color: white;
        font-size: 2em;
        font-weight: bold;

        align-items: center;
        background: #111;
        box-sizing: border-box;
        display: flex;
        flex: 1;
        position: relative;
        padding: 0 ($padding * 2);
        width: 100%;

        &.highlight:before{
            background: rgba(black, 0.2);
            border: 5px dashed white;
            content: '';
            display: block;
            position: absolute;
            top: 5px; bottom: 5px;
            left: 5px; right: 5px;
        }

        &.remove-from-list{
            background: darkred;
        }

        &.add-to-queue{
            background: darkgreen;
        }

        &.add-to-watch-later{
            background: darkcyan;
        }
    }
}
</style>
