import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import { preset } from 'vue-cli-plugin-vuetify-preset-rally/preset';
Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        preset,
        dark: false,
        themes: {
            dark: {
                primary: '#182126',
                secondary: '#b0bec5',
                accent: '#8c9eff',
                error: '#b71c1c',
            },
        }
    }
});
