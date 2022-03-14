const { Router } = require('express');
const Order = require('../models/Order');
const pool = require('../utils/pool');

module.exports = Router()
  .post('/', async (req, res) => {
    const response = await Order.insert({
      product: req.body.product,
      quantity: req.body.quantity,
    });

    res.json(response);
  })

  .get('/:id', async (req, res, next) => {
    try {
      const order = await Order.getById(req.params.id);
      res.send(order);
    } catch (error) {
      error.status = 404;
      next(error);
    }
  })

  .get('/', async (req, res) => {
    const response = await Order.getAll();

    res.send(response);
  })

  .patch('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `
        SELECT * FROM orders WHERE id=$1;
        `,
        [id]
      );
      const existingOrder = result.rows[0];

      if (!existingOrder) {
        const error = new Error(`Order ${id} not found`);
        error.status = 404;
        throw error;
      }

      const product = req.body.product ?? existingOrder.product;
      const quantity = req.body.quantity ?? existingOrder.quantity;
      const { rows } = await pool.query(
        'UPDATE orders SET product=$2, quantity=$3 WHERE id=$1 RETURNING *;',
        [id, product, quantity]
      );
      const order = new Order(rows[0]);

      res.json(order);
    } catch (error) {
      next(error);
    }
  })

  .delete('/:id', async (req, res) => {
    const { rows } = await pool.query(
      'DELETE FROM orders WHERE id=$1 RETURNING *;',
      [req.params.id]
    );

    if (!rows[0]) return null;
    const order = new Order(rows[0]);

    res.json(order);
  });
