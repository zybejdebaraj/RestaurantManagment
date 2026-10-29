<template>
  <div>
    <section class="container home-hero">
      <div class="hero-copy"><p class="eyebrow">GOOD FOOD. GREAT CONNECTIONS.</p><h1>Your next<br />favorite place<br /><em>starts here.</em></h1><p>Discover welcoming restaurants, explore their menus, and find something you’ll love. A little inspiration for your next meal.</p><div class="hero-buttons"><router-link to="/view-restaurants-menus" class="button primary">Discover restaurants <AppIcon name="arrow" /></router-link><router-link to="/sign-up" class="button secondary">For restaurant owners</router-link></div><div class="hero-footnote"><AppIcon name="check" /> Real places. Thoughtfully curated menus.</div></div>
      <div class="hero-photo"><img src="/images/gourmentkitchen.jpg" alt="Sunlit restaurant with green tiles and warm wooden furniture" fetchpriority="high" /><div class="photo-label"><span class="icon-tile"><AppIcon name="restaurant" /></span><div><strong>A seat at the table.</strong><small>Find a place that feels like you.</small></div></div></div>
    </section>
    <section class="container feature-strip"><div><span class="icon-tile"><AppIcon name="pin" /></span><div><h3>Find your next favorite</h3><p>Explore restaurants and their details.</p></div></div><div><span class="icon-tile"><AppIcon name="menu" /></span><div><h3>A taste of what’s ahead</h3><p>Browse dishes, categories, and prices.</p></div></div><div><span class="icon-tile"><AppIcon name="heart" /></span><div><h3>Keep what you love</h3><p>Save favorite dishes on this device.</p></div></div></section>
    <section class="container story-section"><div class="story-photo"><img src="/images/homeimage.jpg" alt="A cozy restaurant dining room ready for guests" loading="lazy" /></div><div class="story-copy"><p class="eyebrow">MORE THAN A MENU</p><h2>Every great meal begins with a great place.</h2><p>From a quick catch-up to a long-awaited celebration, finding the right restaurant should feel effortless. Get to know the places behind the plates before you visit.</p><ul class="check-list"><li><AppIcon name="check" /> Restaurant details, all in one place</li><li><AppIcon name="check" /> Menus you can explore at your own pace</li><li><AppIcon name="check" /> A direct connection to the restaurant</li></ul><router-link to="/view-restaurants-menus" class="text-link">Find your table <AppIcon name="arrow" /></router-link></div></section>
    <section class="container"><div class="owner-banner"><div><p class="light-eyebrow">FOR THE PEOPLE BEHIND THE PLATES</p><h2>You bring the flavor.<br />We’ll help you share it.</h2><p>Your restaurants, menus, and everyday updates. One calm workspace to keep it all together.</p></div><router-link to="/sign-up" class="button cream">Create your workspace <AppIcon name="arrow" /></router-link></div></section>
  </div>
</template>
<script>
import AppIcon from '../shared/AppIcon.vue';
export default { components: { AppIcon } };
</script>
