<template>
    <div class="group actions">
        <div class="hspace" />
        <a
            class="btn"
            @click="$emit('close')"
        >
            Close
        </a>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    emits: [
        'close',
    ],
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
    gap: math.div($padding, 2);

    .hspace{
        flex: 1;
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
</style>
