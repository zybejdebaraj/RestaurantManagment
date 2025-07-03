<template>
    <div class="main-content">
      <AppHeader />
      <SidebarPage /> 
      <h1 class="welcome-text">Update Menu Item</h1>
      <form class="addRestaurant">
        <input type="text" v-model="menu.name" placeholder="Item name" required />
        <input type="number" v-model="menu.price" placeholder="Price" required />
        <textarea v-model="menu.description" placeholder="Description"></textarea>
        <input type="number" v-model="menu.restaurant_id" placeholder="Restaurant ID" required />
        <div class="image-upload">
          <label for="image">Menu Item Image:</label>
          <input 
            type="text" 
            id="image" 
            v-model="menu.image" 
            placeholder="Enter image URL (e.g., /images/menu1.jpg)"
          />
          <small>Current image: {{ menu.image || 'No image set' }}</small>
        </div>
        <button type="button" v-on:click="updateMenuItem">Update Item</button>
      </form>
    </div>
  </template>
  
  
  <script>
  import AppHeader from '../layout/AppHeader.vue';
  import SidebarPage from '../layout/SidebarPage.vue';
  import axios from 'axios';
  
  export default {
    name: 'UpdateMenu',
    components: {
      AppHeader,
      SidebarPage
      },
    data() {
      return {
        menu: {
          name: '',
          price: '',
          description: '',
          restaurant_id: '',
          image: ''
        }
      };
    },
    methods: {
      async updateMenuItem() {
        try {
          if (!this.menu.name || !this.menu.price || !this.menu.restaurant_id) {
            alert('Please fill in all required fields (name, price, and restaurant ID)');
            return;
          }

          const result = await axios.put(`http://localhost:3000/menus/${this.$route.params.id}`, {
            name: this.menu.name,
            price: parseFloat(this.menu.price),
            description: this.menu.description || '',
            category: this.menu.category || 'Main Course',
            image: this.menu.image || '/images/menu-placeholder.jpg',
            restaurant_id: parseInt(this.menu.restaurant_id)
          });

          if (result.status === 200) {
            alert('Menu item updated successfully!');
            this.$router.push({ name: 'Menu' });
          }
        } catch (err) {
          console.error('Failed to update menu item:', err);
          let errorMessage = 'Failed to update menu item: ';
          
          if (err.response) {
            switch (err.response.status) {
              case 400:
                errorMessage += 'Missing required fields';
                break;
              case 404:
                errorMessage += err.response.data.error || 'Menu item or restaurant not found';
                break;
              case 500:
                errorMessage += 'Server error occurred';
                break;
              default:
                errorMessage += err.response.data?.error || err.message || 'Unknown error occurred';
            }
          } else {
            errorMessage += err.message || 'Unknown error occurred';
          }
          
          alert(errorMessage);
        }
      }
    },
    async mounted() {
      try {
        const result = await axios.get(`http://localhost:3000/menus/${this.$route.params.id}`);
        this.menu = result.data;
      } catch (err) {
        console.error('Failed to fetch menu item:', err);
        alert('Failed to load menu item details');
      }
    }
  };
  </script>
  
  <style scoped>
  .main-content {
    padding-left: 250px; /* Add padding to account for sidebar */
    padding-top: 20px; /* Add padding to account for header */
  }
  
  .welcome-text {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #2c3e50;
    font-weight: 700;
  }
  
  .addRestaurant {
    background: linear-gradient(145deg, #ffffff, #f0f0f0);
    padding: 50px;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
    width: 100%;
    max-width: 500px;
    margin: 40px auto;
    display: flex;
    flex-direction: column;
    gap: 50px;
    transition: transform 0.3s ease;
  }
  
  .addRestaurant:hover {
    transform: translateY(-2px);
  }
  
  .addRestaurant input,
  .addRestaurant textarea {
    padding: 14px 16px;
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: 16px;
    background-color: #fdfdfd;
    transition: all 0.3s ease;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  }
  
  .addRestaurant input:focus,
  .addRestaurant textarea:focus {
    border-color: #2ecc71;
    outline: none;
    box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.2);
  }
  
  .addRestaurant button {
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
  
  .addRestaurant button:hover {
    background: linear-gradient(to right, #219150, #27ae60);
    box-shadow: 0 6px 18px rgba(39, 174, 96, 0.45);
  }
  
  .image-upload {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .image-upload label {
    font-weight: 600;
    color: #2d3436;
  }
  
  .image-upload small {
    color: #636e72;
    font-size: 0.8rem;
  }
  </style>