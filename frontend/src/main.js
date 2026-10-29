import { createApp } from 'vue';
import App from './App.vue';
import './assets/css/theme.css';
import router from './components/router/routers';

createApp(App).use(router).mount('#app');
