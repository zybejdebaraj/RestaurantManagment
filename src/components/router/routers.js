import Vue from 'vue';
import VueRouter from 'vue-router';
import UserHome from '../views/Home.vue';
import SignUp from '../views/SignUp.vue';
import LoginPage from '../views/Login.vue';
import Restaurants from '../views/Restaurants.vue';
import Add from '../views/Add.vue';
import Update from '../views/Update.vue'; 
import Menu from '../views/Menu.vue';
import AddMenu from '../views/AddMenu.vue';
import UpdateMenu from '../views/UpdateMenu.vue';
import Landing from '../views/Landing.vue';
import RestaurantList from '../views/RestaurantList.vue';
import RestaurantMenu from '../views/RestaurantMenu.vue';
import SidebarPage from '../layout/SidebarPage.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/home',
    name: 'UserHome',
    component: UserHome
  },
  {
    path: '/restaurants',
    name: 'restaurants',
    component: Restaurants
  },
  {
    path: '/sign-up',
    name: 'SignUp',
    component: SignUp
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/add',
    name: 'Add',
    component: Add
  },
  {
    path: '/update/:id',
    name: 'Update',
    component: Update
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu
  },
  {
    path: '/addmenu',
    name: 'AddMenu',
    component: AddMenu
  },
  {
    path: '/updatemenu/:id',
    name: 'UpdateMenu',
    component: UpdateMenu
  },
  {
    path: '/',
    name: 'Landing',
    component: Landing
  },
  {
    path: '/view-restaurants-menus',
    name: 'RestaurantList',
    component: RestaurantList
  },
  {
    path: '/restaurant/:id/menu',
    name: 'RestaurantMenu',
    component: RestaurantMenu
  },
  {
    path: '/sidebar',
    name: 'SidebarPage',
    component: SidebarPage
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
