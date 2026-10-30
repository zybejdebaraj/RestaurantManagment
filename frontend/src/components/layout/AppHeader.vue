<template>
  <header class="workspace-header"><div class="breadcrumb">Workspace <span>/</span><strong>{{ title }}</strong></div><div class="header-actions"><router-link to="/view-restaurants-menus" class="header-public-link">View public site <AppIcon name="external" /></router-link><span class="header-divider"></span><button class="icon-button" aria-label="Sign out" @click="logout"><AppIcon name="logout" /></button><span class="avatar small">{{ initial }}</span></div></header>
</template>
<script>
import AppIcon from '../shared/AppIcon.vue';
import { currentUser, clearSession } from '../../services/session';
const titles = { UserHome: 'Overview', restaurants: 'Restaurants', Add: 'New restaurant', Update: 'Edit restaurant', Menu: 'Menu items', AddMenu: 'New menu item', UpdateMenu: 'Edit menu item', Tables: 'Tables', Orders: 'Orders' };
export default { components: { AppIcon }, computed: { title() { return titles[this.$route.name] || 'Overview'; }, initial() { return (currentUser()?.name || 'R').charAt(0).toUpperCase(); } }, methods: { logout() { clearSession(); this.$router.push('/login'); } } };
</script>
