<template>
  <main class="container"><div class="page-intro"><p class="eyebrow">404 · PAGE NOT FOUND</p><h1>This table hasn’t been set.</h1><p>The page may have moved, or the address may be incorrect. Let’s get you back to a familiar place.</p><div class="hero-buttons" style="justify-content:center"><router-link to="/" class="button primary">Back to home <AppIcon name="arrow" /></router-link><router-link to="/view-restaurants-menus" class="button secondary">Discover restaurants</router-link></div></div></main>
</template>
<script>
import AppIcon from '../shared/AppIcon.vue';
export default { components: { AppIcon } };
</script>
