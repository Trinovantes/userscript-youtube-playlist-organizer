<script lang="ts" setup>
import { ref } from 'vue'
import { TITLE } from '@/Constants'
import { useStore } from '@/store'

defineEmits(['close'])

const projectUrl = DEFINE.REPO.url
const store = useStore()

const playlistToHide = ref<string | null>()
const addItem = async(e: Event) => {
    e.preventDefault()

    if (!playlistToHide.value) {
        return
    }

    await store.addHiddenPlaylist(playlistToHide.value)
    playlistToHide.value = null
}
const removeItem = async(idx: string) => {
    await store.removeHiddenPlaylist(idx)
}
</script>

<template>
    <div class="settings">
        <div class="group">
            <h1>
                {{ TITLE }}
            </h1>
            <a :href="projectUrl" class="project-url">
                {{ projectUrl }}
            </a>
        </div>

        <div class="group">
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
                <div class="list-setting">
                    <form
                        class="list-item"
                        @submit="addItem"
                    >
                        <input
                            id="hiddenPlaylists"
                            v-model="playlistToHide"
                            placeholder="Name of playlist to hide (case-sensitive)"
                        >
                        <button
                            class="btn positive"
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
                            class="list-item"
                        >
                            <a
                                class="btn negative"
                                @click="removeItem(idx)"
                            >
                                Remove
                            </a>
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
            </div>
        </div>

        <div class="group actions">
            <a
                class="btn positive"
                @click="store.save(); $emit('close')"
            >
                Save
            </a>
            <div class="hspace" />
            <a
                class="btn"
                @click="store.load(); $emit('close')"
            >
                Cancel
            </a>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.settings{
    display: grid;
    gap: $padding;
    max-height: 80vh;
    overflow-y: auto;
}

.group{
    display: grid;
    gap: $padding;

    &:not(:first-child){
        border-top: $border;
        padding-top: $padding;
    }

    &.actions{
        display: flex;
        gap: math.div($padding, 2);

        .hspace{
            flex: 1;
        }
    }
}

h1{
    font-size: 24px;
    font-weight: bold;
}

h2{
    font-size: 21px;
    font-weight: bold;
}

a.project-url{
    display: block;
    color: blue;
    text-decoration: none;

    &:hover{
        text-decoration: underline;
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
            font-size: 16px;
            line-height: 20px;
        }

        span{
            font-weight: normal;
            font-size: 12px;
            line-height: 16px;
        }
    }
}

.list-setting{
    display: grid;
    gap: math.div($padding, 2);
    width: 100%;

    .list-item{
        display: flex;
        gap: math.div($padding, 2);
        align-items: center;

        input,
        div{
            flex: 1;
        }
    }
}

input{
    font-weight: normal;

    border: $border;
    border-radius: $border-radius;
    padding: math.div($padding, 4);

    &:focus{
        border-color: black;
    }

    &:not([type='checkbox']){
        width: 100%;
    }
}

.btn{
    background-color: white;
    border: $border;
    border-radius: $border-radius;
    color: #111;
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

    &.negative{
        background: darkred;
        border-color: maroon;
        color: white;

        &:hover{
            background-color: maroon;
        }
    }
}
</style>
