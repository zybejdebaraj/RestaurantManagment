<template>
  <ManagementLayout>
    <div class="page-heading"><div><p class="eyebrow">MAKE ROOM FOR YOUR GUESTS</p><h1>Tables</h1><p>Arrange your floor and see which tables are ready for service.</p></div><button class="button secondary" :disabled="loading || busy || initializing" @click="refresh">Refresh availability</button></div>
    <p v-if="error" class="notice error" role="alert">{{ error }} <button class="text-button" :disabled="loading || busy || initializing" @click="refresh">Try again</button></p>
    <p v-if="message" class="notice" role="status">{{ message }}</p>
    <label class="field operations-restaurant">Restaurant<select v-model="restaurantId" :disabled="busy || initializing" @change="changeRestaurant"><option v-for="restaurant in restaurants" :key="restaurant.id" :value="String(restaurant.id)">{{ restaurant.name }}</option></select></label>
    <p v-if="initializing" class="loading-state">Loading your restaurants…</p>
    <div v-else-if="!restaurants.length && !error" class="panel empty-state"><h2>Start with a restaurant.</h2><p>Add a restaurant before setting up its tables.</p><router-link class="button primary" to="/add">Add restaurant</router-link></div>
    <div v-else-if="restaurantId" class="operations-grid">
      <section class="panel form-panel">
        <h2>{{ editing ? 'Edit table' : 'Add a table' }}</h2><p class="muted">Availability updates automatically as orders are opened and closed.</p>
        <form @submit.prevent="save"><fieldset :disabled="busy">
          <label class="field">Table name<input v-model="form.name" required maxlength="50" placeholder="e.g. Terrace 1" /></label>
          <label class="field">Seats<input v-model.number="form.capacity" type="number" min="1" max="500" step="1" required /></label>
          <div class="form-actions"><button v-if="editing" type="button" class="button secondary" @click="reset">Cancel edit</button><button class="button primary" :disabled="loading">{{ busy ? 'Saving…' : editing ? 'Save table' : 'Add table' }}</button></div>
        </fieldset></form>
      </section>
      <section class="panel">
        <div class="table-toolbar"><div><h2>Your floor <span class="count-badge">{{ tables.length }}</span></h2><p>{{ available }} available · {{ tables.length - available }} occupied</p></div></div>
        <p v-if="loading" class="loading-state">Loading tables…</p>
        <div v-else-if="!error && !tables.length" class="empty-state"><h2>A fresh floor plan.</h2><p>Add your first table using the form.</p></div>
        <div v-else-if="tables.length" class="floor-grid">
          <article v-for="table in tables" :key="table.id" class="floor-table" :class="{ occupied: table.status === 'occupied' }">
            <div class="order-card-heading"><span class="icon-tile"><AppIcon name="table" /></span><span class="pill" :class="{ neutral: table.status === 'occupied' }">{{ table.status }}</span></div>
            <h3>{{ table.name }}</h3><p>{{ table.capacity }} {{ table.capacity === 1 ? 'seat' : 'seats' }}</p>
            <router-link v-if="table.active_order_id" class="text-link" :to="{ path: '/orders', query: { restaurant: restaurantId, order: table.active_order_id } }">View order #{{ table.active_order_id }} <AppIcon name="arrow" /></router-link>
            <router-link v-else class="text-link" :to="{ path: '/orders', query: { restaurant: restaurantId, table: table.id } }">Start an order <AppIcon name="arrow" /></router-link>
            <div class="form-actions"><button class="text-button" :disabled="busy || table.status === 'occupied'" @click="edit(table)">Edit</button><button class="text-button delete-action" :disabled="busy || table.status === 'occupied'" @click="target = table">Delete</button></div>
          </article>
        </div>
      </section>
    </div>
    <ConfirmDialog :open="Boolean(target)" title="Remove this table?" :message="target ? `${target.name} will be removed. Past orders will retain its name.` : ''" :busy="busy" @cancel="target = null" @confirm="remove" />
  </ManagementLayout>
</template>

<script>
import ManagementLayout from '../shared/ManagementLayout.vue';
import ConfirmDialog from '../shared/ConfirmDialog.vue';
import AppIcon from '../shared/AppIcon.vue';
import http from '../../services/http';

export default {
  components: { ManagementLayout, ConfirmDialog, AppIcon },
  data: () => ({ restaurants: [], restaurantId: '', tables: [], initializing: true, loading: false, busy: false, error: '', message: '', editing: null, target: null, form: { name: '', capacity: 2 }, loadId: 0 }),
  computed: { available() { return this.tables.filter(table => table.status === 'available').length; } },
  async mounted() { await this.initialize(); },
  beforeUnmount() { this.loadId++; },
  methods: {
    async initialize() {
      this.initializing = true; this.error = "";
      try {
        this.restaurants = (await http.get('/restaurant?mine=1')).data;
        this.restaurantId = String(this.restaurants.find(restaurant => String(restaurant.id) === this.$route.query.restaurant)?.id || this.restaurants[0]?.id || '');
        await this.loadTables();
      } catch (error) { this.error = error.response?.data?.error || 'We couldn’t load your restaurants.'; }
      finally { this.initializing = false; }
    },
    async refresh() {
      if (this.busy || this.loading || this.initializing) return;
      if (!this.restaurantId) await this.initialize();
      else await this.loadTables();
    },
    reset() { this.editing = null; this.form = { name: '', capacity: 2 }; },
    changeRestaurant() { this.reset(); this.target = null; this.message = ''; this.tables = []; this.loadTables(); },
    edit(table) { this.editing = table.id; this.form = { name: table.name, capacity: table.capacity }; this.message = ''; },
    async loadTables() {
      if (!this.restaurantId) return;
      const loadId = ++this.loadId;
      this.loading = true; this.error = '';
      try {
        const { data } = await http.get('/tables', { params: { restaurant_id: this.restaurantId } });
        if (loadId === this.loadId) this.tables = data;
      } catch (error) { if (loadId === this.loadId) this.error = error.response?.data?.error || 'We couldn’t load the tables. Try refreshing.'; }
      finally { if (loadId === this.loadId) this.loading = false; }
    },
    async save() {
      if (this.busy) return;
      this.busy = true; this.error = ''; this.message = '';
      try {
        if (this.editing) await http.put(`/tables/${this.editing}`, this.form);
        else await http.post('/tables', { ...this.form, restaurant_id: Number(this.restaurantId) });
        this.reset(); this.message = 'Table saved.'; await this.loadTables();
      } catch (error) { this.error = error.response?.data?.error || 'We couldn’t save this table.'; }
      finally { this.busy = false; }
    },
    async remove() {
      if (!this.target || this.busy) return;
      this.busy = true; this.error = ''; this.message = '';
      try {
        await http.delete(`/tables/${this.target.id}`);
        if (this.editing === this.target.id) this.reset();
        this.target = null; this.message = 'Table deleted.'; await this.loadTables();
      } catch (error) { this.target = null; this.error = error.response?.data?.error || 'We couldn’t delete this table.'; }
      finally { this.busy = false; }
    },
  },
};
</script>
