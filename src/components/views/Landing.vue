<template>
  <div class="main-content">
    <AuthNavbar />
    <div class="hero-section">
      <!-- <img src="/images/homeimage.jpg" alt="Restaurant" class="hero-image" /> -->
      <div class="hero-content">
        <p class="tagline">Discover amazing restaurants and delicious menus!</p>
      </div>
    </div>

    <div class="services-section">
      <h2>Services</h2>
      <div class="services-container">
        <!-- Restaurant Service -->
        <div class="service-card">
          <i class="fas fa-store service-icon"></i>
          <h3>Restaurant</h3>
          <ul class="service-actions">
            <li><i class="fas fa-plus-circle"></i> Browse Restaurants</li>
            <li><i class="fas fa-search"></i> Search Menus</li>
            <li><i class="fas fa-star"></i> Rate & Review</li>
          </ul>
        </div>

        <!-- Menu Service -->
        <div class="service-card">
          <i class="fas fa-utensils service-icon"></i>
          <h3>Menu</h3>
          <ul class="service-actions">
            <li><i class="fas fa-list"></i> View Menus</li>
            <li><i class="fas fa-heart"></i> Save Favorites</li>
            <li><i class="fas fa-share"></i> Share with Friends</li>
          </ul>
        </div>
      </div>
    </div>

    <div id="cta-section" class="cta-section">
      <h2>Are you a restaurant owner?</h2>
      <p>Join our platform to manage your restaurant and menus</p>
      <router-link to="/sign-up" class="btn btn-primary">Get Started</router-link>
    </div>
  </div>
</template>

<script>
import AuthNavbar from '../layout/AuthNavbar.vue';

export default {
  name: 'LandingPage',
  components: {
    AuthNavbar
  }
}
</script>

<style scoped>
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Hero Section */
.hero-section {
  background-image: url('/public/images/homeimage.jpg');
  background-size: cover;
  background-position: center;
  height: 60vh; /* Reduced height */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
}

.tagline {
  font-style: italic;
  font-size: 1.5rem;
  position: absolute;
  top: 50%;
  left: 40px; 
  transform: translateY(-50%);
  padding: 40px;
  border-radius: 10px;
  max-width: 50%;
}

/* Services Section */
.services-section {
  padding: 50px 20px;
  text-align: center;
}

.services-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 30px;
}

.service-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  padding: 25px;
  width: 400px;
  height: 300px;
  text-align: center;
}

.service-icon {
  font-size: 40px;
  color: #2c3e50;
  margin-bottom: 20px;
  margin-top: 20px;
}

.service-actions {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

.service-actions li {
  margin: 20px 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
}

.service-actions i {
  margin-right: 8px;
  color: #2a425a;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-text {
    left: 20px;
    max-width: 80%;
  }

  .services-container {
    flex-direction: column;
    align-items: center;
  }

  .service-card {
    width: 100%;
    max-width: 400px;
  }
}

/* CTA Section Button Styles */
.cta-section .btn-primary {
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  background-color: #ff6b6b;
  color: white;
  border: none;
  display: inline-block;
}

.cta-section .btn-primary:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}
</style>
