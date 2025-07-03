<template>
  <div class="nav-bar">
    <router-link to="/" class="logo-wrapper">
      <img class="logo" src="/images/resto-logo.jpg" alt="Restaurant Logo" />
    </router-link>
    <div class="nav-links">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/view-restaurants-menus" class="nav-link">Restaurants & Menus</router-link>
      <router-link to="/sign-up" class="btn btn-primary">Get Started</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthNavbar'
}
</script>

<style scoped>
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 3rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 60%, rgba(0,0,0,0));
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.logo-wrapper {
  display: block;
  padding: 0;
}

.logo {
  height: 90px;
  width: auto;
  object-fit: contain;
  filter: brightness(1.2);
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: white;
  font-weight: 600;
  font-size: 1.6rem;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  letter-spacing: 0.03em;
  transition: 
    color 0.3s,
    background 0.3s,
    box-shadow 0.3s;
  position: relative;
}

.nav-link:hover {
  color: #ff6b6b;
  background: rgba(255,255,255,0.08);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-decoration: none;
}

.nav-link:active {
  background: rgba(255,255,255,0.15);
}

 .btn-primary {
  background-color: #ff6b6b;
  color: white;
  padding: 0.5rem 1.5rem;
  margin-right: 5rem;
  border-radius: 30px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  font-size: 1.6rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  outline: 2px solid #fff2;
}

.btn-primary:hover {
  background-color: #ff5252;
  color: #fff;
  transform: translateY(-2px);
  outline: 2px solid #fff5;
} 

@media (max-width: 768px) {
  .nav-bar {
    padding: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .nav-link {
    font-size: 0.9rem;
  }
}
</style>


