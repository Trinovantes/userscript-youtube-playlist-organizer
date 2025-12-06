<script lang="ts" setup>
import { computed, watch } from 'vue'
import { usePlaylistPageDragListeners } from './usePlaylistPageDragListeners.ts'
import { usePlaylistPageDropZones, type DropZoneAction } from './usePlaylistPageDropZones.ts'
import { useSettingStore } from '../../store/useSettingStore.ts'
import { BTN_SIZE, PADDING, YTB_PLAYER_HEIGHT, YTB_PLAYER_MARGIN, YTB_MASTHEAD_HEIGHT } from '../../Constants.ts'
import { findDelayedElement } from '../../utils/findDelayedElement.ts'
import { triggerDropZoneAction } from './triggerDropZoneAction.ts'
import { usePlaylistPageStore } from '../../store/usePlaylistPageStore.ts'

const { dropZones } = usePlaylistPageDropZones()
usePlaylistPageDragListeners()

const playlistPageStore = usePlaylistPageStore()
const settingStore = useSettingStore()
const dropZoneWidth = computed(() => settingStore.dropZoneWidth)
const dropZoneBottomOffset = computed(() => playlistPageStore.isMiniPlayerVisible ? YTB_PLAYER_HEIGHT : (BTN_SIZE + PADDING * 2))

const rightOffset = computed(() => dropZoneWidth.value + (YTB_PLAYER_MARGIN * 2))
watch(rightOffset, async (rightOffset) => {
    console.groupCollapsed(__NAME__, 'PlaylistOrganizer.vue::rightOffset')

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
const onDrop = (event: DragEvent, action: DropZoneAction, targetPlaylistName: string, targetPlaylistId: string) => {
    if (!event.target || !(event.target instanceof Element)) {
        return
    }

    triggerDropZoneAction(event, action, playlistPageStore.currentPlaylist, {
        name: targetPlaylistName,
        playlistId: targetPlaylistId,
    })

    event.target.classList.remove('highlight')
}
</script>

<template>
    <div
        class="playlist-page-organizer"
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
            :class="`dropzone ${dropZone.htmlClass ?? ''}`"
            @dragover="onDragOver"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @drop="(ev) => onDrop(ev, dropZone.action, dropZone.label, dropZone.key)"
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
    </div>
</template>

<style lang="scss" scoped>
.playlist-page-organizer{
    position: fixed;
    z-index: 2001;

    color: white;
    overflow-x: hidden;
    overflow-y: auto;

    display: flex;
    flex-direction: column;
    gap: math.div($padding, 4);

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
