const pool = require('../utils/pool');

module.exports = class Order {
  id;
  product;
  quantity;

  constructor(row) {
    this.id = row.id;
    this.product = row.product;
    this.quantity = row.quantity;
  }

  static async insert({ product, quantity }) {
    const { rows } = await pool.query(
      'INSERT INTO orders(product, quantity) VALUES ($1, $2) RETURNING *;',
      [product, quantity]
    );
    return new Order(rows[0]);
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM orders;');
    const orders = rows.map((row) => new Order(row));
    return orders;
  }

  static async getById(id) {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1;', [
      id,
    ]);
    if (!rows[0]) return null;
    return new Order(rows[0]);
  }

  static async updateById(id, { product, quantity }) {
    const result = await pool.query(
      `
      SELECT * FROM orders WHERE id=$1;
      `,
      [id]
    );
    const existingOrder = result.rows[0];

    const newProduct = product ?? existingOrder.product;
    const newQuantity = quantity ?? existingOrder.quantity;

    const { rows } = await pool.query(
      'UPDATE orders SET product=$2, quantity=$3 WHERE id=$1 RETURNING *;',
      [id, newProduct, newQuantity]
    );
    console.log('rows', rows);
    return new Order(rows[0]);
  }

  static async deleteById(id) {
    const { rows } = await pool.query(
      'DELETE FROM orders WHERE id=$1 RETURNING *;',
      [id]
    );

    if (!rows[0]) return null;
    return new Order(rows[0]);
  }
};
