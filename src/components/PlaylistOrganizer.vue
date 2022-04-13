<script lang="ts">
import { DATA_TRANSFER_KEY, WATCH_LATER_LIST_ID } from '@/Constants'
import { Playlist, determineCurrentPlaylist } from '@/services/ytb/determineCurrentPlaylist'
import { findPlaylistsInSidebar } from '@/services/ytb/findPlaylistInSidebar'
import { registerDragListeners } from '@/services/ytb/registerEventListeners'
import { ActionType, triggerAction } from '@/services/ytb/triggerAction'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'

export default defineComponent({
    setup() {
        const playlists = ref<Array<Playlist>>([])
        const currentPlaylist = ref<Playlist | null>(null)
        const isOnWatchLater = computed(() => currentPlaylist.value?.youtubeId === WATCH_LATER_LIST_ID)

        const observer = new MutationObserver(registerDragListeners)
        onUnmounted(() => {
            observer.disconnect()
        })

        const render = () => {
            void (async() => {
                playlists.value = await findPlaylistsInSidebar()
                currentPlaylist.value = determineCurrentPlaylist()

                registerDragListeners()

                const $videoListContainer = $('#contents.ytd-playlist-video-list-renderer')
                observer.disconnect()
                observer.observe($videoListContainer[0], {
                    childList: true,
                })
            })()
        }

        onMounted(() => {
            render()
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

        return {
            playlists,
            isOnWatchLater,

            ActionType,
            onDragOver,
            onDragEnter,
            onDragLeave,
            onDrop,
        }
    },
})
</script>

<template>
    <div
        v-if="playlists.length > 0"
        class="playlist-organizer"
    >
        <div
            v-for="playlist of playlists"
            :key="playlist.youtubeId"
            class="dropzone"
            @dragover="onDragOver"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @drop="(ev) => onDrop(ev, ActionType.ADD_PLAYLIST)"
        >
            {{ playlist.name }}
        </div>

        <div
            class="dropzone remove-from-list"
            @dragover="onDragOver"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @drop="(ev) => onDrop(ev, ActionType.REMOVE)"
        >
            Remove from List
        </div>
        <div
            class="dropzone add-to-queue"
            @dragover="onDragOver"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @drop="(ev) => onDrop(ev, ActionType.ADD_QUEUE)"
        >
            Add to Queue
        </div>
        <div
            v-if="!isOnWatchLater"
            class="dropzone add-to-watch-later"
            @dragover="onDragOver"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @drop="(ev) => onDrop(ev, ActionType.ADD_WATCH_LATER)"
        >
            Add to Watch Later
        </div>
    </div>
</template>

<style lang="scss" scoped>
.playlist-organizer{
    color: white;
    overflow-x: hidden;
    overflow-y: auto;

    position: fixed;
    top: $ytb-masthead-height;
    right: $ytb-player-width;
    width: $dragarea-width;
    height: calc(100vh - #{$ytb-masthead-height});

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
    }
}
</style>
