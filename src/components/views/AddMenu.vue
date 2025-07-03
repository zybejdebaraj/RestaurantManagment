<template>
  
    <div class="main-content">
      
      <AppHeader />  
      <SidebarPage />
      <h1 class="welcome-text">Add Menu</h1>
  
      <form class="addMenuItem" @submit.prevent="addMenuItem">
        <input type="text" v-model="menu.name" placeholder="Item name" required />
        <input type="number" v-model="menu.price" placeholder="Price" required />
        <textarea v-model="menu.description" placeholder="Description"></textarea>
        <input type="number" v-model="menu.restaurant_id" placeholder="Restaurant ID" required />
        <div class="image-upload">
          <div class="upload-container">
            <label for="image" class="upload-label">
              <div class="upload-content">
                <span class="upload-icon">📁</span>
                <span class="upload-text">Choose Menu Item Image</span>
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
        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">Add Menu Item</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>
    </div>
  </template>
  
  <script>
import AppHeader from '../layout/AppHeader.vue';
import SidebarPage from '../layout/SidebarPage.vue';
import axios from 'axios';

export default {
  name: 'AddMenu',
  components: {
    AppHeader,
    SidebarPage
  },
  data() {
    return {
      menu: {
        name: '',
        price: '',
        description: '',
        restaurant_id: '',
        image: ''
      },
      imagePreview: null
    };
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
        this.menu.image = e.target.result; // Store base64 string
      };
      reader.readAsDataURL(file);
    },
    removeImage() {
      this.imagePreview = null;
      this.menu.image = '';
      this.$refs.fileInput.value = ''; // Reset file input
    },
    async addMenuItem() {
      try {
        await axios.post('http://localhost:3000/menus', {
          ...this.menu,
          image: this.menu.image || '/images/menu-placeholder.jpg'
        });
        this.menu = { 
          name: '', 
          price: '', 
          description: '', 
          restaurant_id: '',
          image: '' 
        };
        this.imagePreview = null;
        this.$router.push({ name: 'Menu' });
      } catch (err) {
        console.error('Failed to add menu item:', err.response?.data || err.message);
        alert('Failed to add menu item: ' + (err.response?.data?.error || err.message));
      }
    }
  }
};
</script>

<style scoped>
.add-menu {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 1rem 0;
}

.container {
  max-width: 500px;
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

.addMenuItem {
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  padding: 70px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 600px;
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  transition: transform 0.3s ease;
}

.addMenuItem:hover {
  transform: translateY(-2px);
}

input,
textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 16px;
  background-color: #fdfdfd;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  margin-bottom: 0.5rem;
}

input:focus,
textarea:focus {
  border-color: #2ecc71;
  outline: none;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.2);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.image-upload {
  margin: 0.5rem 0;
}

.upload-container {
  position: relative;
  margin-bottom: 0.5rem;
}

.upload-label {
  display: block;
  padding: 1.5rem;
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
  font-size: 2rem;
  color: #00b894;
  margin-bottom: 0.25rem;
}

.upload-text {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3436;
}

.upload-subtext {
  font-size: 0.8rem;
  color: #636e72;
}

.file-input {
  display: none;
}

.image-preview {
  position: relative;
  margin-top: 0.5rem;
  max-width: 250px;
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

.submit-btn {
  padding: 14px;
  background: linear-gradient(to right, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  width: 100%;
}

.submit-btn:hover {
  background: linear-gradient(to right, #219150, #27ae60);
  box-shadow: 0 6px 18px rgba(39, 174, 96, 0.45);
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
    padding: 0 2rem;
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>
