<template>
  <div class="main-content">
    <AppHeader />
    <SidebarPage />
    <div>
      <h1>Menu List</h1>
      <table border="1">
        <thead>
          <tr>
            <td>ID</td>
            <td>Restaurant ID</td>
            <td>Name</td>
            <td>Price</td>
            <td>Description</td>
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="menu in menus" :key="menu.id">
            <td>{{ menu.id }}</td>
            <td>{{ menu.restaurant_id }}</td>
            <td>{{ menu.name }}</td>
            <td>{{ menu.price }}</td>
            <td>{{ menu.description }}</td>
            <td>
              <router-link :to="`/updatemenu/${menu.id}`">Update</router-link>
              <button @click="deleteMenu(menu.id)">Delete</button>              
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import AppHeader from '../layout/AppHeader.vue';
import SidebarPage from '../layout/SidebarPage.vue';
import axios from 'axios';

export default {
  name: 'MenuList',
  components: {
    AppHeader,
    SidebarPage
  },
  data() {
    return {
      menus: []
    };
  },
  methods: {
    async fetchMenus() {
      try {
        const response = await axios.get('http://localhost:3000/menus');
        this.menus = response.data;
      } catch (error) {
        console.error("Error fetching menus: ", error);
      }
    },
    async deleteMenu(id) {
      if (confirm('Are you sure you want to delete this menu?')) {
        try {
          await axios.delete(`http://localhost:3000/menus/${id}`);
          this.fetchMenus(); // Refresh after deletion
        } catch (error) {
          console.error('Failed to delete menu:', error);
        }
      }
    }
  },
  mounted() {
    this.fetchMenus();
  }
};
</script>

<style scoped>
.main-content {
  padding-left: 250px; /* Add padding to account for sidebar */
  padding-top: 150px; /* Add padding to account for header */
}

h1 {
  text-align: center;
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

.addMenuItem {
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  padding: 100px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 600px;
  margin: 100px auto; 
  margin-top: 200px;
  display: flex;
  flex-direction: column;
  gap: 50px;
  transition: transform 0.3s ease;
}

.addMenuItem:hover {
  transform: translateY(-2px);
}

.addMenuItem input,
.addMenuItem textarea {
  padding: 14px 16px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 16px;
  background-color: #fdfdfd;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}

.addMenuItem input:focus,
.addMenuItem textarea:focus {
  border-color: #2ecc71;
  outline: none;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.2);
}

.addMenuItem button {
  padding: 14px;
  background: linear-gradient(to right, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.addMenuItem button:hover {
  background: linear-gradient(to right, #219150, #27ae60);
  box-shadow: 0 6px 18px rgba(39, 174, 96, 0.45);
}
</style>
