<template>
  <div class="main-content">
    <AppHeader />
    <SidebarPage />
    <h1 class="welcome-text">Update Restaurant</h1>
    <form class="addRestaurant">
      <input type="text" name="name" placeholder="Enter Name" v-model="restaurant.name"/>
      <input type="text" name="address" placeholder="Enter address" v-model="restaurant.address"/>
      <input type="text" name="contact" placeholder="Enter contact" v-model="restaurant.contact"/>
      <div class="image-upload">
        <label for="image">Restaurant Image:</label>
        <input 
          type="text" 
          id="image" 
          v-model="restaurant.image" 
          placeholder="Enter image URL (e.g., /images/restaurant1.jpg)"
        />
        <small>Current image: {{ restaurant.image || 'No image set' }}</small>
      </div>
      <button type="button" v-on:click="updateRestaurant">Update Restaurant</button>
    </form>
  </div>
</template>

<script>
import AppHeader from '../layout/AppHeader.vue';
import SidebarPage from '../layout/SidebarPage.vue';
import axios from 'axios';

export default {
  name: 'UpdateRestaurant',
  components: {
    AppHeader,
    SidebarPage
  },
  data()
  {
    return{
      restaurant :{
        name: '',
        address:'',
        contact:'',
        image: ''
      }
    }
  }, 
methods:{
async updateRestaurant(){
  console.warn(this.restaurant)
      const result = await axios.put("http://localhost:3000/restaurant/"+this.$route.params.id,{
        name: this.restaurant.name,
        address: this.restaurant.address,
        contact: this.restaurant.contact,
        image: this.restaurant.image
      });
      if(result.status==200)
      {
        this.$router.push({name:'restaurants'});  
      }
      
  }
},

  async mounted() {
    const user = localStorage.getItem('user-info');
    if (!user) {
      this.$router.push({ name: 'SignUp' });
    }

    const result= await axios.get('http://localhost:3000/restaurant/'+ this.$route.params.id);
    // console.warn(this.$route.params.id)
    console.warn(result.data)
    this.restaurant=result.data
  }
};
</script>

<style scoped>
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