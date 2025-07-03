<template>
  <div class="restaurant-list">
    <AuthNavbar />
    <div class="container">
      <h1>Restaurants & Menus</h1>
      
      <!-- Search and Filter Section -->
      <div class="search-filter">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search restaurants..." 
          @input="filterRestaurants"
        />
      </div>
        
      <!-- Restaurants Grid -->
      <div class="restaurants-grid">
        <div v-for="restaurant in filteredRestaurants" :key="restaurant.id" class="restaurant-card">
          <div class="restaurant-image">
            <img :src="restaurant.image || '/images/restaurant-placeholder.jpg'" :alt="restaurant.name">
          </div>
          <div class="restaurant-info">
            <h2>{{ restaurant.name }}</h2>
            <p class="description">{{ restaurant.description }}</p>
            <p class="location">{{ restaurant.location }}</p>
            
            <!-- Rating Section -->
            <div class="rating-section">
              <div class="stars">
                <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= restaurant.rating }">★</span>
              </div>
              <span class="rating-count">({{ restaurant.reviewCount || 0 }} reviews)</span>
            </div>

            <button @click="viewFullMenu(restaurant.id)" class="view-menu-btn">
              View Full Menu
            </button>
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
  name: 'RestaurantList',
  components: {
    AuthNavbar
  },
  data() {
    return {
      restaurants: [],
      searchQuery: '',
      selectedCategory: '',
      categories: []
    };
  },
  computed: {
    filteredRestaurants() {
      return this.restaurants.filter(restaurant => {
        const matchesSearch = restaurant.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesCategory = !this.selectedCategory || 
          (restaurant.menus && restaurant.menus.some(menu => menu.category === this.selectedCategory));
        return matchesSearch && matchesCategory;
      });
    },
    isLoggedIn() {
      return localStorage.getItem('user-info') !== null;
    }
  },
  methods: {
    formatPrice(price) {
      return parseFloat(price).toFixed(2);
    },
    async fetchRestaurants() {
      try {
        const response = await axios.get('http://localhost:3000/restaurant');
        this.restaurants = response.data;
        
        // Fetch menus for each restaurant
        for (const restaurant of this.restaurants) {
          try {
            const menuResponse = await axios.get(`http://localhost:3000/menus/restaurant/${restaurant.id}`);
            restaurant.menus = menuResponse.data;
            
            // Extract unique categories
            const categories = new Set(menuResponse.data.map(menu => menu.category));
            this.categories = Array.from(categories);
          } catch (err) {
            console.error(`Error fetching data for restaurant ${restaurant.id}:`, err);
            restaurant.menus = [];
          }
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        alert('Failed to load restaurants');
      }
    },
    calculateAverageRating(reviews) {
      if (!reviews || reviews.length === 0) return 0;
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      return (sum / reviews.length).toFixed(1);
    },
    setRating(restaurantId, rating) {
      this.$set(this.userRatings, restaurantId, rating);
    },
    async submitReview(restaurant) {
      if (!this.userRatings[restaurant.id]) {
        alert('Please select a rating');
        return;
      }

      try {
        const userInfo = JSON.parse(localStorage.getItem('user-info'));
        const review = {
          restaurantId: restaurant.id,
          userId: userInfo.id,
          userName: userInfo.name,
          rating: this.userRatings[restaurant.id],
          text: this.userReviews[restaurant.id] || '',
          date: new Date().toISOString()
        };

        await axios.post('http://localhost:3000/reviews', review);
        
        // Update restaurant reviews and rating
        restaurant.reviews.unshift(review);
        restaurant.rating = this.calculateAverageRating(restaurant.reviews);
        restaurant.reviewCount = restaurant.reviews.length;
        
        // Clear form
        this.$set(this.userRatings, restaurant.id, 0);
        this.$set(this.userReviews, restaurant.id, '');
        
        alert('Review submitted successfully!');
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review');
      }
    },
    filterRestaurants() {
      // The computed property handles the filtering
    },
    viewFullMenu(restaurantId) {
      this.$router.push({ name: 'RestaurantMenu', params: { id: restaurantId } });
    }
  },
  mounted() {
    this.fetchRestaurants();
  }
};
</script>

<style scoped>
.restaurant-list {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 200px;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #2d3436;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 600;
}

.search-filter {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.search-filter input {
  width: 100%;
  max-width: 500px;
  padding: 1rem 1.5rem;
  border: 2px solid #dfe6e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-filter input:focus {
  outline: none;
  border-color: #00b894;
  box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.1);
}

.restaurants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.restaurant-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.restaurant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.restaurant-image {
  height: 250px;
  overflow: hidden;
  position: relative;
}

.restaurant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.restaurant-card:hover .restaurant-image img {
  transform: scale(1.05);
}

.restaurant-info {
  padding: 1.5rem;
}

.restaurant-info h2 {
  color: #2d3436;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.description {
  color: #636e72;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.location {
  color: #0984e3;
  font-weight: 500;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  color: #ddd;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.star.filled {
  color: #ffd700;
}

.rating-count {
  color: #636e72;
  font-size: 0.9rem;
}

.view-menu-btn {
  width: 100%;
  padding: 1rem;
  background: #00b894;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 1rem;
}

.view-menu-btn:hover {
  background: #00a884;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .restaurants-grid {
    grid-template-columns: 1fr;
  }
  
  .search-filter {
    flex-direction: column;
  }
  
  .restaurant-image {
    height: 200px;
  }
}
</style> 