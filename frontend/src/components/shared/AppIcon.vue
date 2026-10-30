<template>
  <component :is="icon" class="app-icon" :size="20" :stroke-width="1.7" aria-hidden="true" focusable="false" />
</template>

<script>
import {
  ArrowLeft, ArrowRight, Banknote, Check, ChevronRight, ClipboardList, Clock,
  ExternalLink, Heart, Image, LayoutDashboard, List, LogOut, MapPin, Menu,
  Plus, Search, SquarePen, Star, Store, Table2, Trash2, UtensilsCrossed, X,
} from '@lucide/vue';

const icons = {
  grid: LayoutDashboard,
  restaurant: Store,
  menu: UtensilsCrossed,
  table: Table2,
  orders: ClipboardList,
  plus: Plus,
  arrow: ArrowRight,
  external: ExternalLink,
  logout: LogOut,
  search: Search,
  edit: SquarePen,
  trash: Trash2,
  close: X,
  check: Check,
  image: Image,
  pin: MapPin,
  chevron: ChevronRight,
  back: ArrowLeft,
  heart: Heart,
  star: Star,
  clock: Clock,
  list: List,
  money: Banknote,
  navigation: Menu,
};

export default {
  props: { name: { type: String, default: 'grid' } },
  computed: { icon() { return icons[this.name] || icons.grid; } },
};
</script>
