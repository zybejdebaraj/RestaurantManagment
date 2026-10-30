<template>
  <aside class="workspace-sidebar">
    <router-link to="/home" class="wordmark light">resto<span>.</span></router-link>
    <div class="workspace-label"><span class="status-dot"></span> OWNER WORKSPACE</div>
    <nav class="workspace-nav" aria-label="Workspace navigation">
      <router-link to="/home" :class="{ selected: $route.name === 'UserHome' }"><AppIcon name="grid" /> Overview</router-link>
      <router-link to="/restaurants" :class="{ selected: ['restaurants','Add','Update'].includes($route.name) }"><AppIcon name="restaurant" /> Restaurants</router-link>
      <router-link to="/menu" :class="{ selected: ['Menu','AddMenu','UpdateMenu'].includes($route.name) }"><AppIcon name="menu" /> Menu items</router-link>
      <router-link to="/tables" :class="{ selected: $route.name === 'Tables' }"><AppIcon name="table" /> Tables</router-link>
      <router-link to="/orders" :class="{ selected: $route.name === 'Orders' }"><AppIcon name="orders" /> Orders</router-link>
      <span class="nav-section-label">QUICK ACTIONS</span>
      <router-link to="/add"><AppIcon name="plus" /> Add a restaurant</router-link>
      <router-link to="/addmenu"><AppIcon name="plus" /> Add a menu item</router-link>
    </nav>
    <div class="sidebar-bottom"><div class="sidebar-note"><AppIcon name="restaurant" /><strong>Make a good first impression.</strong><p>Your listings and menus help guests discover what makes you special.</p><router-link to="/view-restaurants-menus">View public site <AppIcon name="external" /></router-link></div>
      <div class="sidebar-profile"><span class="avatar">{{ initial }}</span><div><strong>{{ userName }}</strong><small>Restaurant owner</small></div></div>
    </div>
  </aside>
</template>
<script>
import AppIcon from '../shared/AppIcon.vue';
import { currentUser } from '../../services/session';
export default { components: { AppIcon }, data: () => ({ userName: currentUser()?.name || 'Your workspace' }), computed: { initial() { return this.userName.charAt(0).toUpperCase(); } } };
</script>
