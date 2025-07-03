<template>
  <div class="auth-page">
    <div class="logo-container">
      <img class="logo" src="/images/resto-logo.jpg" />
      <div class="form-container">
        <h1>Create Account</h1>
        <p class="subtitle">Join us to discover amazing restaurants</p>
        
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            type="text" 
            id="name"
            v-model="name" 
            placeholder="Enter your full name" 
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="text" 
            id="email"
            v-model="email" 
            placeholder="Enter your email" 
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password"
            v-model="password" 
            placeholder="Create a password" 
          />
        </div>

        <button class="submit-btn" @click="signUp">Create Account</button>
        
        <p class="switch-form">Already have an account?<router-link to="/login">Sign In</router-link></p>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import axios from 'axios';
import AppFooter from '../layout/AppFooter.vue';

export default {
  name: 'SignUp',
  components: {
    AppFooter
  },
  data() {
    return {
      name: '',
      email: '',
      password: ''
    };
  },
  async mounted() {
    let user = localStorage.getItem('user-info');
    if (user) {
      this.$router.push({ name: 'UserHome' });
    }
  },
  methods: {
    async signUp() {
      try {
        const result = await axios.post("http://localhost:3000/users", {
          name: this.name,
          email: this.email,
          password: this.password
        });

        if (result.status === 201) {
          localStorage.setItem("user-info", JSON.stringify(result.data));
          this.$router.push({ name: 'UserHome' });
        }
      } catch (error) {
        console.error("Sign-up failed:", error);
        alert("Failed to create account. Please try again.");
      }
    }
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f8f9fa;
}

.logo-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin-top: 200px;
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 2rem;
  object-fit: cover;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-container {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

h1 {
  font-size: 2rem;
  color: #2d3436;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #636e72;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  text-align: left;
  color: #2d3436;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #dfe6e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #00b894;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: #00b894;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover {
  background: #00a884;
}

.switch-form {
  text-align: center;
  margin-top: 1.5rem;
  color: #636e72;
  white-space: nowrap;
}

.switch-form a {
  color: #00b894;
  text-decoration: none;
  font-weight: 500;
  padding-left: 4px;
}

.switch-form a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .form-container {
    padding: 2rem;
  }
  
  .logo {
    width: 100px;
    height: 100px;
  }
}
</style>
  