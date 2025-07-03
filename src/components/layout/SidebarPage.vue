<template>
  <div class="sidebar">
    <div class="menu-items">
      <router-link to="/restaurants">Restaurants</router-link>
      <router-link to="/add">Add Restaurant</router-link>
      <router-link to="/menu">Menu</router-link>
      <router-link to="/addmenu">Add Menu</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarPage'
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-height: 100vh;
  background-color: #2c3e50;
  color: #fff;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20;
  padding-top: 350px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.sidebar a {
  color: white;
  text-decoration: none;
  font-size: 28px;
  margin-bottom: 2.5rem;
  font-weight: 500;
  transition: color 0.3s ease, transform 0.2s ease;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  display: block;
  text-align: left;
  width: 100%;
}

.sidebar a:hover {
  color: #f1c40f;
  transform: scale(1.05);
}
</style> 