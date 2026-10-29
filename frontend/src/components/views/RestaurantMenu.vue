<template>
  <div class="container menu-page">
    <router-link to="/view-restaurants-menus" class="back-link"><AppIcon name="back" /> Back to restaurants</router-link>
    <p v-if="error" class="notice error" role="alert">{{ error }} <button class="text-link" @click="load">Try again</button></p><div v-else-if="loading" class="loading-state">Setting the table…</div>
    <template v-else-if="restaurant">
      <section class="menu-hero"><img :src="restaurant.image || '/images/restaurant-placeholder.svg'" :alt="restaurant.name" /><div class="menu-hero-copy"><span class="eyebrow">WELCOME TO THE TABLE</span><h1>{{ restaurant.name }}</h1><p><AppIcon name="pin" />{{ restaurant.address }}</p><p><AppIcon name="restaurant" />{{ restaurant.contact }}</p></div></section>
      <div class="menu-tools"><div class="category-tabs" aria-label="Menu categories"><button v-for="category in categories" :key="category" :class="{ active: selected === category }" :aria-pressed="selected === category" @click="selected = category">{{ category }}</button></div><label class="search-field"><AppIcon name="search" /><input v-model="search" aria-label="Search menu" placeholder="Find something delicious…" /></label></div>
      <p v-if="message" class="message-inline" role="status">{{ message }}</p>
      <div v-if="filtered.length" class="dish-grid"><article v-for="item in filtered" :key="item.id" class="dish-card"><div class="dish-photo"><img :src="item.image || '/images/menu-placeholder.svg'" :alt="item.name" loading="lazy" /><button class="icon-button" :class="{ saved: isFavorite(item.id) }" :aria-label="(isFavorite(item.id) ? 'Unsave ' : 'Save ') + item.name" :aria-pressed="isFavorite(item.id)" @click="toggleFavorite(item)"><AppIcon name="heart" /></button></div><div class="dish-copy"><p class="eyebrow">{{ item.category || 'FROM OUR KITCHEN' }}</p><h2>{{ item.name }}</h2><p>{{ item.description || 'Made with care, served with a warm welcome.' }}</p><div class="dish-bottom"><span class="dish-price">{{ money(item.price) }}</span><button @click="share(item)">Share dish <AppIcon name="external" /></button></div></div></article></div>
      <div v-else class="empty-state public-empty"><span class="icon-tile large"><AppIcon name="menu" /></span><h2>{{ menus.length ? 'No dishes match your search.' : 'The menu is on its way.' }}</h2><p>{{ menus.length ? 'Try another category or search term.' : 'Check back soon to see what’s cooking.' }}</p><button v-if="menus.length" class="button secondary" @click="search = ''; selected = 'All items'">Show all dishes</button></div>
      <section class="review-panel panel form-panel"><h2>How was your experience?</h2><p class="muted">Share a rating to help others discover this restaurant.</p><form v-if="signedIn" @submit.prevent="review"><div class="field-row"><label class="field">Your rating<select v-model="rating" required><option value="" disabled>Choose a rating</option><option v-for="value in 5" :key="value" :value="value">{{ value }} {{ value === 1 ? 'star' : 'stars' }}</option></select></label><label class="field">Your review (optional)<input v-model="reviewText" maxlength="3000" placeholder="What did you enjoy?" /></label></div><button class="button primary" :disabled="reviewBusy">{{ reviewBusy ? 'Saving…' : 'Share your review' }}</button><p v-if="reviewMessage" class="message-inline" role="status">{{ reviewMessage }}</p></form><router-link v-else to="/login" class="text-link">Sign in to leave a review <AppIcon name="arrow" /></router-link></section>
    </template>
  </div>
</template>
<script>
import http from '../../services/http';
import AppIcon from '../shared/AppIcon.vue';
export default {
  components: { AppIcon },
  data: () => ({ restaurant: null, menus: [], loadRequest: 0, selected: 'All items', search: '', loading: true, error: '', favorites: [], message: '', rating: '', reviewText: '', reviewBusy: false, reviewMessage: '', signedIn: Boolean(localStorage.getItem('restaurant-token')) }),
  computed: {
    categories() { return ['All items', ...new Set(this.menus.map(item => item.category).filter(Boolean))]; },
    filtered() { const query = this.search.trim().toLowerCase(); return this.menus.filter(item => (this.selected === 'All items' || item.category === this.selected) && `${item.name} ${item.description || ''}`.toLowerCase().includes(query)); }
  },
  watch: { '$route.params.id': 'load' },
  mounted() { try { const saved = JSON.parse(localStorage.getItem('favorites') || '[]'); this.favorites = Array.isArray(saved) ? saved.filter(item => item && item.id) : []; } catch { this.favorites = []; } this.load(); },
  methods: {
    money(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)); },
    async load() {
      const request = ++this.loadRequest;
      const id = this.$route.params.id;
      if (!id) return;
      this.loading = true; this.error = ''; this.restaurant = null; this.menus = [];
      this.selected = 'All items'; this.search = ''; this.message = '';
      this.rating = ''; this.reviewText = ''; this.reviewMessage = ''; this.reviewBusy = false;
      try {
        const [restaurant, menus] = await Promise.all([http.get(`/restaurant/${id}`), http.get(`/menus/restaurant/${id}`)]);
        if (request !== this.loadRequest) return;
        this.restaurant = restaurant.data; this.menus = menus.data;
      } catch (error) {
        if (request === this.loadRequest) this.error = error.response?.status === 404 ? 'This restaurant could not be found.' : 'We couldn’t load this menu. Please try again.';
      } finally { if (request === this.loadRequest) this.loading = false; }
    },
    isFavorite(id) { return this.favorites.some(item => Number(item.id) === Number(id)); },
    toggleFavorite(item) { const next = this.isFavorite(item.id) ? this.favorites.filter(saved => Number(saved.id) !== Number(item.id)) : [...this.favorites, { id: item.id, name: item.name }]; try { localStorage.setItem('favorites', JSON.stringify(next)); this.favorites = next; this.message = this.isFavorite(item.id) ? `${item.name} saved on this device.` : `${item.name} removed from your favorites.`; } catch { this.message = 'This browser couldn’t save your favorite. Please check available storage.'; } },
    async share(item) { const url = `${window.location.origin}/restaurant/${this.restaurant.id}/menu`; try { if (navigator.share) await navigator.share({ title: item.name, text: `Try ${item.name} at ${this.restaurant.name}.`, url }); else { await navigator.clipboard.writeText(`${item.name} at ${this.restaurant.name}: ${url}`); this.message = 'Menu link copied. Share it with someone hungry.'; } } catch (error) { if (error.name !== 'AbortError') this.message = 'Sharing is unavailable in this browser. You can copy the page address instead.'; } },
    async review() {
      if (this.reviewBusy || !this.restaurant) return;
      const request = this.loadRequest;
      const restaurantId = this.restaurant.id;
      this.reviewBusy = true; this.reviewMessage = '';
      try {
        await http.post('/reviews', { restaurantId, rating: Number(this.rating), text: this.reviewText });
        if (request === this.loadRequest) this.reviewMessage = 'Thank you! Your rating has been saved.';
      } catch (error) {
        if (request === this.loadRequest) this.reviewMessage = error.response?.data?.error || 'We couldn’t save your review. Please try again.';
      } finally { if (request === this.loadRequest) this.reviewBusy = false; }
    }
  }
};
</script>
