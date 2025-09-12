<script lang="ts" setup>
import { playlistPathRe } from '../Constants.ts'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AllPlaylistsPage from './AllPlaylistsPage/AllPlaylistsPage.vue'
import PlaylistPage from './PlaylistPage/PlaylistPage.vue'
import { tryDebounce } from '../utils/tryDebounce.ts'

const isOnPlaylistPage = ref(false)
const isOnAllPlaylistsPage = ref(false)
const onNavigation = tryDebounce(() => {
    console.groupCollapsed(__NAME__, 'App.vue', 'onNavigation')

    isOnPlaylistPage.value = playlistPathRe.test(location.href)
    console.info('isOnPlaylistPage', isOnPlaylistPage.value)

    isOnAllPlaylistsPage.value = location.href.endsWith('youtube.com/feed/playlists')
    console.info('isOnAllPlaylistPage', isOnAllPlaylistsPage.value)

    console.groupEnd()
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
        <AllPlaylistsPage
            v-else-if="isOnAllPlaylistsPage"
        />
    </div>
</template>
