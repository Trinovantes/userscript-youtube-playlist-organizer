<script lang="ts">
import { defineComponent } from 'vue'
import { TITLE } from '@/Constants'

export default defineComponent({
    emits: [
        'close',
    ],

    setup() {
        return {
            TITLE,
            projectUrl: DEFINE.REPO.url,
        }
    },
})
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

        <div class="group actions">
            <div class="hspace" />

            <a
                class="btn"
                @click="$emit('close')"
            >
                Close
            </a>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.settings{
    display: grid;
    gap: $padding;
}

.group{
    display: grid;
    gap: math.div($padding, 2);

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

label{
    cursor: pointer;
    font-weight: bold;

    align-items: center;
    display: grid;
    gap: math.div($padding, 2);
    grid-template-columns: 1fr 2fr;
}

input{
    font-weight: normal;

    border: $border;
    border-radius: $border-radius;
    padding: math.div($padding, 4);

    &:focus{
        border-color: black;
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
