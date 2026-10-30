import { createRouter, createWebHistory } from 'vue-router';
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
import NotFound from '../views/NotFound.vue';
import Tables from '../views/Tables.vue';
import Orders from '../views/Orders.vue';


const routes = [
  { path: '/tables', name: 'Tables', component: Tables },
  { path: '/orders', name: 'Orders', component: Orders },
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
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() { return { left: 0, top: 0 }; },
  routes
});

const publicRoutes = new Set(['Landing', 'Login', 'SignUp', 'RestaurantList', 'RestaurantMenu', 'NotFound']);
router.beforeEach((to, from, next) => {
  if (!publicRoutes.has(to.name) && !localStorage.getItem('restaurant-token')) return next({ name: 'Login', query: { redirect: to.fullPath } });
  next();
});

export default router;
