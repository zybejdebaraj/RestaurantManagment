<template>
  <ManagementLayout>
    <div class="page-heading"><div><p class="eyebrow">FROM FIRST BITE TO LAST</p><h1>Orders</h1><p>Take an order, follow its progress, and keep service moving.</p></div><button class="button secondary" :disabled="loading || busy" @click="loadOrders">Refresh orders</button></div>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p><p v-if="message" class="notice" role="status">{{ message }}</p>
    <label class="field operations-restaurant">Restaurant<select v-model="restaurantId" :disabled="busy || initializing" @change="changeRestaurant"><option v-for="restaurant in restaurants" :key="restaurant.id" :value="String(restaurant.id)">{{ restaurant.name }}</option></select></label>
    <p v-if="initializing" class="loading-state">Loading your restaurants…</p>
    <div v-else-if="!restaurants.length && !error" class="panel empty-state"><h2>Start with a restaurant.</h2><p>Add a restaurant and menu items to start taking orders.</p><router-link to="/add" class="button primary">Add restaurant</router-link></div>
    <div v-else-if="restaurantId" class="operations-grid">
      <section class="panel form-panel">
        <h2>{{ editing ? `Edit order #${editing}` : 'New order' }}</h2><p class="muted">Current menu prices are applied when you save. Items can be edited until preparation starts.</p>
        <p v-if="!loading && !menus.length" class="notice">Add dishes to this restaurant’s <router-link to="/addmenu" class="text-link">menu</router-link> to take orders.</p>
        <form @submit.prevent="save"><fieldset :disabled="busy || loading">
          <template v-if="!editing">
            <label class="field">Table<select v-model="draft.table_id"><option value="">Takeaway / no table</option><option v-if="selectedUnavailable" :value="draft.table_id" disabled>{{ selectedTable?.name || 'Selected table' }} · unavailable</option><option v-for="table in availableTables" :key="table.id" :value="String(table.id)">{{ table.name }} · {{ table.capacity }} seats</option></select><small v-if="selectedUnavailable">This table is no longer available. Choose another table.</small></label>
            <label class="field">Guests<input v-model.number="draft.guests" type="number" min="1" :max="selectedTable?.capacity || 500" step="1" required /></label>
            <label class="field">Order notes<textarea v-model="draft.notes" rows="2" maxlength="2000" placeholder="Allergies, special requests…" /></label>
          </template>
          <label class="field">Menu item<select v-model="menuId"><option value="" disabled>Choose a dish</option><option v-for="menu in menus" :key="menu.id" :value="String(menu.id)">{{ menu.name }} · {{ money(menu.price) }}</option></select></label>
          <button type="button" class="button secondary small" :disabled="!menuId" @click="addItem">Add item</button>
          <ul v-if="draft.items.length" class="order-draft-items"><li v-for="(item, index) in draft.items" :key="item.menu_id ?? `removed-${index}`"><div><strong>{{ itemName(item) }}</strong><small>{{ money(itemPrice(item)) }} each</small></div><label class="quantity-field">Quantity<input v-model.number="item.quantity" type="number" min="1" max="99" step="1" required /></label><button type="button" class="icon-button delete-action" :aria-label="`Remove ${itemName(item)}`" @click="draft.items.splice(index, 1)"><AppIcon name="trash" /></button></li></ul>
          <p v-else class="muted order-empty-cart">Choose a dish to start your order.</p>
          <div class="order-total"><span>Order total</span><strong>{{ money(previewTotal) }}</strong></div>
          <div class="form-actions"><button v-if="editing" type="button" class="button secondary" @click="reset">Cancel edit</button><button class="button primary" :disabled="!draft.items.length || (!editing && selectedUnavailable)">{{ busy ? 'Saving…' : editing ? 'Save items' : 'Create order' }}</button></div>
        </fieldset></form>
      </section>
      <section class="panel">
        <div class="table-toolbar"><div><h2>Service board <span class="count-badge">{{ orders.filter(active).length }}</span></h2><p>{{ orders.filter(active).length }} active orders · {{ money(orders.filter(active).reduce((total, order) => total + order.total, 0)) }} in progress</p></div><div class="toolbar-filters"><select v-model="filter" aria-label="Filter orders"><option value="active">Active orders</option><option value="history">Order history</option><option value="all">All orders</option></select></div></div>
        <p v-if="loading" class="loading-state">Loading orders…</p>
        <div v-else-if="!visibleOrders.length" class="empty-state"><h2>{{ filter === 'history' ? 'No past orders yet.' : 'Ready for the next order.' }}</h2><p>{{ filter === 'history' ? 'Completed and cancelled orders appear here.' : 'Create an order using the form.' }}</p></div>
        <div v-else class="order-board"><article v-for="order in visibleOrders" :id="`order-${order.id}`" :key="order.id" class="order-card" :class="{ highlighted: String(order.id) === $route.query.order }">
          <div class="order-card-heading"><div><h3>Order #{{ order.id }}</h3><p>{{ order.table_name || 'Takeaway / no table' }} · {{ order.guests }} {{ order.guests === 1 ? 'guest' : 'guests' }}</p></div><span class="pill" :class="{ neutral: !active(order) }">{{ order.status }}</span></div>
          <small class="muted">{{ date(order.created_at) }}</small><p v-if="order.notes" class="order-notes">{{ order.notes }}</p>
          <ul class="order-summary"><li v-for="item in order.items" :key="item.id"><span>{{ item.quantity }} × {{ item.name }}</span><strong>{{ money(item.unit_price * item.quantity) }}</strong></li></ul>
          <div class="order-total"><span>Total</span><strong>{{ money(order.total) }}</strong></div>
          <div v-if="active(order)" class="order-actions"><button class="button primary small" :disabled="busy" @click="advance(order)">{{ actions[order.status] }}</button><button v-if="order.status === 'pending'" class="button secondary small" :disabled="busy" @click="edit(order)">Edit items</button><button class="text-button" :disabled="busy" @click="target = order">Cancel order</button></div>
        </article></div>
      </section>
    </div>
    <ConfirmDialog :open="Boolean(target)" title="Cancel this order?" :message="target ? `Order #${target.id} will stay in the history as cancelled, and its table will become available.` : ''" :busy="busy" action-label="Cancel order" busy-label="Cancelling…" cancel-label="Keep order" @cancel="target = null" @confirm="cancelOrder" />
  </ManagementLayout>
</template>

<script>
import ManagementLayout from '../shared/ManagementLayout.vue';
import ConfirmDialog from '../shared/ConfirmDialog.vue';
import AppIcon from '../shared/AppIcon.vue';
import http from '../../services/http';
import { nextStatus, statusActions, isActive, totalCents } from '../../services/orders';

export default {
  components: { ManagementLayout, ConfirmDialog, AppIcon },
  data: () => ({ restaurants: [], restaurantId: '', orders: [], tables: [], menus: [], initializing: true, loading: false, busy: false, error: '', message: '', editing: null, target: null, filter: 'active', menuId: '', loadId: 0, actions: statusActions, draft: { table_id: '', guests: 1, notes: '', items: [] } }),
  computed: {
    availableTables() { return this.tables.filter(table => table.status === 'available'); },
    selectedTable() { return this.tables.find(table => String(table.id) === this.draft.table_id); },
    selectedUnavailable() { return Boolean(this.draft.table_id) && !this.availableTables.some(table => String(table.id) === this.draft.table_id); },
    previewTotal() { return totalCents(this.draft.items, this.menus) / 100; },
    visibleOrders() { return this.orders.filter(order => this.filter === 'all' || (this.filter === 'active' ? isActive(order) : !isActive(order))); },
  },
  async mounted() {
    try {
      this.restaurants = (await http.get('/restaurant?mine=1')).data;
      this.restaurantId = String(this.restaurants.find(restaurant => String(restaurant.id) === this.$route.query.restaurant)?.id || this.restaurants[0]?.id || '');
      await this.loadOrders();
      if (this.tables.some(table => String(table.id) === this.$route.query.table)) this.draft.table_id = this.$route.query.table;
    } catch (error) { this.error = error.response?.data?.error || 'We couldn’t load your restaurants.'; }
    finally { this.initializing = false; }
  },
  beforeUnmount() { this.loadId++; },
  methods: {
    active: isActive,
    money(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0); },
    date(value) { return new Date(value).toLocaleString(); },
    itemName(item) { return this.menus.find(menu => Number(menu.id) === Number(item.menu_id))?.name || item.name || 'Unavailable item'; },
    itemPrice(item) { return this.menus.find(menu => Number(menu.id) === Number(item.menu_id))?.price ?? item.unit_price ?? 0; },
    reset() { this.editing = null; this.menuId = ''; this.draft = { table_id: '', guests: 1, notes: '', items: [] }; },
    changeRestaurant() { this.reset(); this.target = null; this.message = ''; this.orders = []; this.tables = []; this.menus = []; this.loadOrders(); },
    addItem() {
      const existing = this.draft.items.find(item => String(item.menu_id) === this.menuId);
      if (existing) existing.quantity = Math.min(99, existing.quantity + 1);
      else this.draft.items.push({ menu_id: Number(this.menuId), quantity: 1 });
      this.menuId = '';
    },
    edit(order) {
      this.editing = order.id; this.message = ''; this.menuId = '';
      this.draft = { table_id: String(order.table_id || ''), guests: order.guests, notes: order.notes, items: order.items.map(item => ({ ...item })) };
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    async loadOrders() {
      if (!this.restaurantId) return;
      const loadId = ++this.loadId;
      this.loading = true; this.error = '';
      const params = { restaurant_id: this.restaurantId };
      try {
        const [orders, tables, menus] = await Promise.all([http.get('/orders', { params }), http.get('/tables', { params }), http.get(`/menus/restaurant/${this.restaurantId}`)]);
        if (loadId !== this.loadId) return;
        this.orders = orders.data; this.tables = tables.data; this.menus = menus.data;
      } catch (error) { if (loadId === this.loadId) this.error = error.response?.data?.error || 'We couldn’t load orders. Try refreshing.'; }
      finally { if (loadId === this.loadId) this.loading = false; }
    },
    async save() {
      if (this.busy || !this.draft.items.length) return;
      this.busy = true; this.error = ''; this.message = '';
      try {
        const items = this.draft.items.map(item => ({ menu_id: item.menu_id, quantity: item.quantity }));
        if (this.editing) await http.put(`/orders/${this.editing}/items`, { items });
        else await http.post('/orders', { restaurant_id: Number(this.restaurantId), table_id: this.draft.table_id ? Number(this.draft.table_id) : null, guests: this.draft.guests, notes: this.draft.notes, items });
        this.reset(); this.message = 'Order saved.'; this.filter = 'active'; await this.loadOrders();
      } catch (error) { this.error = error.response?.data?.error || 'We couldn’t save this order.'; }
      finally { this.busy = false; }
    },
    advance(order) { return this.setStatus(order, nextStatus[order.status]); },
    async cancelOrder() { if (this.target) await this.setStatus(this.target, 'cancelled'); },
    async setStatus(order, status) {
      if (this.busy) return;
      this.busy = true; this.error = ''; this.message = '';
      try {
        await http.patch(`/orders/${order.id}/status`, { status });
        this.target = null; if (this.editing === order.id) this.reset();
        this.message = `Order #${order.id} is ${status}.`; await this.loadOrders();
      } catch (error) { this.target = null; this.error = error.response?.data?.error || 'We couldn’t update this order.'; }
      finally { this.busy = false; }
    },
  },
};
</script>
