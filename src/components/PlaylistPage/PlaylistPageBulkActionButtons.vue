<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { YTB_PLAYER_MARGIN } from '../../Constants.ts'
import { usePlaylistPageStore } from '../../store/usePlaylistPageStore.ts'
import { useSettingStore } from '../../store/useSettingStore.ts'
import { usePlaylistPageCheckboxes } from './usePlaylistPageCheckboxes.ts'
import type { Playlist } from '../../ytb/Playlist.ts'

usePlaylistPageCheckboxes()

const settingStore = useSettingStore()
const playlistPageStore = usePlaylistPageStore()
const numChecked = computed(() => playlistPageStore.checkedVideos.length)
const disableBulkAction = computed(() => numChecked.value === 0)

const enableAll = ref(false)
watch(enableAll, () => {
    playlistPageStore.toggleAllVideos(enableAll.value)
})

const targetPlaylist = ref<Playlist | null>(null)
</script>

<template>
    <Teleport to="#primary > ytd-section-list-renderer > #header-container">
        <div
            class="bulk-action-buttons"
            :style="{
                marginRight: `${settingStore.dropZoneWidth + (YTB_PLAYER_MARGIN * 2) + 40}px`,
            }"
        >
            <div>
                {{ numChecked }} Selected
            </div>

            <button
                @click="playlistPageStore.moveAllCheckedVideosToPlaylist(targetPlaylist)"
                :disabled="disableBulkAction"
            >
                Move All to Playlist

                <select
                    v-model="targetPlaylist"
                    @click="(ev) => ev.stopPropagation()"
                    :disabled="disableBulkAction"
                >
                    <option
                        v-for="playlist in playlistPageStore.userPlaylists"
                        :key="playlist.playlistId"
                        :value="playlist"
                    >
                        {{ playlist.name }}
                    </option>
                </select>
            </button>

            <button
                @click="playlistPageStore.removeAllCheckedVideos"
                :disabled="disableBulkAction"
            >
                Remove All
            </button>

            <button
                @click="playlistPageStore.addAllCheckedVideosToQueue"
                :disabled="disableBulkAction"
            >
                Add All to Queue
            </button>

            <button
                v-if="!playlistPageStore.isWatchLaterPage"
                @click="playlistPageStore.addAllCheckedVideosToWatchLater"
                :disabled="disableBulkAction"
            >
                Add All to Watch Later
            </button>

            <label
                for="bulk-action-checkbox-all"
                class="bulk-action"
            >
                <input
                    v-model="enableAll"
                    type="checkbox"
                    id="bulk-action-checkbox-all"
                >
            </label>
        </div>
    </Teleport>
</template>

<style lang="scss" scoped>
.bulk-action-buttons{
    display: flex;
    gap: $padding;
    align-items: center;
    justify-content: right;

    button{
        cursor: pointer;
        padding: math.div($padding, 2);
    }
}
</style>
