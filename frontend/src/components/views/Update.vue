<template><RestaurantEditor :id="$route.params.id" /></template>
<script>
import RestaurantEditor from '../shared/RestaurantEditor.vue';
export default { components: { RestaurantEditor } };
</script>
