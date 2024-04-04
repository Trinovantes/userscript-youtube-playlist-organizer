<script lang="ts" setup>
import { useStore } from '@/store/useStore'
import { onMounted, ref } from 'vue'
import { findAllPlaylists } from './findAllPlaylists'

const store = useStore()
const isFinished = ref(true)
const parsePage = async() => {
    console.groupCollapsed(DEFINE.NAME, 'AllPlaylistsPage.vue', 'parsePage')
    isFinished.value = false

    try {
        const foundPlaylists = await findAllPlaylists()
        console.info('foundPlaylists', [...foundPlaylists])
        store.userPlaylists = foundPlaylists
        await store.save()
    } catch (err: unknown) {
        console.warn(err)
    }

    isFinished.value = true
    console.groupEnd()
}

onMounted(async() => {
    if (store.userPlaylists.length > 0) {
        return
    }

    await parsePage()
})
</script>

<template>
    <div
        class="progress"
    >
        <h1
            v-if="!isFinished"
            class="flex-hgap"
        >
            <span class="spinner" />
            <strong>
                Parsing Playlists
            </strong>
        </h1>

        <h1
            v-else
            class="flex-hgap"
        >
            Found {{ store.userPlaylists.length }} Playlists

            <button
                @click.cancel="parsePage"
            >
                Refresh
            </button>
        </h1>
    </div>
</template>

<style lang="scss" scoped>
@keyframes rotation {
    from {
        transform: rotate(0deg);
    } to {
        transform: rotate(360deg);
    }
}

.spinner{
    width: 48px;
    height: 48px;
    border: 10px solid #fff;
    border-bottom-color: red;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

.progress{
    position: fixed;
    z-index: 99;
    bottom: $padding;
    right: $padding;

    h1{
        align-items: center;
        border: $border;
        padding: $padding;

        button{
            border: $border;
            cursor: pointer;
            font-weight: bold;
            padding: 10px;
        }
    }
}
</style>
