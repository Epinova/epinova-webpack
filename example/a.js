import Vue from 'vue';

import DemoComponent from './features/DemoComponent/DemoComponent.vue';
import { store } from './store';

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
