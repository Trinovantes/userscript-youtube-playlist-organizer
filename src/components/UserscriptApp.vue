<template>
    <div v-if="isOnPlaylistPage" class="userscript-app">
        <div v-if="isOpen" class="dialog-wrapper">
            <div class="dialog">
                <hgroup>
                    <h1>
                        {{ title }}
                    </h1>
                    <h2>
                        <a :href="projectUrl" class="url">
                            {{ projectUrl }}
                        </a>
                    </h2>
                </hgroup>

                <Settings
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

<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue'
import Settings from '@/components/Settings.vue'
import PlaylistOrganizer from '@/components/PlaylistOrganizer.vue'
import { determineIsOnPlaylistPage } from '@/PlaylistOrganizer'

export default defineComponent({
    components: {
        Settings,
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

<style lang="scss">
.draggable-video {
    cursor: pointer;
    position: relative;
    margin-bottom: 5px;

    &:before{
        border: 5px dashed grey;
        content: '';
        display: block;
        position: absolute;
        top: 0; bottom: 0;
        left: 0; right: 0;
        z-index: 0;
    }

    &.dragging:before{
        background: rgba(black, 0.2);
        border-color: white;
    }
}

.userscript-app{
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

    strong{
        font-weight: bold;
    }

    a{
        color: blue;
        text-decoration: none;

        &:hover{
            text-decoration: underline;
        }
    }

    a.btn{
        background-color: white;
        border: $border;
        border-radius: $border-radius;
        cursor: pointer;
        display: inline-block;
        padding: math.div($padding, 4) math.div($padding, 2);
        text-decoration: none;

        &:hover{
            background-color: #eee;
        }

        &.positive{
            background-color: green;
            border-color: darkgreen;
            color: white;

            &:hover{
                background-color: darkgreen;
            }
        }
    }

    a.settings-btn{
        @extend .icon-btn;

        background-image: url('@/assets/img/settings.png');
        box-shadow: rgba(11, 11, 11, 0.1) 0 2px 8px;

        margin-right: $dragarea-width + $ytb-player-width;
        position: fixed;
        bottom: $padding; right: $padding;
        z-index: 9999;

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

            hgroup{
                margin-bottom: $padding;
            }

            h1{
                font-size: 24px;
                font-weight: bold;
            }

            h3 {
                @extend .margins;

                font-size: 21px;
                font-weight: bold;
            }
        }
    }
}
</style>
