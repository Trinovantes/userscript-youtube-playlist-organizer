<script lang="ts" setup>
import { computed, watch } from 'vue'
import { type ActionType, triggerAction } from './triggerAction.ts'
import { useIsMiniPlayerVisible } from './useIsMiniPlayerVisible.ts'
import { useRegisterPlaylistVideosListeners } from './useRegisterPlaylistVideosListeners.ts'
import { useDropZones } from './useDropZones.ts'
import { useStore } from '../../store/useStore.ts'
import { BTN_SIZE, PADDING, YTB_PLAYER_HEIGHT, YTB_PLAYER_MARGIN, DRAG_EV_TRANSFER_KEY, YTB_MASTHEAD_HEIGHT } from '../../Constants.ts'
import { findDelayedElement } from '../../utils/findDelayedElement.ts'

const { dropZones, playlists, currentPlaylist, hasUpdatedOnce } = useDropZones()
useRegisterPlaylistVideosListeners()

const { isMiniPlayerVisible } = useIsMiniPlayerVisible()
const dropZoneBottomOffset = computed(() => isMiniPlayerVisible.value ? YTB_PLAYER_HEIGHT : (BTN_SIZE + PADDING * 2))

const store = useStore()
const clickDelay = computed(() => store.clickDelay)
const dropZoneWidth = computed(() => store.dropZoneWidth)
const rightOffset = computed(() => dropZoneWidth.value + (YTB_PLAYER_MARGIN * 2))
watch(rightOffset, async (rightOffset) => {
    console.groupCollapsed(__NAME__, 'PlaylistOrganizer.vue')

    const alertsContainer = await findDelayedElement('ytd-browse #alerts')
    alertsContainer.setAttribute('style', `padding-right:${rightOffset}px;`)

    const playlistContainer = await findDelayedElement('ytd-playlist-video-list-renderer.ytd-item-section-renderer')
    playlistContainer.setAttribute('style', `margin:0; margin-right:${rightOffset}px; transform:none;`)

    console.groupEnd()
}, {
    immediate: true,
})

const onDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
}
const onDragEnter = (event: DragEvent) => {
    if (!event.target || !(event.target instanceof Element)) {
        return
    }

    event.target.classList.add('highlight')
}
const onDragLeave = (event: DragEvent) => {
    if (!event.target || !(event.target instanceof Element)) {
        return
    }

    event.target.classList.remove('highlight')
}
const onDrop = (event: DragEvent, action: ActionType) => {
    if (!event.target || !(event.target instanceof Element)) {
        return
    }

    event.target.classList.remove('highlight')

    const targetPlaylistName = event.target.textContent?.trim()
    if (!targetPlaylistName) {
        console.warn(__NAME__, 'onDrop failed (invalid targetPlaylistName)')
        return
    }

    const currentPlaylistName = currentPlaylist.value?.name
    if (!currentPlaylistName) {
        console.warn(__NAME__, 'onDrop failed (invalid currentPlaylistName)')
        return
    }

    const elementId = event.dataTransfer?.getData(DRAG_EV_TRANSFER_KEY)
    if (!elementId) {
        console.warn(__NAME__, 'onDrop failed (invalid elementId)')
        return
    }

    void triggerAction(action, elementId, targetPlaylistName, currentPlaylistName, clickDelay.value)
}
</script>

<template>
    <div
        v-if="hasUpdatedOnce"
        class="playlist-organizer"
        :style="{
            top: `${YTB_MASTHEAD_HEIGHT}px`,
            right: `${YTB_PLAYER_MARGIN}px`,
            width: `${dropZoneWidth}px`,
            height: `calc(100vh - ${YTB_MASTHEAD_HEIGHT}px - ${dropZoneBottomOffset}px)`
        }"
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
            <a
                v-if="dropZone.url"
                :href="dropZone.url"
            >
                {{ dropZone.label }}
            </a>
            <span
                v-else
            >
                {{ dropZone.label }}
            </span>
        </div>

        <div
            v-if="store.showNoPlaylistWarning && playlists.length === 0"
            class="no-playlists-warning"
        >
            <p>
                Due to YouTube's Apr 2024 UI change, it is not possible to determine your playlists from the sidebar's HTML.
            </p>
            <p>
                Please visit <a href="https://www.youtube.com/feed/playlists">youtube.com/feed/playlists</a> for this UserScript to register your playlists.
            </p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.playlist-organizer{
    position: fixed;
    z-index: 2001;

    color: white;
    overflow-x: hidden;
    overflow-y: auto;

    display: flex;
    flex-direction: column;
    gap: math.div($padding, 4);

    .no-playlists-warning{
        flex: 1;
        width: 100%;
        padding: $padding * 2;

        display: grid;
        gap: $padding;
        align-content: baseline;
    }

    &:has(.no-playlists-warning) .dropzone{
        flex: none;
        padding: ($padding * 2) 0;
    }

    .dropzone{
        align-items: center;
        background: #111;
        box-sizing: border-box;
        display: flex;
        flex: 1;
        position: relative;
        width: 100%;

        a,
        span{
            color: white;
            font-size: 2em;
            font-weight: bold;

            align-items: center;
            display: flex;
            flex: 1;
            padding: 0 ($padding * 2);
            text-decoration: none;
        }

        a:hover{
            text-decoration: underline;
        }

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
