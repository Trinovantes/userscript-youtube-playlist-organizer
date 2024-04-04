<script lang="ts" setup>
import { computed, watch } from 'vue'
import { ActionType, triggerAction } from '@/utils/triggerAction'
import { useStore } from '@/store/useStore'
import { findDelayedElement } from '@/utils/findDelayedElement'
import { useIsMiniPlayerVisible } from '@/utils/useIsMiniPlayerVisible'
import { useRegisterPlaylistVideosListeners } from '@/utils/useRegisterPlaylistVideosListeners'
import { useDropZones } from '@/utils/useDropZones'
import { YTB_PLAYER_HEIGHT, BTN_SIZE, PADDING, YTB_PLAYER_MARGIN, DRAG_EV_TRANSFER_KEY, YTB_MASTHEAD_HEIGHT } from '@/Constants'

const { dropZones, currentPlaylist, hasUpdatedOnce } = useDropZones()
useRegisterPlaylistVideosListeners()

const { isMiniPlayerVisible } = useIsMiniPlayerVisible()
const dropZoneBottomOffset = computed(() => isMiniPlayerVisible.value ? YTB_PLAYER_HEIGHT : (BTN_SIZE + PADDING * 2))

const store = useStore()
const dropZoneWidth = computed(() => store.dropZoneWidth)
const rightOffset = computed(() => dropZoneWidth.value + (YTB_PLAYER_MARGIN * 2))
watch(rightOffset, async(rightOffset) => {
    const alertsContainer = await findDelayedElement('ytd-browse #alerts')
    alertsContainer.setAttribute('style', `padding-right:${rightOffset}px;`)

    const playlistContainer = await findDelayedElement('ytd-playlist-video-list-renderer.ytd-item-section-renderer')
    playlistContainer.setAttribute('style', `margin:0; margin-right:${rightOffset}px; transform:none;`)
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
        return
    }

    const elementId = event.dataTransfer?.getData(DRAG_EV_TRANSFER_KEY)
    if (!elementId) {
        return
    }

    triggerAction(action, elementId, targetPlaylistName, currentPlaylist.value?.name ?? '')
        .catch((err: unknown) => {
            console.warn(err)
        })
}
</script>

<template>
    <div
        v-if="hasUpdatedOnce"
        class="playlist-organizer"
        :style="{
            zIndex: 99,
            position: 'fixed',
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
            {{ dropZone.label }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.playlist-organizer{
    color: white;
    overflow-x: hidden;
    overflow-y: auto;

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
