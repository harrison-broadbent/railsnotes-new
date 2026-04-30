---
title: Seed your database with the Faker gem. Then seed 9.4x faster with upsert_all and activerecord-import.
date: "2023-07-15"
tags: ["database", "gem", "faker", "activerecord-import"]
draft: false
description: We use the faker gem to seed our database with 10,000 fake posts. Then, we're going to speed up seeding by 9.4x, using either upsert_all or the activerecord-import gem.
images: ["images/blog/seed-your-database-with-the-faker-gem/cover.png"]
---

> I cover 3 things in this article —
>
> 1. Using the `faker` gem in a Rails app to **seed 10,000 fake records**.
> 2. Fixing our slow seeds by **making them 9.4x faster**, using `upsert_all` or the `activerecord-import` gem (since our naive method is very inefficient).
> 3. Finally, I show you how to **split your database seeds into 3 separate files** — one file for each Rails environment. This way, you won't seed your production database with lots of `faker` generated records.

Every new Ruby on Rails app includes a `seeds.rb` file — it's a simple Ruby script that we use to add initial data to an empty database.

In this article, I'm going to show you **how to combine `seeds.rb` with the [faker gem](https://github.com/faker-ruby/faker) to generate _heaps_ of fake testing data** (we're going to generate 10,000 fake `Post` records with `faker`).

But we're not going to stop there. By default, **Rails will seed our database _incredibly_ inefficiently**, so we're going to speed up our seeding by **9x (minimum)**, by using the new `upsert_all` method introduced in Rails 6 (and the `activerecord-import` gem for older apps).

Finally, I'm going to show you **how to split the `seeds.rb` file into 3 separate files**, to seed our `development`, `test` and `production` environments separately.

Let's go!

## Scaffolding a sample app

To start, I'm going to scaffold a simple app to use in this article (and I recommend you follow along with me).

Our simple Rails app will use the default `sqlite3` database, and include a basic `Post` model. We can generate this by running —

```sh:Terminal
rails new test_faker_gem_seeding && cd test_faker_gem_seeding
rails g scaffold Post title:string body:string
rails db:migrate
rails server
```

These commands will generate the sample app for us, and start the `rails server`. Let's also add a `Post` from the `rails console`, to give our app some initial data —

```sh:Terminal
# run in your terminal
rails c

# run in the rails console
Post.create(title: 'test', body: 'we will use the faker gem to generate more posts')
...
#<Post:0x0000000105207cf8
 id: 1,
 title: "test",
 body: "we will use the faker gem to generate more posts",
 created_at: Wed, 12 Jul 2023 02:17:58.063703000 UTC +00:00,
 updated_at: Wed, 12 Jul 2023 02:17:58.063703000 UTC +00:00>
```

If you visit http://127.0.0.1:3000/posts in your browser, the sample app will be running, and your single `Post` will be there —

![The sample Ruby on Rails app with a single `Post`. The next step is to automatically generate fake `Post` records with the `faker` gem.](images/blog/seed-your-database-with-the-faker-gem/post.png)

Looks good! Our sample Rails app is basic, but it's enough for this article.

In the next section, we're going to add the `faker` gem to our app and use it to generate `Posts` for us in our `seeds.rb` file.

## Seeding our database with the faker gem

Now that we've got our sample Rails app running, we're going to use the [faker gem](https://github.com/faker-ruby/faker) (and some simple Ruby code) to generate fake `Posts`.

We're not just going to seed a paltry few `Posts` either — **we're going to seed 10,000 `Posts`** into our Rails database.

**This will be slow!** Initially, Rails / ActiveRecord will seed our 10,000 `Posts` incredibly inefficiently. In a later section, we're going to use the `activerecord-import` gem to fix this.

The `faker` gem is pretty simple — it generates fake data. This makes it perfect for generating seed data in our Rails apps (`faker` can also be handy for testing, but we won't cover that today).

Here are a couple of fun examples I grabbed from the [official faker gem docs](https://github.com/faker-ruby/faker) —

```ruby:faker_gem_examples
Faker::Internet.email #=> "eliza@mann.test"
Faker::Company.bs #=> "seize collaborative mindshare"
Faker::Movies::HarryPotter.quote #=> "I solemnly swear that I am up to no good."
Faker::Quotes::Shakespeare.romeo_and_juliet_quote # => "O Romeo, Romeo! wherefore art thou Romeo?."
```

To install the `faker` gem, I recommend adding it to your Gemfile under the `:development` group (and maybe also `:test`) like —

```ruby
group :development, :test do
  gem "faker", "~> 3.2"
end
```

and then install it by running `bundle install`.

> You could also just run `bundle add faker`, but I highly recommend keeping it out of your `:production` environment (unless you need it there too, but you probably don't).

Next, test that the `faker` gem is installed correctly by running `rails console` and then -

```sh:rails_console
Faker::Name.name
=> "Chris Stanton II"
```

Looks good! Time to write some database seeds.

A basic `seeds.rb` file for our Rails app might look like this —

```ruby:db/seeds.rb
puts "starting to seed the database"

Post.create(title: Faker::Company.name, body: Faker::Company.bs)

puts "finished seeding the database"
```

Here, we're using the `Faker::Company` generator to generate a `title:` and `body:` for our `Post`, rather than hard-coding values.

> The `faker` gem includes [heaps of other generators](https://github.com/faker-ruby/faker#generators) for generating fake data (over 200!) — poke around a bit and find some you like!

Let's seed our database and see what data `faker` generates for us.

We can run `rails db:reset` to delete our database, recreate it, and re-seed it —

```sh
rails db:reset

Dropped database 'db/development.sqlite3'
Dropped database 'db/test.sqlite3'
Created database 'db/development.sqlite3'
Created database 'db/test.sqlite3'
starting to seed the database
finished seeding the database
```

> I wrote more about the `rails db:` command and database migrations in another post — [Rails Generate Migration Reference Guide](/blog/rails-generate-migration).

We can open the `rails console` and view our `Post` —

```sh:rails_console
Post.all
...
[#<Post:0x0000000105c230e8
  id: 1,
  title: "Mills-Cole",
  body: "disintermediate collaborative users",
  created_at: Wed, 12 Jul 2023 03:27:53.318704000 UTC +00:00,
  updated_at: Wed, 12 Jul 2023 03:27:53.318704000 UTC +00:00>]
```

Looks good! We've seeded our database with a single `Post`, with a `faker`-generated `title` and `body`. Nice!

We're just getting started though — since our `seeds.rb` file is just a plain Ruby file, it's pretty straightforward to generate more records (lots more 😉).

Let's try it. Instead of one `Post`, **let's generate 10,000** —

```ruby:db/seeds.rb
puts "starting to seed the database"
10000.times do |iter|
  puts iter
  Post.create(title: Faker::Company.name, body: Faker::Company.bs)
end
puts "finished seeding the database"
```

> The `faker` gem can generate unique values with `.uniqe` (ex: `Faker::Company.unique.name`). By default though, `faker` doesn't guarantee unique values. Read more in the [faker docs](https://github.com/faker-ruby/faker#ensuring-unique-values).

Run `rails db:reset` and give it a couple of seconds to run, then open up the Rails console again with `rails c`. We can `sample` a random `Post` by running -

```sh:rails_console
Post.all.sample
...
#<Post:0x0000000106b33c18
 id: 6948,
 title: "Hudson, Turner and Kuvalis",
 body: "empower one-to-one content",
 created_at: Wed, 12 Jul 2023 03:35:57.240784000 UTC +00:00,
 updated_at: Wed, 12 Jul 2023 03:35:57.240784000 UTC +00:00>
```

Looks good! Thanks to the `faker` gem, we've seeded our database with 10,000 `Posts` (and saved ourselves a lot of typing along the way 😅).

That's it for this section. Feel free to take a break and play around with the `faker` gem a bit!

**You might have noticed something though** — running `rails db:reset` is **slow**. You probably had to wait 5-10 seconds. We're going to fix this!

The next section is all about fixing our slow seeding.

## Fixing our slow seeds with `upsert_all` and `activerecord-import`

> Note: Thanks to Redditor /u/EOengineer for showing me the `upsert_all` method, included in Rails 6+. Turns out it's even faster than the ActiveRecord Import gem!

You might have noticed that seeding all 10,000 `Posts` takes a while. But how long is a while?

We can `Benchmark` our seeding time in the `rails console` —

```sh:rails_console
Benchmark.measure { Rails.application.load_seed }
...
#<Benchmark::Tms:0x0000000106a3e420
 ...
 @real=7.582148999720812,
 ...
```

> We use the `Rails.application.load_seed` command to load our database seeds from the Rails console.
>
> We wrap `Benchmark.measure` around our call to track the execution time of our seeds (we care about the `@real=7.5` value).

7.5 seconds to seed our database. Too slow!

If you have a more complex `seeds.rb` file, your seeds will take even longer.

Why are our seeds so slow?

When we called `Benchmark`, we saw a lot of SQL `INSERT` statements in the `rails console`, like this —

```sh:rails_console
...
# 10,000 INSERTS like this
TRANSACTION (0.0ms)  begin transaction
Post Create (0.1ms)  INSERT INTO "posts" ...
TRANSACTION (0.2ms)  commit transaction
...
```

When we seed our database, Rails is generating a new `INSERT` statement for each `Post` that we're creating — this is very slow!

**If we could somehow combine all these `INSERT` statements into a single `INSERT`, we could speed up our database seeding by _a lot._**

Well, fortunately, there's an easy fix — Rails 6 introduced the [upsert_all method](https://edgeapi.rubyonrails.org/classes/ActiveRecord/Persistence/ClassMethods.html#method-i-upsert_all) (and similar [insert_all method](https://api.rubyonrails.org/classes/ActiveRecord/Persistence/ClassMethods.html#method-i-insert_all)).

According to the `upsert_all` docs —

> [`upsert_all` will] update or insert (upsert) multiple records into the database in a single SQL INSERT statement. It does not instantiate any models nor does it trigger Active Record callbacks or validations.
>
> Source: [api.rubyonrails.org](https://api.rubyonrails.org/classes/ActiveRecord/Persistence/ClassMethods.html#method-i-upsert_all)

Perfect!

Unfortunately, `upsert_all` is Rails 6+ only. However, I've included a second section which uses the `activerecord-import` gem instead, which supports Rails 3+.

> Note: `upsert` is a "portmanteau" — it's a combination of the words 'update' and 'insert'. In the case of `upsert_all`, we use it to insert a collection of records if they don't exist or update them if they do exist.

### Bulk inserting seed data with `upsert_all` (Rails 6+)

From Rails 6 onwards, Rails includes the `upsert_all` method to help address our problem (too many `INSERT` calls).

> Note: We could have used `insert_all` here instead since we're creating records. `upsert_all` sounded cooler though 😎

Let's refactor our `seeds.rb` file to call `upsert_all` rather than `create` —

```ruby:seeds.rb
puts "starting to seed the database"

posts = []
10000.times do |iter|
  # construct a hash of our Post values
  posts << { title: Faker::Company.name, body: Faker::Company.bs }
end

# create all our Posts with a single INSERT
Post.upsert_all posts
puts "finished seeding the database"
```

Using `Post.upsert_all` requires us to make some changes to our `seeds.rb` file.

First, we construct an array of hashes, with each hash containing the data for a `Post`. Then, we call `Post.upsert_all posts` to insert all 10,000 `Posts` together.

If you re-run the database seeds (`rails db:seed` or `rails db:reset`), you will notice that they run **a lot quicker!**

We can `Benchmark` our seeds again to check how much quicker `upsert_all` is —

```sh:rails_console
Benchmark.measure { Rails.application.load_seed }
...
#<Benchmark::Tms:0x00000001151182b0
 ...
 @real=0.8027799999841955,
 ...
```

We've gone from 7.5 seconds down to 0.8 seconds — that's a speedup of **9.4x**! 🤯

This speedup is from creating all our `Posts` together, rather than creating them one by one.

> References:
>
> - [upsert_all docs](https://edgeapi.rubyonrails.org/classes/ActiveRecord/Persistence/ClassMethods.html#method-i-upsert_all)
> - [insert_all docs](https://api.rubyonrails.org/classes/ActiveRecord/Persistence/ClassMethods.html#method-i-insert_all)

### Bulk inserting seed data with the ActiveRecord Import gem (Rails 3+)

If you're not running Rails 6+, you won't be able to use `upsert_all` or `insert_all` to bulk-insert your records. That's OK — instead, you can use the [ActiveRecord Import gem](https://github.com/zdennis/activerecord-import) to do the same thing.

Just like `upsert_all`, the `activerecord-import` gem will combine all our `INSERT` statements, so we can seed our `Posts` in bulk.

> I recommend you read through the `activerecord-import` gem's [README](https://github.com/zdennis/activerecord-import#activerecord-import-).

Let's add the gem to our `Gemfile`, in the same group as the `faker` gem —

```ruby:Gemfile
group :development, :test do
  gem "faker", "~> 3.2"
  gem "activerecord-import", "~> 1.4"
end
```

> Don't forget to `bundle` after adding the `activerecord-import` gem.

Next, we need to refactor our `seeds.rb` code.

Adjust your `seeds.rb` file to look like this —

```ruby:seeds.rb
puts "starting to seed the database"

posts = []
10000.times do |iter|
  # construct a hash of our Post values
  posts << { title: Faker::Company.name, body: Faker::Company.bs }
end

# use .import from the activerecord-import gem
Post.import posts
puts "finished seeding the database"
```

This `seeds.rb` file, using `activerecord-import`, is nearly identical to the `upsert_all` file. All we've changed is `Post.upsert_all` — we've replaced it with `Post.import`.

Run these seeds, and you'll notice that they run **a lot quicker** than our naive `seeds.rb` file.

Let's `Benchmark` our `activerecord-import` seeding —

```sh:rails_console
Benchmark.measure { Rails.application.load_seed }

#<Benchmark::Tms:0x00000001168bd438
 ...
 @real=1.5487040001899004, # 5x faster than before!
 ...
```

From `7.5` seconds down to `1.5` - 5x faster!

Note that this is about 1.8x slower than using `upsert_all` (from the previous section), but still a massive improvement over our naive `seeds.rb` file.

## Splitting our seed files by Rails environments

We've used the `faker` gem to seed 10,000 fake `Posts` into our database, and now our seeds are running much quicker thanks to either `upsert_all` or `activerecord-import`.

However, we probably **don't** want to seed our production database with all this fake data!

I've got a handy way to split up your database seeds, by creating a new seeds file for each Rails environment.

> Disclaimer: copied this method from a great [StackOverflow thread](https://stackoverflow.com/questions/16808471/ruby-on-rails-way-to-create-different-seeds-file-for-environments).
>
> I also wrote about this method more in a separate article — [Split your database seeds.rb by Rails environment](/blog/split-seeds-rb-by-rails-environment).

First, create a `seeds/` folder inside the `/db` folder of your Ruby on Rails app —

```sh:rails_app/db
mkdir seeds/
```

And then, inside the `seeds/` folder, we're going to create 3 new files, one for each environment —

```sh:rails_app/db/seeds
touch development.rb test.rb production.rb
```

> Note: I've provided the shell commands so you can copy/paste them. You can also create the `seeds/` folder and seed files manually if that's easier.

Next, copy the contents of your `seeds.rb` file into your `seeds/development.rb` file —

```ruby:seeds/development.rb
# COPIED from seeds.rb
puts "starting to seed the database"

posts = []
10000.times do |iter|
  posts << Post.new(title: Faker::Company.unique.name, body: Faker::Company.unique.bs)
end
Post.import posts

puts "finished seeding the database"
```

And then edit your main `seeds.rb` file to be the following —

```ruby:db/seeds.rb
puts Rails.env.downcase

# load the correct seeds file for our Rails environment
load(Rails.root.join( 'db', 'seeds', "#{Rails.env.downcase}.rb"))
```

That's it! Now, when you run `rails db:seed`, Rails will use the seed file for the active `Rails.env` environment.

> This also works for other commands which run `rails db:seed`, like `rails db:reset`.

Now you can keep your production database free from all the `faker`-generated `Posts`, but still use a large dataset in your development environment.

If you want to seed your local database with seeds for a different environment, you can do that too with —

```sh:Terminal
# production seeds
rails db:seed RAILS_ENV=production

# test seeds
rails db:seed RAILS_ENV=test
```

## Conclusion

I hope you found this article useful!

I think developing on a large dataset is important — it helps you experience your app in a more production-like environment.

I've found this a helpful way to spot N+1 queries that creep in — you won't notice them on an empty database, but you will with 10,000 `Posts`!
