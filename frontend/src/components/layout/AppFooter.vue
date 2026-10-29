<template>
  <footer class="site-footer" :class="{ 'workspace-footer': workspace }"><div :class="workspace ? 'workspace-footer-inner' : 'container footer-inner'"><router-link v-if="!workspace" to="/" class="wordmark">resto<span>.</span></router-link><p v-if="!workspace">Good places. Great food. All in one place.</p><small>© {{ year }} Resto. All rights reserved.</small><div v-if="!workspace" class="footer-links"><router-link to="/view-restaurants-menus">Discover</router-link><router-link to="/home">Owner workspace</router-link></div><span v-else class="footer-status"><span class="status-dot"></span> Your restaurant workspace</span></div></footer>
</template>
<script>
export default { props: { workspace: Boolean }, data: () => ({ year: new Date().getFullYear() }) };
</script>
