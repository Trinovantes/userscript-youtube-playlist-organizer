<script lang="ts" setup>
import { projectTitle } from '@/Constants'
import { ref } from 'vue'
import PlaylistOrganizer from './PlaylistOrganizer.vue'
import SettingsDialog from './SettingsDialog.vue'

const dialogRef = ref<HTMLDialogElement | null>(null)
</script>

<template>
    <dialog
        ref="dialogRef"
    >
        <SettingsDialog
            @close="dialogRef?.close()"
        />
    </dialog>

    <PlaylistOrganizer />

    <button
        class="settings-btn"
        :title="projectTitle"
        @click="dialogRef?.showModal()"
    >
        Settings
    </button>
</template>

<style lang="scss" scoped>
button.settings-btn{
    background-image: url('@/assets/img/settings.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: 50% 50%;
    border-radius: 50%;
    border: $border;
    cursor: pointer;
    display: block;
    overflow: hidden;
    text-decoration: none;
    text-indent: -9999px;
    transition: 0.25s;
    width: $btn-size; height: $btn-size;

    position: fixed;
    z-index: 9999;
    bottom: $padding;
    right: $padding;

    background-color: white;
    box-shadow: rgba(11, 11, 11, 0.1) 0 2px 8px;

    &:hover{
        background-color: #eee;
        box-shadow: rgba(11, 11, 11, 0.4) 0 0px 8px;
    }
}
</style>
