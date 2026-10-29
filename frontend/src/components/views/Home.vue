<template>
  <ManagementLayout>
    <div class="page-heading"><div><p class="eyebrow">{{ dateLabel }}</p><h1>A good day to serve something great.</h1><p>Welcome back, {{ firstName }}. Here’s what’s on your table.</p></div><router-link to="/add" class="button primary"><AppIcon name="plus" /> Add restaurant</router-link></div>
    <p v-if="error" class="notice error" role="alert">{{ error }} <button class="text-button" @click="load">Try again</button></p>
    <div class="stats-grid"><div v-for="stat in stats" :key="stat.label" class="stat-card"><div class="stat-top"><span>{{ stat.label }}</span><span class="icon-tile small" :class="stat.color"><AppIcon :name="stat.icon" /></span></div><strong>{{ loading || error ? '—' : stat.value }}</strong><small>{{ stat.note }}</small></div></div>
    <div v-if="!loading && !error" class="dashboard-grid">
      <section class="panel"><div class="section-heading"><div><p class="eyebrow">YOUR PLACES</p><h2>A little hospitality, everywhere.</h2></div><router-link to="/restaurants" class="text-link">View all <AppIcon name="arrow" /></router-link></div>
        <div v-if="restaurants.length" class="dashboard-restaurants"><router-link v-for="restaurant in restaurants.slice(0, 3)" :key="restaurant.id" :to="`/update/${restaurant.id}`" class="restaurant-mini"><img :src="restaurant.image || '/images/restaurant-placeholder.svg'" :alt="restaurant.name" /><div><h3>{{ restaurant.name }}</h3><p><AppIcon name="pin" />{{ restaurant.address }}</p><span class="pill">{{ menuCount(restaurant.id) }} {{ menuCount(restaurant.id) === 1 ? 'menu item' : 'menu items' }}</span></div><AppIcon name="chevron" /></router-link></div>
        <div v-else class="empty-state compact"><span class="icon-tile large"><AppIcon name="restaurant" /></span><h3>Your first restaurant starts here.</h3><p>Add your place and give guests a reason to stop by.</p><router-link to="/add" class="button primary small">Create your first listing <AppIcon name="arrow" /></router-link></div>
      </section>
      <aside class="owner-promo"><span class="promo-icon"><AppIcon name="menu" /></span><p class="light-eyebrow">MAKE IT DELICIOUS</p><h2>A menu they’ll<br />come back for.</h2><p>Fresh photos and thoughtful descriptions make every dish feel a little more special.</p><router-link to="/addmenu" class="button cream">Add a menu item <AppIcon name="arrow" /></router-link><div class="promo-decoration" aria-hidden="true">✳</div></aside>
    </div>
    <div v-if="!loading && !error" class="dashboard-grid lower">
      <section class="panel"><div class="section-heading"><div><p class="eyebrow">FRESH ON THE MENU</p><h2>Your latest additions</h2></div><router-link to="/menu" class="text-link">Manage menu <AppIcon name="arrow" /></router-link></div><div v-if="menus.length" class="recent-items"><router-link v-for="item in menus.slice(0,4)" :key="item.id" :to="`/updatemenu/${item.id}`" class="recent-item"><img :src="item.image || '/images/menu-placeholder.svg'" :alt="item.name" /><div><strong>{{ item.name }}</strong><small>{{ item.category }}</small></div><b>{{ money(item.price) }}</b></router-link></div><div v-else class="empty-state compact"><span class="icon-tile"><AppIcon name="menu" /></span><h3>Something delicious is on the way.</h3><p>Your menu items will appear here once you add them.</p></div></section>
      <section class="panel"><div class="section-heading"><div><p class="eyebrow">A BALANCED OFFERING</p><h2>Your menu mix</h2></div></div><div v-if="mix.length" class="menu-mix"><div v-for="(category,index) in mix" :key="category.name"><div class="mix-label"><span><i :style="{background: colors[index % colors.length]}" />{{ category.name }}</span><strong>{{ category.count }}</strong></div><div class="mix-track"><span :style="{ width: `${category.count / menus.length * 100}%`, background: colors[index % colors.length] }"></span></div></div></div><p v-else class="muted mix-empty">Organize dishes into categories to see how your menu comes together.</p><div class="quiet-note"><AppIcon name="check" /> Listings update on the public site when you save.</div></section>
    </div>
  </ManagementLayout>
</template>
<script>
import ManagementLayout from '../shared/ManagementLayout.vue';
import AppIcon from '../shared/AppIcon.vue';
import http from '../../services/http';
import { currentUser } from '../../services/session';
export default {
  components: { ManagementLayout, AppIcon }, data: () => ({ restaurants: [], menus: [], error: '', loading: true, colors: ['#315e4c','#c67a55','#d5b56c','#8da893'], name: currentUser()?.name || 'there' }),
  computed: {
    firstName() { return this.name.split(' ')[0]; },
    dateLabel() { return new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' }).toUpperCase(); },
    mix() { const counts = new Map(); this.menus.forEach(item => counts.set(item.category || 'Other', (counts.get(item.category || 'Other') || 0) + 1)); return Array.from(counts, ([name,count]) => ({name,count})).sort((a,b)=>b.count-a.count); },
    stats() { return [{label:'Your restaurants',value:this.restaurants.length,note:'Places with your personal touch',icon:'restaurant',color:'green'},{label:'Menu items',value:this.menus.length,note:'Dishes ready to be discovered',icon:'menu',color:'orange'},{label:'Menu categories',value:this.mix.length,note:'A little variety for every guest',icon:'list',color:'gold'},{label:'Average item price',value:this.money(this.menus.length ? this.menus.reduce((sum,item)=>sum+Number(item.price),0)/this.menus.length : 0),note:'Across your current menu',icon:'money',color:'green'}]; },
  }, mounted() { this.load(); },
  methods: { money(value) { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value)||0); }, menuCount(id) { return this.menus.filter(item=>Number(item.restaurant_id)===Number(id)).length; }, async load() { this.error=''; this.loading=true; try { const [restaurants,menus]=await Promise.all([http.get('/restaurant?mine=1'),http.get('/menus?mine=1')]);this.restaurants=restaurants.data;this.menus=menus.data; } catch(error) { this.error=error.response?.data?.error || 'We couldn’t load your overview.'; } finally {this.loading=false;} } },
};
</script>
