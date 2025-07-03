<template>
    <div class="main-content">
      <AppHeader />
      <SidebarPage />
      <h1 class="welcome-text"> Restaurants List </h1>
      <table border="1">
        <thead>
          <tr>
            <td>Id</td>
            <td>Name</td>
            <td>Contact</td>
            <td>Address</td>
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in restaurant" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.contact }}</td>
            <td>{{ item.address }}</td>
            <td>
              <router-link :to="'/update/' + item.id">Update</router-link>
              <button @click="confirmDelete(item.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import AppHeader from '../layout/AppHeader.vue';
  import SidebarPage from '../layout/SidebarPage.vue';
  import axios from 'axios';
  
  export default {
    name: 'RestaurantsList',
    components: {
      AppHeader,
      SidebarPage
    },
    data() {
      return {
        name: '',
        restaurant: []
      };
    },
    methods: {
      async deleteRestaurant(id) {
        try {
          const result = await axios.delete(`http://localhost:3000/restaurant/${id}`);
          if (result.status === 200) {
            this.loadData(); // Reload after successful delete
          }
        } catch (error) {
          console.error("Failed to delete restaurant:", error);
        }
      },
  
      confirmDelete(id) {
      if (confirm("Are you sure you want to delete this restaurant?")) {
        this.deleteRestaurant(id);
      }
    },
  
      async loadData() {
        const user = localStorage.getItem('user-info');
        if (!user) {
          this.$router.push({ name: 'SignUp' });
          return;
        }
        this.name = JSON.parse(user).name;
  
        try {
          const result = await axios.get("http://localhost:3000/restaurant");
          this.restaurant = result.data;
        } catch (error) {
          console.error("Failed to fetch restaurants:", error);
        }
      }
    },
  
    mounted() {
      this.loadData();
    }
  };
  </script>

  <style scoped>
  .main-content {
   padding-left: 250px; /* Add padding to account for sidebar */
   padding-top: 10px; /* Add padding to account for header */
  }

  .welcome-text {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-weight: 700;
}

  table {
    width: 90%;
    margin: 0 auto;
    border-collapse: collapse;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
    background-color: #ffffff;
  }

  td, th {
    padding: 12px 15px;
    text-align: center;
    border: 1px solid #ddd;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }

  td:first-child,
  td:last-child {
    font-weight: bold;
  }

  /* Link and Button styling */
  router-link, a {
    color: #3498db;
    text-decoration: none;
    padding: 20px;
  }

  router-link:hover {
    text-decoration: underline;
  }

  button {
    background-color: #27ae60;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #219150;
  }
  </style>
