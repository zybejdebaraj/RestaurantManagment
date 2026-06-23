<template>
  <div class="landing-wrapper">
    <AuthNavbar />

    <!-- Hero Section -->
    <section class="hero" :style="{ backgroundImage: 'url(/images/homeimage.jpg)' }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="hero-badge">Restaurant Management Platform</span>
        <h1 class="hero-title">Discover & Manage<br /><span class="accent">Amazing Restaurants</span></h1>
        <p class="hero-sub">Browse menus, explore local restaurants, and — if you're an owner — manage everything from one place.</p>
        <div class="hero-actions">
          <router-link to="/view-restaurants-menus" class="btn btn-primary">Explore Restaurants</router-link>
          <router-link to="/sign-up" class="btn btn-outline">Get Started Free</router-link>
        </div>
      </div>
      <div class="hero-scroll-hint">
        <span>Scroll to explore</span>
        <i class="fas fa-chevron-down"></i>
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="stats-bar">
      <div class="stat">
        <span class="stat-number">500+</span>
        <span class="stat-label">Restaurants</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-number">2,000+</span>
        <span class="stat-label">Menu Items</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-number">10k+</span>
        <span class="stat-label">Happy Users</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-number">50+</span>
        <span class="stat-label">Cities</span>
      </div>
    </section>

    <!-- Services Section -->
    <section class="services-section">
      <div class="section-header">
        <span class="section-tag">What We Offer</span>
        <h2>Everything You Need</h2>
        <p>A complete platform for food lovers and restaurant owners alike.</p>
      </div>
      <div class="services-grid">
        <div class="service-card">
          <div class="card-icon-wrap">
            <i class="fas fa-store"></i>
          </div>
          <h3>Browse Restaurants</h3>
          <p>Discover top-rated restaurants near you, filter by cuisine, and read detailed profiles.</p>
        </div>
        <div class="service-card featured">
          <div class="card-icon-wrap">
            <i class="fas fa-utensils"></i>
          </div>
          <h3>Explore Menus</h3>
          <p>View full menus with prices, descriptions, and high-quality photos before you visit.</p>
        </div>
        <div class="service-card">
          <div class="card-icon-wrap">
            <i class="fas fa-chart-line"></i>
          </div>
          <h3>Manage Your Venue</h3>
          <p>Restaurant owners can add, update, and manage their listings and menus in real time.</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-section">
      <div class="section-header">
        <span class="section-tag">Simple Process</span>
        <h2>How It Works</h2>
        <p>Get up and running in three easy steps.</p>
      </div>
      <div class="steps-row">
        <div class="step">
          <div class="step-number">01</div>
          <h4>Create an Account</h4>
          <p>Sign up for free in under a minute. No credit card required.</p>
        </div>
        <div class="step-arrow"><i class="fas fa-arrow-right"></i></div>
        <div class="step">
          <div class="step-number">02</div>
          <h4>Add Your Restaurant</h4>
          <p>List your venue, add photos, and build out your full menu.</p>
        </div>
        <div class="step-arrow"><i class="fas fa-arrow-right"></i></div>
        <div class="step">
          <div class="step-number">03</div>
          <h4>Reach Customers</h4>
          <p>Your restaurant goes live instantly and gets discovered by hungry customers.</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Ready to Grow Your Restaurant?</h2>
        <p>Join hundreds of restaurant owners already using our platform to manage and grow their business.</p>
        <router-link to="/sign-up" class="btn btn-primary btn-lg">Get Started — It's Free</router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <img src="/images/resto-logo.jpg" alt="Resto Logo" class="footer-logo" />
          <p>The modern restaurant management platform for owners and food lovers.</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h5>Platform</h5>
            <router-link to="/view-restaurants-menus">Restaurants</router-link>
            <router-link to="/sign-up">Sign Up</router-link>
            <router-link to="/login">Login</router-link>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Resto. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import AuthNavbar from '../layout/AuthNavbar.vue';

export default {
  name: 'LandingPage',
  components: { AuthNavbar }
}
</script>

<style scoped>
/* ── Base ── */
.landing-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #1a1a2e;
}

/* ── Hero ── */
.hero {
  min-height: 60vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(26,26,46,0.75) 0%, rgba(26,26,46,0.45) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 780px;
  padding: 2rem;
}

.hero-badge {
  display: inline-block;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  padding: 0.4rem 1.2rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(4px);
}

.hero-title {
  font-size: clamp(2.4rem, 6vw, 4.2rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  margin: 0 0 1.2rem;
}

.accent {
  color: #ff6b6b;
}

.hero-sub {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(255,255,255,0.85);
  max-width: 560px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-scroll-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.6);
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  animation: bounce 2s infinite;
  z-index: 2;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(6px); }
}

/* ── Buttons ── */
.btn {
  display: inline-block;
  padding: 0.85rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;
}

.btn-primary {
  background: #ff6b6b;
  color: #fff;
  box-shadow: 0 4px 18px rgba(255,107,107,0.4);
}

.btn-primary:hover {
  background: #e85555;
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(255,107,107,0.5);
}

.btn-outline {
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255,255,255,0.7);
}

.btn-outline:hover {
  background: rgba(255,255,255,0.12);
  border-color: #fff;
  transform: translateY(-2px);
}

.btn-lg {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

/* ── Stats Bar ── */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: #1a1a2e;
  padding: 1.8rem 2rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 3rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #ff6b6b;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 0.3rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255,255,255,0.12);
}

/* ── Section Common ── */
.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-tag {
  display: inline-block;
  background: rgba(255,107,107,0.1);
  color: #ff6b6b;
  padding: 0.3rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.8rem;
}

.section-header h2 {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 800;
  margin: 0 0 0.8rem;
  color: #1a1a2e;
}

.section-header p {
  font-size: 1.05rem;
  color: #666;
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ── Services ── */
.services-section {
  padding: 6rem 2rem;
  background: #fafaf8;
}

.services-grid {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  max-width: 1100px;
  margin: 0 auto;
}

.service-card {
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  width: 300px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.25s, box-shadow 0.25s;
}

.service-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
}

.service-card.featured {
  background: #1a1a2e;
  border-color: #1a1a2e;
}

.service-card.featured h3,
.service-card.featured p {
  color: #fff;
}

.service-card.featured .card-icon-wrap {
  background: rgba(255,107,107,0.2);
  color: #ff6b6b;
}

.card-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255,107,107,0.08);
  color: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin: 0 auto 1.5rem;
}

.service-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.8rem;
  color: #1a1a2e;
}

.service-card p {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.7;
  margin: 0;
}

/* ── How It Works ── */
.how-section {
  padding: 6rem 2rem;
  background: #fff;
}

.steps-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 960px;
  margin: 0 auto;
}

.step {
  text-align: center;
  max-width: 240px;
  padding: 1rem;
}

.step-number {
  font-size: 3rem;
  font-weight: 900;
  color: rgba(255,107,107,0.15);
  line-height: 1;
  margin-bottom: 1rem;
}

.step h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #1a1a2e;
}

.step p {
  font-size: 0.9rem;
  color: #777;
  line-height: 1.6;
  margin: 0;
}

.step-arrow {
  font-size: 1.4rem;
  color: #ddd;
  flex-shrink: 0;
}

/* ── CTA ── */
.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #e84393 100%);
  text-align: center;
}

.cta-content h2 {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
  color: #fff;
  margin: 0 0 1rem;
}

.cta-content p {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.85);
  max-width: 500px;
  margin: 0 auto 2rem;
  line-height: 1.7;
}

.cta-section .btn-primary {
  background: #fff;
  color: #e84040;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.cta-section .btn-primary:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.2);
}

/* ── Footer ── */
.footer {
  background: #0f0f1a;
  color: rgba(255,255,255,0.6);
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;
  display: flex;
  gap: 4rem;
  flex-wrap: wrap;
}

.footer-brand {
  flex: 1;
  min-width: 220px;
}

.footer-logo {
  height: 60px;
  width: auto;
  object-fit: contain;
  margin-bottom: 1rem;
  filter: brightness(1.3);
}

.footer-brand p {
  font-size: 0.9rem;
  line-height: 1.7;
  max-width: 280px;
}

.footer-links {
  display: flex;
  gap: 4rem;
  flex-wrap: wrap;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.link-group h5 {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 0.3rem;
}

.link-group a {
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.link-group a:hover {
  color: #ff6b6b;
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.06);
  text-align: center;
  padding: 1.4rem 2rem;
  font-size: 0.82rem;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .stat {
    padding: 0.8rem 1.5rem;
  }

  .stat-divider {
    display: none;
  }

  .step-arrow {
    display: none;
  }

  .steps-row {
    flex-direction: column;
    align-items: center;
  }

  .footer-inner {
    flex-direction: column;
    gap: 2rem;
  }
}
</style>
