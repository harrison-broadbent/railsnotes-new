---
title: Skip the console with Rails Runner
date: "2023-08-04"
tags: ["tips", "console"]
draft: false
description: If you're sick of typing rails console all day, or just want to learn about a cool Rails command, I've got something that you're going to like — the rails runner command.
images: ["images/blog/skip-rails-console-with-rails-runner/cover.png"]
---

> If you're getting RSI from typing `rails console` all day, I've got something to show you — `rails runner`. The `rails runner` command is a handy Rails command to run commands inside our Rails console, directly from our terminal!
>
> Be prepared for your productivity to... marginally increase at best 😅 Jokes aside, `rails runner` is super handy, and I wish I'd known about it sooner.

**If you're sick of typing `rails console` all day,** or just want to learn about a cool Rails command, I've got something cool for you. It's the `rails runner` command.

**`rails runner` lets us run commands from inside the context of our Rails apps, without having to open up the `rails console`.** This is a massive timesaver!

**`rails runner` has an extra trick up its sleeve though — we can use it to run scripts!** This is great for longer jobs or complex production changes.

In this article, I'll walk you through everything you need to know about `rails runner`, including —

- running single commands
- running long scripts
- running in a specific Rails environment with the `-e` flag

Let's go!

## Run single commands with `rails runner`

From the [official Ruby on Rails documentation — ](https://guides.rubyonrails.org/command_line.html#bin-rails-runner)

> `bin/rails runner` ... runs Ruby code in the context of Rails non-interactively.

Essentially, with `rails runner`, we can run commands directly inside the Rails console, from the terminal —

```sh:Terminal
# inside our regular teminal
> rails runner "puts User.first.email"
test@example.com
```

The alternative would be, of course, opening up the Rails console —

```sh:Terminal
❯ rails console
Loading development environment (Rails 7.0.6)
irb(main):001:0> puts User.first.email
test@example.com
=> nil
irb(main):002:0> exit
```

With `rails runner`, we cut out entering the `rails console` entirely! **This is a big time saver.**

Your `rails runner` commands also stay in your terminal history, making them easy to find later (rather than losing them to the `rails console`).

Any output, like logging or `puts` statements, should show up as you'd expect.

> Note: like most `bin/rails` commands, `rails runner` has a handy shorthand — `rails r`.

## Run scripts with `rails runner script.rb`

The `rails runner` command is great for short commands. But what about more complex tasks?

We could create a `rake` task, or `load()` a script from inside our `rails console`, but `rails runner` gives us an easier option.

We can pass `rails runner` a script directly, by calling `rails runner path/to/script.rb`. When we do this, `rails runner` will run our script, in the context of our Rails app (as if it were inside the `rails console`).

Here's an example.

Say we have a script (below), to run on the production instance of our Ruby on Rails app, to update old `Post` records.

We don't want to run it in the `rails console` directly — the code is too complex. Instead, we can create a script, then run it with `rails runner`.

> Note: It's best practice to store one-off scripts like this inside `lib/`.

```ruby:lib/archive_posts.rb
# We'll run this script with "rails runner script"

# Get all posts older than 30 days
posts = Post.where('created_at < ?', 30.days.ago)
puts "Found #{posts.count} posts older than 30 days."

# Iterate over each post
posts.each do |post|
  if post.likes > 100
    post.update(category: "top-article")
  else
    post.archive!
  end
end

puts "Finished processing posts."

```

Since the script is inside the `lib` directory, we can run it with —

```sh:Terminal
rails runner lib/archive_posts.rb
```

No need to create a `rake` task, or load the script from the `rails console`. How easy is that!

## Run commands in different environments with `rails runner -e`

Before you run a script in production, you _probably_ want to test it locally first.

We can do that with `rails runner -e`. **The `-e` flag lets us specify an environment to run our command or script.**

Rails in production mode is configured differently to development mode (different gem sets, compiled static assets, etc.), so this is a good way to catch any bugs _before_ your script fails in production.

As an example, to locally test our `archive_posts.rb` script (above), we might run —

```sh:Terminal
# Run our script on our LOCAL MACHINE, but with PRODUCTION settings
rails runner -e production lib/archive_posts.rb
```

## Conclusion

I hope you found that useful! I learned about `rails runner` yesterday and couldn't believe I hadn't heard of it sooner.

It's super useful — it's nice to skip the `rails console` and this is the main way I use it. Running scripts with `rails runner script` is a handy bonus too!
