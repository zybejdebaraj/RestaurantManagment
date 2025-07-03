<template>
  <div class="main-content">
    <AppHeader />
    <SidebarPage /> 
    <h1 class="welcome-text">Add Restaurant</h1>
    <form class="addRestaurant" @submit.prevent="addRestaurant">
      <input type="text" name="name" placeholder="Enter Name" v-model="restaurant.name" />
      <input type="text" name="address" placeholder="Enter address" v-model="restaurant.address" />
      <input type="text" name="contact" placeholder="Enter contact" v-model="restaurant.contact" />
      <div class="image-upload">
        <div class="upload-container">
          <label for="image" class="upload-label">
            <div class="upload-content">
              <span class="upload-icon">📁</span>
              <span class="upload-text">Choose Restaurant Image</span>
              <span class="upload-subtext">or drag and drop</span>
            </div>
          </label>
          <input 
            type="file" 
            id="image" 
            accept="image/*"
            @change="handleImageUpload" 
            class="file-input"
          />
        </div>
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Preview" />
          <div class="preview-overlay">
            <button type="button" class="remove-image" @click="removeImage">
              <span class="remove-icon">×</span>
            </button>
          </div>
        </div>
        <small class="upload-hint">Supported formats: JPG, PNG, GIF (max 5MB)</small>
      </div>
      <button type="submit" :disabled="loading">Add new Restaurant</button>
    </form>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>
  </div>
</template>

<script>
import AppHeader from '../layout/AppHeader.vue';
import SidebarPage from '../layout/SidebarPage.vue';
import axios from 'axios';

export default {
  name: 'AddRestaurant',
  components: {
    AppHeader,
    SidebarPage
  },
  data() {
    return {
      restaurant: {
        name: '',
        address: '',
        contact: '',
        image: ''
      },
      loading: false,
      error: '',
      success: '',
      imagePreview: ''
    };
  },
  methods: {
    async addRestaurant() {
      this.error = '';
      this.success = '';
      // Basic validation
      if (!this.restaurant.name || !this.restaurant.address || !this.restaurant.contact) {
        this.error = 'All fields are required.';
        return;
      }
      this.loading = true;
      try {
        const result = await axios.post('http://localhost:3000/restaurant', {
          name: this.restaurant.name,
          address: this.restaurant.address,
          contact: this.restaurant.contact,
          image: this.restaurant.image || '/images/restaurant-placeholder.jpg'
        });
        if (result.status === 201) {
          this.success = 'Restaurant added successfully!';
          // Optionally, clear the form
          this.restaurant = { name: '', address: '', contact: '', image: '' };
          // Redirect after a short delay
          setTimeout(() => {
            this.$router.push({ name: 'restaurants' });
          }, 1000);
        }
      } catch (error) {
        this.error = 'Failed to add restaurant. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.add-restaurant {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

h1 {
  text-align: center;
  color: #2d3436;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 600;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3436;
  font-weight: 500;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #dfe6e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #00b894;
  box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.1);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.image-preview {
  margin-top: 1rem;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: #00b894;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover {
  background: #00a884;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
  background: #b2bec3;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #d63031;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .form-container {
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 2rem;
  }
}

.image-upload {
  margin: 1.5rem 0;
}

.upload-container {
  position: relative;
  margin-bottom: 1rem;
}

.upload-label {
  display: block;
  padding: 2rem;
  background: linear-gradient(145deg, #f8f9fa, #ffffff);
  border: 2px dashed #00b894;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.upload-label:hover {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-color: #00a884;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.1);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2.5rem;
  color: #00b894;
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3436;
}

.upload-subtext {
  font-size: 0.9rem;
  color: #636e72;
}

.file-input {
  display: none;
}

.image-preview {
  position: relative;
  margin-top: 1rem;
  max-width: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview:hover .preview-overlay {
  opacity: 1;
}

.remove-image {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-image:hover {
  background: white;
  transform: scale(1.1);
}

.remove-icon {
  font-size: 1.5rem;
  color: #2d3436;
  line-height: 1;
}

.upload-hint {
  display: block;
  margin-top: 0.75rem;
  color: #636e72;
  font-size: 0.875rem;
  text-align: center;
}
</style>