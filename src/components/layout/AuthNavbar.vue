<template>
  <nav class="nav-bar" :class="{ scrolled: isScrolled }">
    <router-link to="/" class="logo-wrapper">
      <img class="logo" src="/images/resto-logo.jpg" alt="Resto Logo" />
    </router-link>
    <div class="nav-links">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/view-restaurants-menus" class="nav-link">Restaurants</router-link>
      <router-link to="/login" class="nav-link">Login</router-link>
      <router-link to="/sign-up" class="btn btn-primary">Get Started</router-link>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AuthNavbar',
  data() {
    return { isScrolled: false }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll() {
      this.isScrolled = window.scrollY > 60
    }
  }
}
</script>

<style scoped>
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 3rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: transparent;
  transition: background 0.35s ease, box-shadow 0.35s ease, padding 0.35s ease;
  box-sizing: border-box;
}

.nav-bar.scrolled {
  background: rgba(15, 15, 26, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 20px rgba(0,0,0,0.25);
  padding: 0.8rem 3rem;
}

.logo-wrapper {
  display: block;
  flex-shrink: 0;
}

.logo {
  height: 70px;
  width: auto;
  object-fit: contain;
  filter: brightness(1.2);
  transition: height 0.3s;
}

.nav-bar.scrolled .logo {
  height: 55px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nav-link {
  text-decoration: none;
  color: rgba(255,255,255,0.85);
  font-size: 0.97rem;
  font-weight: 600;
  padding: 0.5rem 1.1rem;
  border-radius: 50px;
  letter-spacing: 0.02em;
  transition: color 0.2s, background 0.2s;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  color: #ff6b6b;
  background: rgba(255,255,255,0.07);
}

.btn-primary {
  background: #ff6b6b;
  color: #fff;
  padding: 0.55rem 1.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-size: 0.97rem;
  font-weight: 700;
  margin-left: 0.6rem;
  box-shadow: 0 3px 14px rgba(255,107,107,0.35);
  transition: all 0.25s ease;
  border: none;
}

.btn-primary:hover {
  background: #e85555;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255,107,107,0.45);
}

@media (max-width: 768px) {
  .nav-bar {
    padding: 1rem 1.2rem;
  }

  .nav-bar.scrolled {
    padding: 0.7rem 1.2rem;
  }

  .nav-link {
    font-size: 0.85rem;
    padding: 0.4rem 0.7rem;
  }

  .logo {
    height: 52px;
  }
}
</style>
