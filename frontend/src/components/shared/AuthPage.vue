<template>
  <main class="auth-layout container">
    <section class="auth-story"><img src="/images/gourmentkitchen.jpg" alt="A welcoming restaurant dining room" /><div class="auth-story-shade"></div><div class="auth-story-copy"><span class="light-eyebrow">A LITTLE HOSPITALITY, ONLINE.</span><h1>Good food.<br />Great company.<br /><em>Your story.</em></h1><p>Bring your restaurant to life, one delicious detail at a time.</p></div><span class="auth-photo-note"><AppIcon name="restaurant" /> A place for every great restaurant.</span></section>
    <section class="auth-form-area"><span class="eyebrow">WELCOME TO RESTO</span><h2>{{ signup ? 'Make yourself at home.' : 'Good to see you again.' }}</h2><p class="muted">{{ signup ? 'Create your owner account and give your restaurant a place to shine.' : 'Sign in to your restaurant workspace.' }}</p>
      <p v-if="!signup && $route.query.reason === 'expired'" class="notice" role="status">Your session has expired. Sign in again to continue.</p>
      <p v-if="error" class="notice error" role="alert">{{ error }}</p>
      <form @submit.prevent="submit">
        <label v-if="signup" class="field">Your name<input v-model="name" autocomplete="name" placeholder="First and last name" required maxlength="100" /></label>
        <label class="field">Email address<input v-model="email" type="email" autocomplete="email" placeholder="you@yourrestaurant.com" required maxlength="254" /></label>
        <label class="field">Password<input v-model="password" type="password" :autocomplete="signup ? 'new-password' : 'current-password'" :minlength="signup ? 8 : undefined" placeholder="Your password" required /><small v-if="signup">Use at least 8 characters.</small></label>
        <button class="button primary full" :disabled="busy">{{ busy ? 'Please wait…' : signup ? 'Create your workspace' : 'Sign in' }}<AppIcon name="arrow" /></button>
      </form>
      <p class="auth-switch">{{ signup ? 'Already part of the table?' : 'New to Resto?' }} <router-link :to="signup ? '/login' : '/sign-up'">{{ signup ? 'Sign in' : 'Create an account' }}</router-link></p>
      <div class="auth-note"><AppIcon name="check" /> Your restaurants. Your menus. Your own workspace.</div>
    </section>
  </main>
</template>
<script>
import AppIcon from './AppIcon.vue';
import http from '../../services/http';
import { saveSession } from '../../services/session';
export default {
  components: { AppIcon }, props: { signup: Boolean }, data: () => ({ name: '', email: '', password: '', busy: false, error: '' }),
  methods: { async submit() { if (this.busy) return; this.busy = true; this.error = ''; try { const body = { email: this.email.trim(), password: this.password }; if (this.signup) body.name = this.name.trim(); const result = await http.post(this.signup ? '/users' : '/auth/login', body); saveSession(result.data); const target = this.$route.query.redirect; await this.$router.push(typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') && !['/login', '/sign-up'].includes(target.split('?')[0]) ? target : '/home'); } catch (error) { this.error = error.response?.data?.error || 'We couldn’t connect. Please try again.'; } finally { this.busy = false; } } },
};
</script>
