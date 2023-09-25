<script lang="ts" setup>
import { projectTitle, projectUrl } from '@/Constants'
import { useStore } from '@/store/useStore'
import UserscriptAppSettingsHiddenPlaylists from './UserscriptAppSettingsHiddenPlaylists.vue'

const emit = defineEmits(['close'])

const store = useStore()
const save = async() => {
    await store.save()
    emit('close')
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
                <label for="dropZoneWidth">
                    Sidebar Width
                </label>
                <input
                    id="dropZoneWidth"
                    v-model.number="store.dropZoneWidth"
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
                <label for="hiddenPlaylists">
                    <strong>
                        Hide Playlists
                    </strong>
                    <span>
                        Hide playlists from the sidebar by name
                    </span>
                </label>

                <UserscriptAppSettingsHiddenPlaylists />
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
    max-width: 600px;
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

    align-items: baseline;
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
