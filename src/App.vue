<template>
  <div id="app">
    <AuthNavbar v-if="showAuthNavbar" />
    <div class="app-content">
    <router-view /> <!-- Main page content -->
    <AppFooter v-if="showFooter" />    <!-- Footer included here -->
    </div>
  </div>
</template>

<script>
// Import the footer component
import AppFooter from './components/layout/AppFooter.vue';
import AuthNavbar from './components/layout/AuthNavbar.vue';
export default {
  name: 'App',
  components: {
    AppFooter,
    AuthNavbar
   }, // Register the footer component
    computed: {
    showFooter() {
      // Hide footer on login and sign-up routes
      return !['/login', '/sign-up'].includes(this.$route.path)
    },
    showAuthNavbar() {
      return ['/login', '/sign-up'].includes(this.$route.path)
    }
  }
  
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
