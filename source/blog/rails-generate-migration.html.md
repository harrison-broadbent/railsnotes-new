---
title: Rails Generate Migration (handy reference)
date: "2023-07-10"
tags: ["database", "migrations", "generators", "popular"]
draft: false
description: A handy reference for generating migrations in your Ruby on Rails app — I cover the basics like adding columns and tables, adjusting column types (and loads more), plus some tips and tricks...
images: ["images/blog/rails-generate-migration/cover.png"]
---

> This article is a handy reference for generating migrations in your Ruby on Rails apps. **Use the table of contents (below)** to find the migration you're after quickly.
>
> I also built a GUI tool to help write `rails generate migration` commands. Check it out — [Rails Migration Generator Command Builder](https://railsg.xyz/migration).

There are a few core migrations that we generate again and again in a Ruby on Rails app —

- **creating a table ([link](https://railsnotes.xyz/blog/rails-generate-migration#create-a-table--rails-generate-migration-createtable)),**
- **adding a column ([link](https://railsnotes.xyz/blog/rails-generate-migration#add-a-column--rails-generate-migration-addcolumntotable)),**
- **adding indexes (part of above),**
- **removing a column ([link](https://railsnotes.xyz/blog/rails-generate-migration#remove-a-column--rails-generate-migration-removecolumnfromtable)),**
- and more!

I've covered these basics in a handy format below &ddarr;

## Rails Generate Migration commands — 

### Create a Table

When **creating a table**, ActiveRecord can infer the contents of our migration file for us.

To generate the migration to create a table, run —

```sh:Terminal
# generate a migration to CREATE A TABLE
rails generate migration CreateBlogPost title:string:index body:text
```

Which will generate the following migration —

```ruby:20230706225210_create_blog_post.rb
class CreateBlogPost < ActiveRecord::Migration[7.0]
  def change
    create_table :blog_posts do |t|
      t.string :title
      t.text :body

      t.timestamps
    end
    add_index :blog_posts, :title
  end
end
```

> Note: by specifying `title:string:index`, ActiveRecord automatically generated the `add_index` command for us as part of the migration.

**If we wanted to add a `NOT NULL` constraint and a default value for one of the columns in our table**, we could do that by editing our migration file, and editing the relevant line like —

```ruby:20230706225210_create_blog_post.rb
t.string :title, null: false, default: ""
```

By adding `null: false, default: ""`, we enforce a `NOT NULL` constraint and set a default value of `""` on our column.

### Reference another Table

Migrations which reference other tables are common in a Rails app — these migrations will generate a new column with reference to another table; These columns are typically for associations between models (`has_many`, `belongs_to` etc.)

You can generate a migration to **reference another table** by running —

```sh:Terminal
# generate a migration to ADD A REFERENCE TO ANOTHER TABLE
rails generate migration AddUserRefToBlogPost user:references
```

As usual, Rails will infer the table name when we generate the migration. By default, Rails will also set `null: false, foreign_key: true` —

```ruby:20230707110855_add_user_ref_to_blog_post.rb
class AddUserRefToBlogPost < ActiveRecord::Migration[7.0]
  def change
    add_reference :blog_posts, :user, null: false, foreign_key: true
  end
end
```

### Add a Column

> This section covers: adding a column, adding an index, adding a `NOT NULL` constraint, and setting a default value.

**Adding a column** to an existing table is the migration you'll probably create the most. We add a column like this —

```sh:Terminal
# generate a migration to ADD A COLUMN
rails generate migration AddViewsToBlogPost views:integer
```

Which will generate a migration like this —

```ruby:20230707025208_add_views_to_blog_post.rb
class AddViewsToBlogPost < ActiveRecord::Migration[7.0]
  def change
    add_column :blog_posts, :views, :integer
  end
end
```

In general, the format for adding a column in an ActiveRecord migration is —

```sh:Terminal
rails generate migration AddColumnToTable column:type
```

By writing our migration command correctly, Rails will auto-fill the table name, column name and column type into the generated migration.

When running the [migration generator](https://railsg.xyz/migration), **we can add an index** to the column by typing `column:type:index`.

The command looks like this —

```sh:Terminal
# add an index with column_name:type:index
rails generate migration AddViewsToBlogPost views:integer:index
```

Which will generate a migration which includes an `add_index` like this —

```ruby:20230707025208_add_views_to_blog_post.rb
class AddViewsToBlogPost < ActiveRecord::Migration[7.0]
  def change
    add_column :blog_posts, :views, :integer
    add_index :blog_posts, :views
  end
end
```

> Note: indexes can be a bit of a [sharp knife](https://rubyonrails.org/doctrine#provide-sharp-knives). An excellent article about indexes in Rails/ActiveRecord is this one — [using indexes in Rails | tomafro.](https://tomafro.net/2009/08/using-indexes-in-rails-index-your-associations)

ActiveRecord will also let us specify a `NOT NULL` constraint and a default value on our column inside our migration — unfortunately, we can't generate this automatically.

**To add a `NOT NULL` constraint and a default value** to a column, we need to generate a migration, then edit it like —

```ruby:20230707025208_add_views_to_blog_post.rb
class AddViewsToBlogPost < ActiveRecord::Migration[7.0]
  def change
    # OLD:
    # add_column :blog_posts, :views, :integer
    # NEW:
    # add a NOT NULL constraint and a default value of 0 to the column
    add_column :blog_posts, :views, :integer, null: false, default: 0
  end
end
```

We use `null: false` to enforce a `NOT NULL` constraint on the column, and `default: 0` to specify a default value of `0 (integer)`. Make sure you adjust your migration to have the correct value and the correct data type for your new column.

### Remove a Column

**Removing a column** is the inverse of creating one. If we run a `rails generate migration` command like this —

```sh:Terminal
# generate a migration to REMOVE A COLUMN
rails generate migration RemoveViewsFromBlogPost views:integer
```

Rails will automatically generate a migration like this —

```ruby:db/migrate/20230709003233_remove_views_from_blog_post.rb
class RemoveViewsFromBlogPost < ActiveRecord::Migration[7.0]
  def change
    remove_column :blog_posts, :views, :integer
  end
end
```

Again, Rails will automatically fill the `table_name`, `column_name`, and `column_type`, based on the information we pass to `rails generate migration`.

If you added an index in your migration, make sure to adjust the command to `rails generate migration RemoveViewsFromBlogPost views:integer:index` to remove the index too.

This will generate a migration like this —

```ruby:db/migrate/20230709003233_remove_views_from_blog_post.rb
class RemoveViewsFromBlogPost < ActiveRecord::Migration[7.0]
  def change
    remove_column :blog_posts, :views, :integer
    remove_index :blog_posts, :views
  end
end
```

Even though [Rails will remove the index from Rails 4 upwards](https://stackoverflow.com/questions/7204476/will-removing-a-column-with-a-rails-migration-remove-indexes-associated-with-the/27622694#27622694), you should make sure to add `:index` to ensure your migration is reversible. If you try to `db:rollback` your `RemoveIndex` migration, but you forgot to add `:index`, Rails won't rollback your migration correctly.

(Thanks to /u/lommer0 on Reddit for pointing this out to me!)

### Rename a Column

ActiveRecord makes renaming a column simple, as usual, but with one small hiccup.

When we generate our migration, **Rails can't automatically infer what we're trying to do here** — it just generates an empty `def change` method, and we have to fill out the migration steps.

**To rename a column**, we first need to generate our migration —

```sh:Terminal
# generate a migration to RENAME A COLUMN
rails generate migration RenameViewsToViewsCountInBlogPosts
```

Which will generate our empty migration, as expected —

```ruby:20230707030059_rename_views_to_views_count_in_blog_posts.rb
class RenameViewsToViewsCountInBlogPosts < ActiveRecord::Migration[7.0]
  def change
  end
end
```

Then, we have to open the migration up and add `rename_column :table_name, :old_column_name, :new_column_name`. Your migration might look like this —

```ruby:20230707030059_rename_views_to_views_count_in_blog_posts.rb
class RenameViewsToViewsCountInBlogPosts < ActiveRecord::Migration[7.0]
  def change
    rename_column :blog_posts, :views, :views_count
  end
end
```

### Change a Column's type

**Changing a column's type** has the same hiccup as renaming it. Rails can't auto-generate the `change_column` command for us. As with renaming a column, we'll need to edit our ActiveRecord migration file.

First, generate the migration —

```sh:Terminal
# generate a migration to CHANGE A COLUMN'S TYPE
rails generate migration ChangeViewsCountTypeInBlogPosts
```

This will generate the following empty migration —

```ruby:20230709004004_change_views_count_type_in_blog_posts.rb
class ChangeViewsCountTypeInBlogPosts < ActiveRecord::Migration[7.0]
  def change
  end
end
```

As before, we need to edit the migration ourselves, and add a `change_column :table_name, :old_type, :new_type` command like —

```ruby:20230709004004_change_views_count_type_in_blog_posts.rb
class ChangeViewsCountTypeInBlogPosts < ActiveRecord::Migration[7.0]
  def change
    change_column :blog_posts, :views, :float
  end
end
```

## Some helpful Rails Migration patterns, tips and tricks

In this section, I've included some handy information and commands that I use when I'm working with ActiveRecord, or generating Rails migrations with `rails generate migration`.

If you've got other handy database / migration related commands that you think would be worth adding, please reach out!

### ActiveRecord migration data types

ActiveRecord supports the following data types when generating migrations in our Rails apps:

```ruby:activerecord_migration_types.rb
:primary_key  # A unique key that can identify each record in a model.
:string       # Used for small data types such as titles.
:text         # Used for longer pieces of textual data such as paragraphs of information.
:integer      # Used for storing whole numbers.
:float        # Used for storing floating-point numbers.
:decimal      # Used for storing decimal numbers.
:datetime     # Stores both date and time components.
:timestamp    # Stores both date and time components.
:time         # Stores only the time component.
:date         # Stores only the date component.
:binary       # Used for storing binary data such as images, audio, or movies.
:boolean      # Stores true or false values.
```

So, when you generate a migration with a command like -

```sh:Terminal
rails generate migration AddColumn column_name:type
```

Make sure `:type` matches one of these supported data types, so that ActiveRecord can generate your migration correctly.

### Rolling back migrations

Rolling back migrations is pretty common, and Rails has a few helpful commands to make it easy.

If you want to rollback the last `3` migrations, you can run —

```sh:Terminal
rails db:rollback STEP=3
```

Of course, you can adjust `STEP=` to rollback the correct number of migrations.

Rails also includes the `rails db:migrate:redo` command, which is equivalent to a `rails db:rollback` followed by a `rails db:migrate`.

To redo the last `3` migrations, you can run —

```sh:Terminal
rails db:migrate:redo STEP=3
```

Adjusting `STEP=` to redo the correct number of migrations, same as before.

### Setting up your database

The `rails db:setup` command will create the database, load the schema, and initialize it with the seed data. Running `rails db:setup` is equivalent to —

```sh:Terminal
rails db:create
rails db:schema:load
rails db:seed
```

### Resetting your Database

The `rails db:reset` command will drop the database and set it up again. Running `rails db:reset` is equivalent to —

```sh:Terminal
rails db:drop
rails db:setup
```

### Use the `rails g` shorthand

This is more of a general tip for working with the `rails` command, and the Rails generator commands.

The `rails` command supports heaps of shorthands, — a handy one for us, since we're generating migrations, is `rails g migration`.

Running `rails g migration command` is identical to running `rails generate migration command`, just 7 characters shorter.

For instance, to add a column, we might run —

```sh:Terminal
rails g migration AddColumn column_name:type
```

This is a general tip for working with `rails generate` — we can use `rails g` to run any of the Rails generators, like `rails g model` or `rails g scaffold_controller`.
