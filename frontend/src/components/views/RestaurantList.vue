<template>
  <div class="container">
    <div class="page-intro"><p class="eyebrow">A LITTLE INSPIRATION FOR YOUR NEXT MEAL</p><h1>Find a place. Make a memory.</h1><p>Discover restaurants, explore their menus, and find your next favorite dish. There’s something good waiting for you.</p></div>
    <div class="discovery-toolbar"><label class="search-field"><AppIcon name="search" /><input v-model="search" placeholder="Search by restaurant or location…" aria-label="Search restaurants" /></label><span>{{ filtered.length }} {{ filtered.length === 1 ? 'restaurant' : 'restaurants' }} to discover</span></div>
    <div v-if="error" class="notice error" role="alert">{{ error }} <button class="text-link" @click="load">Try again</button></div><div v-else-if="loading" class="loading-state">Finding good places…</div>
    <div v-else-if="filtered.length" class="public-grid"><router-link v-for="restaurant in filtered" :key="restaurant.id" :to="`/restaurant/${restaurant.id}/menu`" class="discovery-card"><img :src="restaurant.image || '/images/restaurant-placeholder.svg'" :alt="restaurant.name" loading="lazy" /><div class="discovery-card-body"><div class="card-kicker"><span>DISCOVER SOMETHING GOOD</span><span class="card-rating"><AppIcon name="star" />{{ restaurant.reviewCount ? Number(restaurant.rating).toFixed(1) + ' (' + restaurant.reviewCount + ')' : 'New listing' }}</span></div><h2>{{ restaurant.name }}</h2><p class="card-address"><AppIcon name="pin" />{{ restaurant.address }}</p><div class="card-tags"><span v-for="category in categoriesFor(restaurant.id)" :key="category">{{ category }}</span><span v-if="!categoriesFor(restaurant.id).length">Menu coming soon</span></div><span class="card-link">Explore menu <AppIcon name="arrow" /></span></div></router-link></div>
    <div v-else class="empty-state public-empty"><span class="icon-tile large"><AppIcon name="restaurant" /></span><h2>{{ search ? 'No matches this time.' : 'Something good is on the way.' }}</h2><p>{{ search ? 'Try another restaurant name or location.' : 'Restaurants will appear here as owners add their listings.' }}</p><button v-if="search" class="button secondary" @click="search = ''">Clear search</button><router-link v-else to="/sign-up" class="button primary">Add your restaurant <AppIcon name="plus" /></router-link></div>
    <p class="discovery-note"><AppIcon name="heart" /> A new favorite could be just around the corner.</p>
  </div>
</template>
<script>
import http from '../../services/http';
import AppIcon from '../shared/AppIcon.vue';
export default {
  components: { AppIcon },
  data: () => ({ restaurants: [], menus: [], search: '', loading: true, error: '' }),
  computed: { filtered() { const query = this.search.trim().toLowerCase(); return this.restaurants.filter(item => `${item.name} ${item.address}`.toLowerCase().includes(query)); } },
  mounted() { this.load(); },
  methods: {
    categoriesFor(id) { return [...new Set(this.menus.filter(item => Number(item.restaurant_id) === Number(id)).map(item => item.category).filter(Boolean))].slice(0, 3); },
    async load() { this.loading = true; this.error = ''; try { const [restaurants, menus] = await Promise.all([http.get('/restaurant'), http.get('/menus')]); this.restaurants = restaurants.data; this.menus = menus.data; } catch { this.error = 'We couldn’t load the restaurants. Please try again.'; } finally { this.loading = false; } }
  }
};
</script>
