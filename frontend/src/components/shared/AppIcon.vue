<template>
  <svg class="app-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="(path, index) in paths" :key="index" :d="path" />
  </svg>
</template>
<script>
const icons = {
  grid: ['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],
  restaurant: ['M3 10h18M5 10v11h14V10M8 21v-7h4v7M3 10l2-7h14l2 7M16 14h1'],
  menu: ['M4 3v7c0 2 4 2 4 0V3M6 3v18M17 3c-4 3-4 9 0 9h2M19 3v18'],
  plus: ['M12 5v14M5 12h14'],
  arrow: ['M5 12h14M13 6l6 6-6 6'],
  external: ['M14 3h7v7M10 14L21 3M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6'],
  logout: ['M9 4H4v16h5M9 12h12M16 7l5 5-5 5'],
  search: ['M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15M16 16l5 5'],
  edit: ['M15 4l5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14z'],
  trash: ['M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7'],
  close: ['M6 6l12 12M6 18L18 6'],
  check: ['M5 12l4 4L19 6'],
  image: ['M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M15 7h.01'],
  pin: ['M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],
  chevron: ['M9 5l7 7-7 7'],
  back: ['M19 12H5M11 6l-6 6 6 6'],
  heart: ['M20 5c-2-2-5-1-8 2-3-3-6-4-8-2-4 4 1 10 8 15 7-5 12-11 8-15z'],
  star: ['M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z'],
  clock: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2'],
  list: ['M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'],
  money: ['M3 5h18v14H3zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6 8h.01M18 16h.01'],
};
export default { props: { name: { type: String, default: 'grid' } }, computed: { paths() { return icons[this.name] || icons.grid; } } };
</script>
