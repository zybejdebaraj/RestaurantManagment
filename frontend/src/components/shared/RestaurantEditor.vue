<template>
  <ManagementLayout>
    <router-link to="/restaurants" class="back-link"><AppIcon name="back" /> Back to restaurants</router-link>
    <div class="page-heading"><div><p class="eyebrow">YOUR RESTAURANT COLLECTION</p><h1>{{ id ? 'A fresh look for your listing.' : 'Let’s set the table.' }}</h1><p>{{ id ? 'Keep your restaurant details up to date for your guests.' : 'Add the details that help guests find and remember your restaurant.' }}</p></div><span class="page-chip">{{ id ? 'Edit restaurant' : 'New restaurant' }}</span></div>
    <p v-if="error" class="notice error" role="alert">{{ error }} <button v-if="!loaded" class="text-button" @click="load">Try again</button></p>
    <p v-if="loading" class="notice">Loading your restaurant…</p>
    <form v-else-if="loaded" class="editor-grid" @submit.prevent="save">
      <section class="panel form-panel"><div class="panel-heading"><span class="icon-tile"><AppIcon name="restaurant" /></span><div><h2>The essentials</h2><p>A few details make all the difference.</p></div></div>
        <label class="field">Restaurant name<input v-model="form.name" name="name" placeholder="e.g. The Olive Table" required maxlength="100" autocomplete="organization" /></label>
        <label class="field">Address<input v-model="form.address" name="address" placeholder="Street, city, and neighborhood" required maxlength="255" autocomplete="street-address" /><small>Help guests find their way to your door.</small></label>
        <label class="field">Contact number<input v-model="form.contact" name="contact" type="tel" placeholder="Your restaurant’s phone number" required maxlength="50" autocomplete="tel" /></label>
        <div class="form-actions"><router-link to="/restaurants" class="button secondary">Cancel</router-link><button class="button primary" :disabled="busy"><AppIcon name="check" />{{ busy ? 'Saving…' : id ? 'Save changes' : 'Create restaurant' }}</button></div>
      </section>
      <aside><section class="panel form-panel"><h2>Make it memorable</h2><p class="muted">A welcoming photo helps your restaurant stand out.</p><ImagePicker v-model="form.image" /></section><div class="editor-tip"><AppIcon name="check" /><p>Your listing and menu will be visible to guests on the public site.</p></div></aside>
    </form>
  </ManagementLayout>
</template>
<script>
import ManagementLayout from './ManagementLayout.vue';
import AppIcon from './AppIcon.vue';
import ImagePicker from './ImagePicker.vue';
import http from '../../services/http';
import { currentUser } from '../../services/session';
const blank = () => ({ name: '', address: '', contact: '', image: '' });
export default {
  components: { ManagementLayout, AppIcon, ImagePicker }, props: { id: [String, Number] },
  data: () => ({ form: blank(), error: '', loading: false, loaded: false, busy: false }),
  watch: { id: { immediate: true, handler: 'load' } },
  methods: {
    async load() {
      const id = this.id;
      this.form = blank(); this.error = ''; this.loaded = false; this.loading = true;
      try {
        if (!id) { this.loaded = true; return; }
        const { data } = await http.get(`/restaurant/${id}`);
        if (String(id) !== String(this.id)) return;
        if (Number(data.owner_id) !== Number(currentUser()?.id)) { this.error = 'You can only edit your own restaurants.'; return; }
        this.form = { name: data.name, address: data.address, contact: data.contact, image: data.image || '' };
        this.loaded = true;
      } catch (error) { if (String(id) === String(this.id)) this.error = error.response?.data?.error || 'We couldn’t load this restaurant.'; }
      finally { if (String(id) === String(this.id)) this.loading = false; }
    },
    async save() {
      if (this.busy || !this.loaded) return;
      this.busy = true; this.error = '';
      try { if (this.id) await http.put(`/restaurant/${this.id}`, this.form); else await http.post('/restaurant', this.form); await this.$router.push('/restaurants'); }
      catch (error) { this.error = error.response?.data?.error || 'We couldn’t save your restaurant. Please try again.'; }
      finally { this.busy = false; }
    },
  },
};
</script>
