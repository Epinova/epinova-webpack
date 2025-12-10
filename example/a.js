import Vue from 'vue';

import DemoComponent from './features/Vue/DemoComponent.vue';
import { store } from './features/Vue/vuex-store';

new Vue({
    components: {
        DemoComponent,
    },
    store,
    data() {
        return 'application';
    },
    template: `<DemoComponent />`,
});
