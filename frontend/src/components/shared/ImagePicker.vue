<template>
  <div class="image-picker">
    <div v-if="modelValue" class="upload-preview"><img :src="modelValue" alt="Selected image preview" /><button type="button" class="icon-button" aria-label="Remove image" @click="remove"><AppIcon name="close" /></button></div>
    <label v-else class="upload-zone" @dragover.prevent @drop.prevent="pick($event.dataTransfer.files[0])">
      <span class="icon-tile"><AppIcon name="image" /></span><strong>Give it a little personality</strong><span>Choose an image or drop it here</span><small>PNG, JPG, WebP or GIF · Up to 5 MB</small>
      <input ref="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" aria-label="Choose image" @change="pick($event.target.files[0])" />
    </label>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
  </div>
</template>
<script>
import AppIcon from './AppIcon.vue';
export default {
  components: { AppIcon }, props: { modelValue: { type: String, default: '' } }, emits: ['update:modelValue'], data: () => ({ error: '', readRequest: 0 }),
  watch: { modelValue() { this.readRequest++; } },
  beforeUnmount() { this.readRequest++; },
  methods: {
    pick(file) {
      if (!file) return;
      const request = ++this.readRequest;
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) { this.error = 'Choose a supported image up to 5 MB.'; return; }
      this.error = ''; const reader = new FileReader();
      reader.onload = () => { if (request === this.readRequest) this.$emit('update:modelValue', reader.result); };
      reader.onerror = () => { if (request === this.readRequest) this.error = 'We couldn’t read that image. Please choose another.'; };
      reader.readAsDataURL(file);
    },
    remove() { this.readRequest++; this.$emit('update:modelValue', ''); this.error = ''; },
  },
};
</script>
