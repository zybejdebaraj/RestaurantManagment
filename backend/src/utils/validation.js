const restaurantImage = '/images/restaurant-placeholder.svg';
const menuImage = '/images/menu-placeholder.svg';
const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });
const validId = (value) => ['string', 'number'].includes(typeof value) && /^\d+$/.test(String(value)) && Number.isInteger(Number(value)) && Number(value) > 0 && Number(value) <= 2147483647;
const validText = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
const safeImage = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  if (/^(https?:\/\/|\/(?!\/))/i.test(value)) return value;
  if (value.length <= 7 * 1024 * 1024 && /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=\r\n]+$/i.test(value)) return value;
  return fallback;
};

const menuFields = (body) => {
  const { name, price, description = '', category = 'Main Course', restaurant_id } = body;
  if (!validId(restaurant_id) || !validText(name, 100)
    || !['number', 'string'].includes(typeof price) || String(price).trim() === ''
    || !Number.isFinite(Number(price)) || Number(price) < 0 || Number(price) > 99999999.99
    || typeof description !== 'string' || description.length > 5000 || !validText(category, 100)) return null;
  return [restaurant_id, name.trim(), Number(price), description.trim(), category.trim(), safeImage(body.image, menuImage)];
};

const restaurantValues = (body) => validText(body.name, 100) && validText(body.address, 255) && validText(body.contact, 50)
  ? [body.name.trim(), body.address.trim(), body.contact.trim(), safeImage(body.image, restaurantImage)] : null;

module.exports = { publicUser, validId, validText, safeImage, menuFields, restaurantValues };
