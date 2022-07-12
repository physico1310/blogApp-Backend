const knex = require("knex")({
    client: "mysql",
    connection: {
        host: "localhost",
        user: "root",
        password: "Mahendra@1",
        database: "blogBackend",
    },
});

// table for useres
knex.schema.hasTable('users').then(exists => {
    if (!exists) {
      return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name');
        table.string('email');
        table.string("password");
      });
    }
});


// table for blogs
knex.schema.hasTable('blogs').then(exists => {
    if (!exists) {
      return knex.schema.createTable('blogs', (table) => {
        table.increments("id").primary();
        table.integer('user_id').unsigned().nullable()
        table.string("title");
        table.text("content");
        table.foreign('user_id').references('users.id')
        table.timestamp('created_at').defaultTo(knex.fn.now())
      });
    }
});


// table for reactions
knex.schema.hasTable('reactions').then(exists => {
    if (!exists) {
      return knex.schema.createTable('reactions', (table) => {
        table.increments("id").primary();
        table.integer('user_id').unsigned().nullable()
        table.integer('blog_id').unsigned().nullable()
        table.integer("likes").defaultTo(0);
        table.integer("dislikes").defaultTo(0);
        table.foreign('blog_id').references('blogs.id')
        table.foreign('user_id').references('users.id')
      });
    }
});

// table for comments

module.exports = knex