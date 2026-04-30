---
title: Split your database seeds.rb by Rails environment
date: "2023-07-31"
tags: ["database", "seeding", "tips"]
draft: false
description: This method to split your database seeds by Rails environment is clean and simple, and is perfect to split up your `seeds.rb` file. It's a brilliant method! I just wish I'd thought of it first 😅
images: ["images/blog/split-seeds-rb-by-rails-environment/cover.png"]
---

> **Question: Why split the `seeds.rb` file in your Rails app?**
>
> Answer: The `seeds.rb` file in a Ruby on Rails app can be a double-edged sword.
>
> On one hand, it's very useful! The `seeds.rb` file makes it easy to pre-populate your database with data for development or production. Unfortunately though, since each Ruby on Rails app only has a single `seeds.rb` file, it can quickly get cluttered. Plus, there's bound to be data you want to seed in production, but not development (or vice-versa).
>
> That's where this article comes in! **This short guide will show you how split your `seeds.rb` file into 3 separate files, one for each Rails environment.**
>
> This will help you organise your database seeds better, and let you seed data for development without cluttering your production app.
>
> Note: This article was extracted from [Seed you database with the Faker gem](/blog/seed-your-database-with-the-faker-gem) and is based on this great [StackOverflow thread.](https://stackoverflow.com/questions/16808471/ruby-on-rails-way-to-create-different-seeds-file-for-environments)

Every new Ruby on Rails app includes a `seeds.rb` file.

The `seeds.rb` file let's us seed sample data into the database of our Rails apps, which can come in **very handy**.

For instance, in the article [Seed you database with the Faker gem](/blog/seed-your-database-with-the-faker-gem), I created this `seeds.rb` file —

```ruby:db/seeds.rb
# Seed 1000 test Posts for development

posts = []
1000.times do |iter|
  posts << { title: "Post #{iter}" }
end

Post.upsert_all posts
```

This `seeds.rb` file creates 1000 `Posts`, to help our local dev environment mirror a more production-like one (where there will be a lot of existing data in the database).

In production, `seeds.rb` can come in handy too — for instance, you might want to ensure an `Admin` user exists in your app.

**There's just one big problem with `seeds.rb` — it's just one file!**

**And the seeds you want in development are (probably) different to the ones you want in production!**

For instance, you probably **don't** want to seed 1000 fake `Posts` into your production database! And yet, Rails only gives us a single `seeds.rb` file for all our seeding.

**We can fix this though!** This article will show you **how to split your Rails database `seeds.rb` file into 3 separate files — one for each of your Rails environments** (development, testing and production).

Let's get started.

## Splitting your seed files by Rails environment

Like I said above, working with `seeds.rb` in a Rails app is always a bit tricky, since most of the time, we want to seed different data depending on our Rails environment.

Well, I've got a handy way to split up our `seeds.rb` file, by creating a new seeds file for each Rails environment.

We'll create the following files — `seeds/development.rb`, `seeds/test.rb` and `seeds/production.rb` — which will let you run different database seeds for each environment in your Ruby on Rails app.

**The best thing is, splitting up our seeds is easy!**

First, create a `seeds/` folder inside the `/db` folder of your Ruby on Rails app —

```sh:rails_app
mkdir db/seeds/ && cd db/seeds/
```

And then, inside the `seeds/` folder, create 3 new files for seeding each environment —

```sh:rails_app/db/seeds
touch development.rb test.rb production.rb
```

> Note: I've provided the shell commands so you can copy/paste them. You can also create the `seeds/` folder and seed files manually if that's easier.

Finally, you need to edit your main `seeds.rb` file to be the following —

```ruby:db/seeds.rb
puts Rails.env.downcase

# load the correct seeds file for our Rails environment
load(Rails.root.join( 'db', 'seeds', "#{Rails.env.downcase}.rb"))
```

**So what's going on here?**

This line in our `seeds.rb` file is the key to everything —

```ruby:seeds.rb
load(Rails.root.join( 'db', 'seeds', "#{Rails.env.downcase}.rb"))
```

Now, whenever we run our database seeds, `seeds.rb` will load the matching db seeds for our current `Rails.env`, from the `db/seeds/` folder of our Ruby on Rails app.

So now, if there are seeds you only want to run in your development environment, all you have to do is add them to `db/seeds/development.rb`. Likewise for `testing.rb` and `production.rb`.

This adjustment will affect anything that loads your `seeds.rb` file, including —

- Running `rails db:seed` or `rails db:seed:replant`.
- Running `rails db:reset`.
- And running `Rails.application.load_seed` from within the `rails console`.
- Plus any other command which loads `seeds.rb`.

## Running our seeds/development.rb file

Before this article finishes, I wanted to show you what the practical effects of our changes are.

I'll use the example from earlier in this article, where we seeded 1000 `Posts` inside our `seeds.rb` file.

Since we only want to seed these `Posts` in our development environment, we're going to move this code into our `seeds/development.rb` file.

Let's do that now —

```ruby:seeds/development.rb
# COPIED from our original seeds.rb file

posts = []
1000.times do |iter|
  posts << Post.new(title: Faker::Company.unique.name, body: Faker::Company.unique.bs)
end
Post.import posts
```

That's it! Now, when you run `rails db:seed`, Rails will use the seed file for the active `Rails.env` environment.

Now if we run our database seeds locally, you'll see that our development seeds get run —

```sh:Terminal
rails db:seed

development
...
```

If you want to run your database seeds for a different Rails environment (or just check that our method of splitting our `seeds.rb` file has worked), you can do that too by exporting `RAILS_ENV` —

```sh:Terminal
RAILS_ENV=production rails db:seed

production
...
```

## Conclusion

I hope you found this article useful!

I decided to extract this from my [Seed your database with the Faker gem](/blog/seed-your-database-with-the-faker-gem) article because it was so difficult to find this method initially.

And it's a brilliant method! I wish I'd thought of it first 😅

When I was initially searching around for ways to split up my database seeds in a Ruby on Rails app, I kept finding methods that were a lot more complicated than they needed to be.

This method of splitting database seeds by Rails environment is super clean and simple and is suitable for most situations where you want to split up your `seeds.rb` file.
