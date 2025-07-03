import axios from 'axios';

const API_URL = 'http://localhost:3000';

export default {
  // Restaurant operations
  async getRestaurants() {
    try {
      const response = await axios.get(`${API_URL}/restaurant`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },

  async getRestaurantById(id) {
    try {
      const response = await axios.get(`${API_URL}/restaurant/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  },

  // Menu operations
  async getMenus() {
    try {
      const response = await axios.get(`${API_URL}/menus`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw error;
    }
  },

  async getMenusByRestaurant(restaurantId) {
    try {
      const response = await axios.get(`${API_URL}/menus/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant menus:', error);
      throw error;
    }
  }
}; 