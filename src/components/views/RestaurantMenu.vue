<template>
  <div class="restaurant-menu">
    <AuthNavbar />
    <div class="container">
      <div v-if="restaurant" class="restaurant-header">
        <h1>{{ restaurant.name }}</h1>
        <p class="location">{{ restaurant.location }}</p>
        <p class="description">{{ restaurant.description }}</p>
      </div>

      <!-- Menu Categories -->
      <div class="menu-categories">
        <button 
          v-for="category in categories" 
          :key="category"
          :class="['category-btn', { active: selectedCategory === category }]"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <!-- Menu Items -->
      <div class="menu-items">
        <div v-for="menu in filteredMenus" :key="menu.id" class="menu-item">
          <div class="menu-item-image">
            <img :src="menu.image || '/images/menu-placeholder.jpg'" :alt="menu.name">
          </div>
          <div class="menu-item-details">
            <h3>{{ menu.name }}</h3>
            <p class="description">{{ menu.description }}</p>
            <p class="price">${{ formatPrice(menu.price) }}</p>
            
            <!-- Menu Item Actions -->
            <div class="menu-actions">
              <button 
                @click="toggleFavorite(menu)" 
                class="action-btn"
                :class="{ 'is-favorite': isFavorite(menu.id) }"
              >
                <span class="icon">❤</span>
                {{ isFavorite(menu.id) ? 'Saved' : 'Save' }}
              </button>
              <button @click="shareMenu(menu)" class="action-btn">
                <span class="icon">↗</span>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthNavbar from '../layout/AuthNavbar.vue';
import axios from 'axios';

export default {
  name: 'RestaurantMenu',
  components: {
    AuthNavbar
  },
  data() {
    return {
      restaurant: null,
      menus: [],
      selectedCategory: '',
      categories: [],
      favorites: []
    };
  },
  computed: {
    filteredMenus() {
      if (!this.selectedCategory) return this.menus;
      return this.menus.filter(menu => menu.category === this.selectedCategory);
    }
  },
  methods: {
    formatPrice(price) {
      return parseFloat(price).toFixed(2);
    },
    async fetchRestaurantData() {
      try {
        const restaurantId = this.$route.params.id;
        const [restaurantResponse, menuResponse] = await Promise.all([
          axios.get(`http://localhost:3000/restaurant/${restaurantId}`),
          axios.get(`http://localhost:3000/menus/restaurant/${restaurantId}`)
        ]);

        this.restaurant = restaurantResponse.data;
        this.menus = menuResponse.data;
        
        // Extract unique categories
        this.categories = [...new Set(this.menus.map(menu => menu.category))];
        if (this.categories.length > 0) {
          this.selectedCategory = this.categories[0];
        }

        // Load favorites from localStorage
        this.loadFavorites();
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        alert('Failed to load restaurant menu');
      }
    },
    loadFavorites() {
      const favorites = localStorage.getItem('favorites');
      this.favorites = favorites ? JSON.parse(favorites) : [];
    },
    toggleFavorite(menu) {
      const index = this.favorites.findIndex(f => f.id === menu.id);
      if (index === -1) {
        this.favorites.push(menu);
      } else {
        this.favorites.splice(index, 1);
      }
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    },
    isFavorite(menuId) {
      return this.favorites.some(f => f.id === menuId);
    },
    shareMenu(menu) {
      const shareUrl = `${window.location.origin}/restaurant/${this.restaurant.id}/menu`;
      const shareText = `Check out ${menu.name} at ${this.restaurant.name}!`;
      
      if (navigator.share) {
        navigator.share({
          title: menu.name,
          text: shareText,
          url: shareUrl
        }).catch(console.error);
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('Link copied to clipboard!');
      }
    }
  },
  mounted() {
    this.fetchRestaurantData();
  }
};
</script>

<style scoped>
.restaurant-menu {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  margin-top: 200px;
}

.restaurant-header {
  text-align: center;
  margin-bottom: 2rem;
}

.restaurant-header h1 {
  color: #2d3436;
  margin-bottom: 0.5rem;
}

.location {
  color: #0984e3;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.description {
  color: #636e72;
}

.menu-categories {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.category-btn {
  padding: 0.5rem 1.5rem;
  border: 2px solid #00b894;
  border-radius: 25px;
  background: transparent;
  color: #00b894;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.category-btn:hover,
.category-btn.active {
  background: #00b894;
  color: white;
}

.menu-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.menu-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.menu-item:hover {
  transform: translateY(-5px);
}

.menu-item-image {
  height: 200px;
  overflow: hidden;
}

.menu-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-item-details {
  padding: 1.5rem;
}

.menu-item-details h3 {
  color: #2d3436;
  margin-bottom: 0.5rem;
}

.menu-item-details .description {
  color: #636e72;
  margin-bottom: 0.5rem;
}

.menu-item-details .price {
  color: #00b894;
  font-weight: 600;
  font-size: 1.2rem;
}

.menu-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #00b894;
  border-radius: 4px;
  background: transparent;
  color: #00b894;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #00b894;
  color: white;
}

.action-btn.is-favorite {
  background: #00b894;
  color: white;
}

.icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .menu-items {
    grid-template-columns: 1fr;
  }
  
  .menu-categories {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 1rem;
  }
}
</style> 