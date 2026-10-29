<template>
  <div class="workspace">
    <SidebarPage />
    <AppHeader />
    <main class="workspace-main"><slot /></main>
  </div>
</template>
<script>
import SidebarPage from '../layout/SidebarPage.vue';
import AppHeader from '../layout/AppHeader.vue';
export default { components: { SidebarPage, AppHeader } };
</script>
