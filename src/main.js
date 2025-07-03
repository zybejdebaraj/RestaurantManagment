import Vue from 'vue'
import App from './App.vue'
import './assets/css/styles.css'
import router from './components/router/routers'; 

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
