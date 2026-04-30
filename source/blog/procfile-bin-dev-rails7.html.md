---
title: Procfile.dev, bin/dev, and Rails 7 — how they work, why they're great.
date: 2023-07-01
lastmod: 2025-09-30
tags: ["development", "procfile", "popular"]
draft: false
description: Rails 7 introduced a lot of new things, but honestly, the `bin/dev` script is the thing I notice the most. I want to try to give your some insight into how `bin/dev` and `Procfile.dev` work together...
images: ["images/blog/procfile-bin-dev-rails7/cover.png"]
---

> Note: This article has been updated for Rails 8 and remains relevant as of September 2025! `bin/dev` has become a standard and, dare I say, beloved pattern that shows no sign of going away.
>
> If you've never heard of `bin/dev` and `Procfile.dev`, this is the article for you! I hope you're sitting down, because I'm about to rock your (Ruby on Rails development) world.
>
> Even if you are familiar with `bin/dev` and use it regularly, I hope I'll be able to teach you something new.
>
> And if `foreman` and `bin/dev` are too basic for you, check out [Overmind 🪬, a better bin/dev for your Procfile.](/blog/overmind-better-bin-dev-for-your-procfile-dev)

Running `bin/dev` for the first time can feel like magic. Booting all your processes from a single command, in a single terminal window, is super handy. Plus, the integration with `Procfile.dev` makes it easy to add new processes as needed.

Rails 7 introduced a lot of great new things, but honestly, the `bin/dev` script is what I notice the most when I'm developing a new Rails 7 app.

You might be familiar with `bin/dev` and `Procfile.dev` (and it's OK if you have no idea what these are!). If you've ever created a Ruby on Rails 7 app with the `--css=` flag or the `--js=` flag, you would have already seen them. A Rails `Procfile.dev` might look like this —

```sh:Procfile.dev
web: bin/rails server -p 3000
css: bin/rails tailwindcss:watch
```

This `Procfile.dev` file (along with the `foreman` gem under the hood) will run the `rails server` and `tailwindcss:watch` commands at the same time — and all we have to do is run `bin/dev`. The `bin/dev` script isn't complicated (it's only 8 lines!), but it makes running multiple processes a _lot_ easier, and in my opinion is pretty great.

This article isn't very long, but I wanted to give you some insight into how `bin/dev` and our `Procfile.dev` work together, and unravel some of the "magic".

I also want to show how we can adjust our `Procfile.dev` file to add new processes, and later on I'll show you some neat `foreman` commands.

## `bin/dev`, `foreman`, and `Procfile.dev` — how do they work together?

Running `bin/dev` for the first time can feel like magic — but what's actually happening?

We can open up the Rails `bin/dev` script and look inside. You might be surprised to learn that `bin/dev` is just an 8-line shell script (longer with my annotations) —

```sh:bin/dev showLineNumbers
#!/usr/bin/env sh

# install foreman if needed — https://github.com/ddollar/foreman
if ! gem list foreman -i --silent; then
  echo "Installing foreman..."
  gem install foreman
fi

# run foreman and point it to our Procfile.dev, and pass through any arguments we've added
# learn more from the foreman docs — https://ddollar.github.io/foreman/
exec foreman start -f Procfile.dev "$@"
```

All `bin/dev` is doing is installing the `foreman` gem if we don't already have it, then using `foreman` to start the `Procfile.dev` in our Rails app.

From the [foreman GitHub repository](https://github.com/ddollar/foreman) —

> Foreman is a manager for Procfile-based applications. It aims to abstract away the details of the Procfile format, and allow you to either run your application directly or export it to some other process management format.

Essentially, `foreman` will automatically run the different processes defined in our `Procfile.dev` file for us.

Naturally, then, we might want to look into our `Procfile.dev`.

If you create a Ruby on Rails app with the `--css=tailwind` flag, you would have a `Procfile.dev` like this —

```sh:Procfile.dev
web: bin/rails server -p 3000
css: bin/rails tailwindcss:watch
```

If instead, you created your Ruby on Rails app with the `--js=webpack` flag, you would have a `Procfile.dev` like this —

```sh:Procfile.dev
web: unset PORT && env RUBY_DEBUG_OPEN=true bin/rails server
js: yarn build --watch
```

Our `Procfile.dev` is used to specify different `processes:`. A `process:` can be any sort of script or command you want to run. We can add more processes if we want, or remove some if we need.

I want to show you how we can adjust our `Procfile.dev` to add more running processes to our Rails development environment— we're going to add Redis and a Sidekiq worker to our `Procfile.dev`.

## Running Redis and a Sidekiq worker locally

One handy addition I make to most of my `Procfile.dev` files is to add a `redis:` and a `sidekiq:` process. This lets me run a Sidekiq worker locally when I'm developing my Ruby on Rails apps.

```sh:Procfile.dev
web: bin/rails server -p 3000
css: bin/rails tailwindcss:watch
redis: redis-server
sidekiq: bundle exec sidekiq -C config/sidekiq.yml
```

As you can see, we use a `redis:` process to start running `redis-server`, which will run Redis locally. Then, we spin up a `sidekiq:` process (also commonly called `worker:`) to run our job queue (Sidekiq uses Redis to manage its queue)

Running `bin/dev` will start up all 4 processes for us —

```sh:Terminal
./bin/dev

20:01:00 web.1     | started with pid 50367
20:01:00 css.1     | started with pid 50368
20:01:00 redis.1   | started with pid 50369
20:01:00 sidekiq.1 | started with pid 50370
```

`bin/dev` and our `Procfile.dev` (and `foreman` behind the scenes) make it much easier to run these extra processes (the alternative would be opening up two new terminal windows and running Redis and Sidekiq separately). Our `Procfile.dev` also makes it clear what development dependencies our Ruby on Rails app has, and does the work of running them for us.

If you wanted to use `docker-compose` to run Redis, rather than running `redis-server` directly, you can do that instead by creating a `docker-compose.yml` file like this —

```yaml:docker-compose.yml
version: "3"
services:
  redis:
    image: redis:7.0-alpine
    ports:
      - 6379:6379
```

And then adjust the `Procfile.dev` in your Ruby on Rails app to start Redis using your `docker-compose.yml` file —

```sh:Procfile.dev
redis: docker-compose up redis
...
```

## Some foreman and bin/dev tricks

### Disabling a specific process in your Procfile

You might have noticed our `bin/dev` script runs this command — `exec foreman start -f Procfile.dev "$@"`.

Note the `"$@"`. This lets `bin/dev` grab any arguments we give it, so it can pass them back to `foreman`. `foreman` supports disabling a process, and we can achieve the same thing with `bin/dev` like —

```sh:Terminal
./bin/dev sidekiq=0,all=1

20:08:18 web.1     | started with pid 50530
20:08:18 css.1     | started with pid 50531
20:08:18 redis.1   | started with pid 50532
# no sidekiq running
```

This syntax lets you easily disable services that you don't want to run.

See the `foreman` docs for more — https://ddollar.github.io/foreman/

### Per-process environment variables

This example comes straight from the [foreman wiki](https://github.com/ddollar/foreman/wiki/Per-Process-Environment-Variables), and shows how we can set environment variables for individual processes —

```sh:Procfile.dev
worker_1: env QUEUE=1 rake worker
worker_2: env QUEUE=2 rake worker
```

Here, we run workers on two different queues by exporting different environment variables for them.

### Check your Procfile.dev for errors

We can run `foreman check` in our Ruby on Rails project to check that our `Procfile.dev` is valid. By default, `foreman` looks for a `Procfile`, not a `Procfile.dev`, so we can use the `-f` flag to specify our `Procfile.dev` —

```sh:Terminal
foreman check -f Procfile.dev
valid procfile detected (web, css, redis, sidekiq)
```

## Conclusion

I hope you found this article useful!

If you couldn't already tell, I'm a massive fan of `bin/dev` and `Procfile.dev` — they make it seamless to spin up the development environment for a new Ruby on Rails 7 app.

Personally, I find the Rails `Procfile` most handy when my apps get more complex, and I want to start running `redis:` and `sidekiq:` alongside my main Rails app.
