<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue'
import UserscriptAppSettings from '@/components/UserscriptAppSettings.vue'
import PlaylistOrganizer from '@/components/PlaylistOrganizer.vue'
import { determineIsOnPlaylistPage } from '@/services/ytb/determineIsOnPlaylistPage'

export default defineComponent({
    components: {
        UserscriptAppSettings,
        PlaylistOrganizer,
    },

    setup() {
        const isOpen = ref(false)
        const isOnPlaylistPage = ref(false)

        onMounted(() => {
            isOnPlaylistPage.value = determineIsOnPlaylistPage()
        })

        window.addEventListener('yt-navigate-finish', () => {
            isOnPlaylistPage.value = determineIsOnPlaylistPage()
        })

        return {
            title: `${DEFINE.PRODUCT_NAME} ${DEFINE.VERSION}`,
            projectUrl: DEFINE.REPO.url,
            isOpen,
            isOnPlaylistPage,
        }
    },
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
                <h1>
                    {{ title }}
                </h1>
                <a :href="projectUrl" class="url">
                    {{ projectUrl }}
                </a>

                <UserscriptAppSettings
                    @close="isOpen = false"
                />
            </div>
        </div>

        <PlaylistOrganizer />

        <a
            class="settings-btn"
            :title="title"
            @click="isOpen = true"
        >
            Settings
        </a>
    </div>
</template>

<style lang="scss">
.userscript-youtube-playlist-organizer{
    *{
        background: none;
        outline: none;
        border: none;
        margin: 0;
        padding: 0;

        color: #111;
        font-size: 15px;
        font-weight: normal;
        line-height: 1.5;
    }

    a.settings-btn{
        @extend .icon-btn;

        position: fixed;
        bottom: $padding; right: $dragarea-width + $ytb-player-width + $padding;
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

            h1{
                font-size: 24px;
                font-weight: bold;
            }

            a.url{
                display: block;
                margin-bottom: $padding;

                color: blue;
                text-decoration: none;

                &:hover{
                    text-decoration: underline;
                }
            }
        }
    }
}
</style>
