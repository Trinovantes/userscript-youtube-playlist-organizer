<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { TITLE } from '@/Constants'
import PlaylistOrganizer from '@/components/PlaylistOrganizer.vue'
import UserscriptAppSettings from '@/components/UserscriptAppSettings.vue'
import { determineIsOnPlaylistPage } from '@/services/ytb/determineIsOnPlaylistPage'

const isOpen = ref(false)
const isOnPlaylistPage = ref(false)

onMounted(() => {
    isOnPlaylistPage.value = determineIsOnPlaylistPage()
})

window.addEventListener('yt-navigate-finish', () => {
    isOnPlaylistPage.value = determineIsOnPlaylistPage()
})
</script>

<template>
    <div
        v-if="isOnPlaylistPage"
        class="userscript-youtube-playlist-organizer"
    >
        <div
            v-if="isOpen"
            class="dialog-wrapper"
        >
            <div class="dialog">
                <UserscriptAppSettings
                    @close="isOpen = false"
                />
            </div>
        </div>

        <PlaylistOrganizer />

        <a
            class="settings-btn"
            :title="TITLE"
            @click="isOpen = true"
        >
            Settings
        </a>
    </div>
</template>

<style lang="scss">
.userscript-youtube-playlist-organizer *{
    background: none;
    outline: none;
    border: none;
    margin: 0;
    padding: 0;

    color: #111;
    font-size: 15px;
    font-weight: normal;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.5;
    vertical-align: baseline;
}
</style>

<style lang="scss" scoped>
a.settings-btn{
    @extend .icon-btn;

    position: fixed;
    bottom: $padding;
    right: $padding;
    z-index: 9999;

    background-image: url('@/assets/img/settings.png');
    box-shadow: rgba(11, 11, 11, 0.1) 0 2px 8px;

    &:hover{
        box-shadow: rgba(11, 11, 11, 0.4) 0 0px 8px;
    }
}

.dialog-wrapper{
    background: rgba(11, 11, 11, 0.4);

    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 99999;

    > .dialog{
        background: white;
        padding: $padding;
        border-radius: $border-radius;

        position: absolute;
        top: 50%; left: 50%;
        transform: translateY(-50%) translateX(-50%);
        min-width: $min-dialog-width;
    }
}
</style>
