<template>
    <div>
        <div class="group actions">
            <div class="hspace" />
            <a
                class="btn"
                @click="onClose"
            >
                Close
            </a>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    emits: [
        'close',
    ],

    setup(props, { emit }) {
        const onClose = () => {
            emit('close')
        }

        return {
            onClose,
        }
    },
})
</script>

<style lang="scss" scoped>
.group{
    border-top: $border;
    padding: $padding 0;

    &:last-child{
        padding-bottom: 0;
    }
}

.actions{
    display: flex;
    gap: $padding / 2;

    .hspace{
        flex: 1;
    }
}

label{
    @extend .margins;

    align-items: center;
    display: grid;
    cursor: pointer;
    font-weight: bold;
    gap: $padding / 2;
    grid-template-columns: 1fr 3fr;
}

input{
    border: $border;
    border-radius: $border-radius;
    padding: $padding / 4;

    &:focus{
        border-color: black;
    }
}
</style>
