<template>
    <div class="nav-bar"> 
      <router-link to="/home" class="logo-wrapper">
        <img class="logo" src="/images/resto-logo.jpg" />
      </router-link>
      <div class="nav-links">

      <a v-on:click="logout" href="#">Logout <i class="bi bi-box-arrow-right"></i> </a>
      </div>
    </div>
  </template>
  
  <script>
  
  export default {
    name: 'AppHeader',
    methods:{
     logout(){
        localStorage.clear();
        this.$router.push({name:'Login'})
     }
    }
  };
  
  </script>

<style scoped>

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between; /* Evenly space logo and links */
    padding-right: 50px;
    padding-left: 0; /* Remove extra left padding */
    background-color: #2c3e50;
    /* border-bottom: 4px solid #f39c12; */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  
  .logo {
    height: 100px; /* Change this value to resize the logo */
    width: 100px;  /* Keeps aspect ratio */
    object-fit: contain;
    padding-left: 90px;
  }
  
  
  .nav-links {
    display: flex;
    align-items: center;
    margin-left: 0; /* Remove any left margin so menu is at the end */
  }
  
  .nav-links a,
  .nav-links router-link {
    text-decoration: none;
    color: white;
    font-size: 25px;
    margin-left:40px;
    font-weight: 500;
    transition: color 0.3s ease, transform 0.2s ease;
  
  }
  
  /* Vue Router links specifically */
  .nav-links router-link {
    cursor: pointer;
  }
  
  /* Hover and active effects */
  .nav-links a:hover,
  .nav-links router-link:hover {
    color: #f1c40f;
    transform: scale(1.05);
  }
  
  .nav-links a:active,
  .nav-links router-link:active {
    color: #e67e22;
  }

.logo-wrapper {
  display: block;
  padding: 0;
}
</style>