/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('events', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.string('location').nullable();
    table.dateTime('date').notNullable();
    table.timestamps(true, true);
  });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('events');
};
