<template>
  <div id="app" :class="{ 'is-workspace': !isPublic }">
    <AuthNavbar v-if="isPublic" />
    <div class="app-content"><router-view /></div>
    <AppFooter :workspace="!isPublic" />
  </div>
</template>
<script>
import AuthNavbar from './components/layout/AuthNavbar.vue';
import AppFooter from './components/layout/AppFooter.vue';
const publicPages = new Set(['Landing', 'Login', 'SignUp', 'RestaurantList', 'RestaurantMenu', 'NotFound']);
export default {
  components: { AuthNavbar, AppFooter },
  computed: { isPublic() { return publicPages.has(this.$route.name); } },
  mounted() { window.addEventListener('restaurant-session-expired', this.sessionExpired); },
  beforeUnmount() { window.removeEventListener('restaurant-session-expired', this.sessionExpired); },
  methods: { sessionExpired() { if (this.$route.name !== 'Login') this.$router.replace({ name: 'Login', query: { reason: 'expired', redirect: this.$route.fullPath } }); } },
};
</script>
