<script lang="ts" setup>
import { playlistPathRe } from '../Constants.ts'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PlaylistPage from './PlaylistPage/PlaylistPage.vue'
import { tryDebounce } from '../utils/tryDebounce.ts'

const isOnPlaylistPage = ref(false)
const onNavigation = tryDebounce('App.vue::onNavigation', () => {
    isOnPlaylistPage.value = playlistPathRe.test(location.href)
    console.info('isOnPlaylistPage', isOnPlaylistPage.value)
})

onMounted(() => {
    onNavigation()
    window.addEventListener('yt-navigate-finish', onNavigation)
})
onBeforeUnmount(() => {
    window.removeEventListener('yt-navigate-finish', onNavigation)
})
</script>

<template>
    <div
        class="userscript-youtube-playlist-organizer"
    >
        <PlaylistPage
            v-if="isOnPlaylistPage"
        />
    </div>
</template>
