module.exports = function (db) {
  const express = require('express');
  const router = express.Router();

  // Helper function to convert price to number
  const convertPriceToNumber = (menuItem) => {
    return {
      ...menuItem,
      price: parseFloat(menuItem.price)
    };
  };

  // CREATE menu
  router.post('/', (req, res) => {
    const { restaurant_id, name, price, description, category, image } = req.body;
    if (!restaurant_id || !name || !price || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    db.query(
      'INSERT INTO menus (restaurant_id, name, price, description, category, image) VALUES (?, ?, ?, ?, ?, ?)',
      [restaurant_id, name, price, description, category || 'Main Course', image || null],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const newMenuItem = { 
          id: result.insertId, 
          restaurant_id, 
          name, 
          price: parseFloat(price), 
          description,
          category: category || 'Main Course',
          image: image || null
        };
        res.status(201).json(newMenuItem);
      }
    );
  });

  // READ all menus
  router.get('/', (req, res) => {
    db.query('SELECT * FROM menus', (err, results) => {
      if (err) {
        console.error('Error fetching menus:', err);
        res.status(500).json({ error: 'Failed to fetch menus' });
        return;
      }
      res.json(results);
    });
  });

  // READ menus by restaurant
  router.get('/restaurant/:restaurantId', (req, res) => {
    const restaurantId = req.params.restaurantId;
    
    // First check if restaurant exists
    db.query('SELECT * FROM restaurants WHERE id = ?', [restaurantId], (err, results) => {
      if (err) {
        console.error('Error checking restaurant:', err);
        res.status(500).json({ error: 'Failed to check restaurant' });
        return;
      }
      
      if (results.length === 0) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
      
      // Get menus for the restaurant
      db.query('SELECT * FROM menus WHERE restaurant_id = ?', [restaurantId], (err, menuResults) => {
        if (err) {
          console.error('Error fetching menus:', err);
          res.status(500).json({ error: 'Failed to fetch menus' });
          return;
        }
        res.json(menuResults);
      });
    });
  });

  // READ single menu
  router.get('/:id', (req, res) => {
    db.query('SELECT * FROM menus WHERE id = ?', [req.params.id], (err, results) => {
      if (err) {
        console.error('Error fetching menu:', err);
        res.status(500).json({ error: 'Failed to fetch menu' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'Menu not found' });
        return;
      }
      res.json(results[0]);
    });
  });

  // UPDATE a menu
  router.put('/:id', (req, res) => {
    const { name, price, description, category, image, restaurant_id } = req.body;
    
    db.query(
      'UPDATE menus SET name = ?, price = ?, description = ?, category = ?, image = ?, restaurant_id = ? WHERE id = ?',
      [name, price, description, category, image, restaurant_id, req.params.id],
      (err, result) => {
        if (err) {
          console.error('Error updating menu:', err);
          res.status(500).json({ error: 'Failed to update menu' });
          return;
        }
        if (result.affectedRows === 0) {
          res.status(404).json({ error: 'Menu not found' });
          return;
        }
        res.json({ message: 'Menu updated successfully' });
      }
    );
  });

  // DELETE a menu
  router.delete('/:id', (req, res) => {
    db.query('DELETE FROM menus WHERE id = ?', [req.params.id], (err, result) => {
      if (err) {
        console.error('Error deleting menu:', err);
        res.status(500).json({ error: 'Failed to delete menu' });
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Menu not found' });
        return;
      }
      res.json({ message: 'Menu deleted successfully' });
    });
  });

  return router;
};
