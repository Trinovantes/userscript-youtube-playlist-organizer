<script lang="ts" setup>
import { ref } from 'vue'
import { useStore } from '../../store/useStore.ts'

const store = useStore()
const playlistToHide = ref<string | null>()
const addItem = async (e: Event) => {
    e.preventDefault()

    if (!playlistToHide.value) {
        return
    }

    await store.addHiddenPlaylist(playlistToHide.value)
    playlistToHide.value = null
}
const removeItem = async (idx: string) => {
    await store.removeHiddenPlaylist(idx)
}
</script>

<template>
    <div class="flex-vgap hidden-playlists">
        <form
            class="flex-hgap"
            @submit="addItem"
        >
            <input
                id="hiddenPlaylists"
                v-model="playlistToHide"
                placeholder="Name of playlist to hide (case-sensitive)"
            >
            <button
                class="positive"
                type="submit"
            >
                Add
            </button>
        </form>

        <template
            v-if="store.hiddenPlaylists.length > 0"
        >
            <div
                v-for="[idx, hiddenPlaylist] of Object.entries(store.hiddenPlaylists)"
                :key="idx"
                class="flex-hgap"
            >
                <button
                    class="negative"
                    @click="removeItem(idx)"
                >
                    Remove
                </button>
                <div>
                    {{ hiddenPlaylist }}
                </div>
            </div>
        </template>
        <template
            v-else
        >
            <em>
                There are currently no hidden playlists
            </em>
        </template>
    </div>
</template>

<style lang="scss" scoped>
.hidden-playlists{
    width: 100%;
}

.flex-hgap{
    align-items: center;
}
</style>
