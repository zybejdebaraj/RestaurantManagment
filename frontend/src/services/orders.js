export const nextStatus = { pending: 'preparing', preparing: 'ready', ready: 'served', served: 'completed' };
export const statusActions = { pending: 'Start preparation', preparing: 'Mark ready', ready: 'Mark served', served: 'Complete order' };
export const isActive = order => !['completed', 'cancelled'].includes(order.status);
export function totalCents(items, menus) {
  return items.reduce((total, item) => {
    const menu = menus.find(menu => Number(menu.id) === Number(item.menu_id));
    return total + Math.round(Number(menu?.price ?? item.unit_price ?? 0) * 100) * item.quantity;
  }, 0);
}
