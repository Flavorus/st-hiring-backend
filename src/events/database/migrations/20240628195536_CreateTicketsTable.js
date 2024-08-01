/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tickets', table => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable();
    table.string('status').notNullable();
    table.string('type').notNullable();
    table.integer('price').notNullable();
    table.timestamps(true, true);
    table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tickets');
};
