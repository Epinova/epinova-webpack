<template>
    <div>
        <h1>{{ heading }}</h1>
        <p>{{ active ? 'active' : 'not-active' }}</p>
        <button @click="active = !active" type="button">toggle active</button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        heading: String,
        active: Boolean,
    },
    data() {
        return {
            active: false,
        };
    },
});
</script>
