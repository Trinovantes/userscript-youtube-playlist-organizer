<script lang="ts" setup>
import { projectTitle, projectUrl } from '@/Constants'
import { useStore } from '@/store/useStore'
import SettingsDialogHiddenPlaylists from './SettingsDialogHiddenPlaylists.vue'

const emit = defineEmits(['close'])

const store = useStore()
const save = async() => {
    await store.save()
    emit('close')
}
const reset = async() => {
    store.$reset()
    await store.save()
}
const cancel = async() => {
    await store.load()
    emit('close')
}
</script>

<template>
    <article>
        <div class="group header flex-vgap">
            <h1>
                {{ projectTitle }}
            </h1>
            <a :href="projectUrl" class="project-url">
                {{ projectUrl }}
            </a>
        </div>

        <div class="group flex-vgap">
            <div class="setting">
                <label>
                    <strong>
                        Reset Data
                    </strong>
                    <span>
                        This will reset all your settings and cached playlist names
                    </span>
                </label>

                <button
                    class="negative"
                    @click="reset"
                >
                    Reset
                </button>
            </div>

            <div class="setting">
                <label for="dropZoneWidth">
                    <strong>
                        Sidebar Width
                    </strong>
                    <span>
                        This changes the size of the area where you can drag and drop videos
                    </span>
                </label>
                <input
                    id="dropZoneWidth"
                    v-model.number="store.dropZoneWidth"
                    type="number"
                >
            </div>

            <div class="setting">
                <label for="clickDelay">
                    <strong>
                        Click Delay
                    </strong>
                    <span>
                        Time (in ms) to wait between clicking buttons
                    </span>
                </label>
                <input
                    id="clickDelay"
                    v-model.number="store.clickDelay"
                    type="number"
                >
            </div>

            <div class="setting">
                <label for="showActionsAtTop">
                    <strong>
                        Show Actions at Top of Sidebar
                    </strong>
                    <span>
                        This moves the "Add to Queue", "Remove from List", and "Add to Watch Later" actions to the top of the sidebar
                    </span>
                </label>

                <input
                    id="showActionsAtTop"
                    v-model="store.showActionsAtTop"
                    type="checkbox"
                >
            </div>

            <div class="setting">
                <label for="showNoPlaylistWarning">
                    <strong>
                        Show No Playlists Warning
                    </strong>
                    <span>
                        Disable this if you do not want to see the warning when you have no playlists
                    </span>
                </label>

                <input
                    id="showNoPlaylistWarning"
                    v-model="store.showNoPlaylistWarning"
                    type="checkbox"
                >
            </div>

            <div class="setting">
                <label for="hiddenPlaylists">
                    <strong>
                        Hide Playlists
                    </strong>
                    <span>
                        Hide playlists from the sidebar by name
                    </span>
                </label>

                <SettingsDialogHiddenPlaylists />
            </div>
        </div>

        <div class="group actions flex-hgap">
            <button
                class="positive"
                @click="save"
            >
                Save
            </button>

            <div class="flex-1" />

            <button
                @click="cancel"
            >
                Cancel
            </button>
        </div>
    </article>
</template>

<style lang="scss" scoped>
article{
    display: grid;
    max-height: 80vh;
    overflow-y: auto;
    max-width: 800px;
    width: 60vw;
}

.group{
    padding: $padding;

    &:not(:first-child){
        border-top: $border;
    }

    &.header{
        gap: math.div($padding, 2);
    }
}

.setting{
    display: grid;
    gap: $padding;
    grid-template-columns: 1fr 2fr;

    align-items: start;
    justify-items: start;

    label{
        display: grid;
        gap: math.div($padding, 2);
        font-weight: bold;

        strong{
            font-weight: bold;
            line-height: 20px;
        }

        span{
            font-weight: normal;
            font-size: 12px;
            line-height: 16px;
        }
    }
}
</style>
