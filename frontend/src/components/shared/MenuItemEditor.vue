<template>
  <ManagementLayout>
    <router-link to="/menu" class="back-link"><AppIcon name="back" /> Back to menu items</router-link>
    <div class="page-heading"><div><p class="eyebrow">SOMETHING WORTH TASTING</p><h1>{{ id ? 'Refine the details.' : 'Add a new favorite.' }}</h1><p>Give guests a taste of what makes your menu special.</p></div><span class="page-chip">{{ id ? 'Edit menu item' : 'New menu item' }}</span></div>
    <p v-if="error" class="notice error" role="alert">{{ error }} <button v-if="!loaded" class="text-button" @click="load">Try again</button></p>
    <p v-if="loading" class="notice">Preparing your menu…</p>
    <div v-else-if="loaded && !restaurants.length" class="empty-state panel"><span class="icon-tile large"><AppIcon name="restaurant" /></span><h2>A restaurant comes first.</h2><p>Create a restaurant, then start adding your dishes.</p><router-link to="/add" class="button primary">Add your restaurant <AppIcon name="arrow" /></router-link></div>
    <form v-else-if="loaded" class="editor-grid" @submit.prevent="save">
      <section class="panel form-panel"><div class="panel-heading"><span class="icon-tile"><AppIcon name="menu" /></span><div><h2>On the menu</h2><p>Keep it clear, tempting, and easy to explore.</p></div></div>
        <label class="field">Item name<input v-model="form.name" placeholder="e.g. Handmade mushroom ravioli" required maxlength="100" /></label>
        <div class="field-row"><label class="field">Restaurant<select v-model="form.restaurant_id" required><option disabled value="">Choose your restaurant</option><option v-for="restaurant in restaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.name }}</option></select></label><label class="field">Price ($)<input v-model="form.price" type="number" min="0" max="99999999.99" step="0.01" placeholder="0.00" required /></label></div>
        <label class="field">Category<input v-model="form.category" list="menu-categories" placeholder="e.g. Main Course" required maxlength="100" /><datalist id="menu-categories"><option v-for="category in categories" :key="category" :value="category" /></datalist></label>
        <label class="field">Description<textarea v-model="form.description" rows="4" maxlength="5000" placeholder="Ingredients, flavors, or a little story behind the dish…"></textarea><small>A short description helps guests choose with confidence.</small></label>
        <div class="form-actions"><router-link to="/menu" class="button secondary">Cancel</router-link><button class="button primary" :disabled="busy"><AppIcon name="check" />{{ busy ? 'Saving…' : id ? 'Save changes' : 'Add menu item' }}</button></div>
      </section>
      <aside><section class="panel form-panel"><h2>A feast for the eyes</h2><p class="muted">Show the dish at its delicious best.</p><ImagePicker v-model="form.image" /></section><div class="editor-tip"><AppIcon name="image" /><p>Use a bright, clear photo. A simple background keeps the focus on the food.</p></div></aside>
    </form>
  </ManagementLayout>
</template>
<script>
import ManagementLayout from './ManagementLayout.vue';
import AppIcon from './AppIcon.vue';
import ImagePicker from './ImagePicker.vue';
import http from '../../services/http';
const blank = () => ({ name: '', price: '', description: '', category: 'Main Course', restaurant_id: '', image: '' });
export default {
  components: { ManagementLayout, AppIcon, ImagePicker }, props: { id: [String, Number] },
  data: () => ({ form: blank(), restaurants: [], categories: ['Starters', 'Main Course', 'Desserts', 'Drinks', 'Sides'], loading: false, loaded: false, busy: false, error: '' }),
  watch: { id: { immediate: true, handler: 'load' } },
  methods: {
    async load() {
      const id = this.id;
      this.loading = true; this.loaded = false; this.error = ''; this.form = blank(); this.restaurants = [];
      try {
        const requests = [http.get('/restaurant?mine=1')];
        if (id) requests.push(http.get(`/menus/${id}`));
        const results = await Promise.all(requests);
        if (String(id) !== String(this.id)) return;
        this.restaurants = results[0].data;
        if (id) {
          const data = results[1].data;
          if (!this.restaurants.some(restaurant => Number(restaurant.id) === Number(data.restaurant_id))) { this.error = 'You can only edit menu items from your own restaurants.'; return; }
          this.form = { name: data.name, price: data.price, description: data.description || '', category: data.category || 'Main Course', restaurant_id: data.restaurant_id, image: data.image || '' };
        } else if (this.restaurants.length === 1) this.form.restaurant_id = this.restaurants[0].id;
        this.loaded = true;
      } catch (error) { if (String(id) === String(this.id)) this.error = error.response?.data?.error || 'We couldn’t load your menu details.'; }
      finally { if (String(id) === String(this.id)) this.loading = false; }
    },
    async save() {
      if (this.busy || !this.loaded) return;
      this.busy = true; this.error = '';
      try { const data = { ...this.form, price: Number(this.form.price) }; if (this.id) await http.put(`/menus/${this.id}`, data); else await http.post('/menus', data); await this.$router.push('/menu'); }
      catch (error) { this.error = error.response?.data?.error || 'We couldn’t save this menu item. Please try again.'; }
      finally { this.busy = false; }
    },
  },
};
</script>
