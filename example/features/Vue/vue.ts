import Vue from 'vue';

import DemoComponent from './DemoComponent.vue';

import { store } from './vuex-store';

new Vue({
    components: { DemoComponent },
    store,
    data() {
        return {
            demo: true,
        };
    },
});
