<template>
  <div v-if="open" class="dialog-backdrop" @click.self="cancel" @keydown.esc.prevent="cancel" @keydown.tab="trapFocus">
    <section ref="dialog" class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title" tabindex="-1">
      <div class="icon-tile danger"><AppIcon name="trash" /></div>
      <h2 id="confirm-title">{{ title }}</h2><p>{{ message }}</p>
      <div class="form-actions"><button ref="keep" class="button secondary" :disabled="busy" @click="cancel">{{ cancelLabel || 'Keep it' }}</button><button class="button danger" :disabled="busy" @click="$emit('confirm')">{{ busy ? (busyLabel || 'Deleting…') : (actionLabel || 'Delete') }}</button></div>
    </section>
  </div>
</template>
<script>
import AppIcon from './AppIcon.vue';
export default {
  components: { AppIcon }, props: ['open', 'title', 'message', 'busy', 'actionLabel', 'busyLabel', 'cancelLabel'], emits: ['cancel', 'confirm'],
  watch: { open(value) { if (value) { this.returnFocus = document.activeElement; this.$nextTick(() => this.$refs.keep?.focus()); } else { this.returnFocus?.focus(); } } },
  methods: {
    cancel() { if (!this.busy) this.$emit('cancel'); },
    trapFocus(event) { const buttons = [...this.$refs.dialog.querySelectorAll('button:not(:disabled)')]; if (!buttons.length) { event.preventDefault(); this.$refs.dialog.focus(); return; } const first = buttons[0]; const last = buttons[buttons.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } },
  },
};
</script>
