<template>
  <div class="main-content">
    <AppHeader />
    <SidebarPage />
   

  <div class="services-section">
      <h2>Services</h2>
      <div class="services-container">

     <!-- Restaurant Service -->
     <div class="service-card">
          <i class="fas fa-store service-icon"></i>
          <h3>Restaurant</h3>
          <ul class="service-actions">
            <li><i class="fas fa-plus-circle"></i> Add Restaurant</li>
            <li><i class="fas fa-edit"></i> Update Restaurant</li>
            <li><i class="fas fa-trash"></i> Delete Restaurant</li>
          </ul>
        </div>

        <!-- Menu Service -->
        <div class="service-card">
          <i class="fas fa-utensils service-icon"></i>
          <h3>Menu</h3>
          <ul class="service-actions">
            <li><i class="fas fa-plus-circle"></i> Add Menu</li>
            <li><i class="fas fa-edit"></i> Update Menu</li>
            <li><i class="fas fa-trash"></i> Delete Menu</li>
          </ul>
        </div>
      </div>
    </div>

   
  </div>
</template>
  
  <script>
  import AppHeader from '../layout/AppHeader.vue';
  import SidebarPage from '../layout/SidebarPage.vue';
  export default {
    name: 'UserHome',
    components: {
      AppHeader,
      SidebarPage,
    }
  }
  </script>

<style scoped>
.main-content {
  min-height: 100vh;
  background-color: #f8f9fa;
  margin-left: 280px; /* Match sidebar width */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.services-section {
  padding: 50px;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 550px;
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
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
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

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
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
</style>