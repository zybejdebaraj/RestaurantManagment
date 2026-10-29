<template>
  <header class="public-header"><nav class="public-nav container" aria-label="Main navigation">
    <router-link to="/" class="wordmark">resto<span>.</span></router-link>
    <button class="icon-button mobile-menu" aria-label="Toggle navigation" :aria-expanded="open" @click="open = !open"><AppIcon :name="open ? 'close' : 'list'" /></button>
    <div class="public-nav-links" :class="{ 'is-open': open }">
      <router-link to="/" exact-active-class="is-active">Home</router-link>
      <router-link to="/view-restaurants-menus" active-class="is-active">Discover restaurants</router-link>
      <span class="nav-divider"></span>
      <template v-if="signedIn"><router-link to="/home" class="button primary small">Open workspace <AppIcon name="arrow" /></router-link></template>
      <template v-else><router-link to="/login">Sign in</router-link><router-link to="/sign-up" class="button primary small">For restaurant owners <AppIcon name="arrow" /></router-link></template>
    </div>
  </nav></header>
</template>
<script>
import AppIcon from '../shared/AppIcon.vue';
export default { components: { AppIcon }, data: () => ({ open: false, signedIn: Boolean(localStorage.getItem('restaurant-token')) }), watch: { '$route.fullPath'() { this.open = false; this.signedIn = Boolean(localStorage.getItem('restaurant-token')); } } };
</script>
