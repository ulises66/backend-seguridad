// migrations/20251105_create_users_table.js
exports.up = function (knex) {
    return knex.schema.createTable("users", (table) => {
        table.increments("id").primary();
        table.string("name", 100).notNullable();
        table.string("email", 150).notNullable().unique();
        table.string("password", 100).notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("users");
};
