---
title: Adding Redis and Sidekiq to your Ruby on Rails app
date: "2023-07-05"
tags: ["redis", "sidekiq", "development", "procfile", "popular"]
draft: false
description: Here are the basics of installing Redis and Sidekiq, and then adding Redis and Sidekiq to your Ruby on Rails app. This is everything you need to get set up — no fluff, just a couple of commands. Let's go!
images:
  ["/static/images/adding-redis-and-sidekiq-to-a-ruby-on-rails-app/cover.png"]
---

> In this article, I cover the basics of installing Redis and Sidekiq, and then adding Redis and Sidekiq to your Ruby on Rails app. No fluff, just a couple of commands. Let's go!

So you want to add Redis and Sidekiq to your Ruby on Rails app. In this article, I'm going to show you exactly how to do that.

It's not hard — just a couple of simple commands. And as a bonus, I'll show you how to easily run Redis and Sidekiq using the `Procfile.dev` file.

## Installing Redis

The first step is to install Redis on your local machine. You need to have Redis running locally so that your Ruby on Rails app can connect to it.

I've got two methods for installing Redis — the first method is to install the Redis package locally. The second method is to use `docker-compose` to spin up a Redis instance inside a Docker container.

If you're not familiar with `docker-compose`, I recommend just installing Redis locally.

### Installing Redis locally

Redis has an [official installation guide](https://redis.io/docs/getting-started/installation/) for different operating systems, which you should follow to install the Redis server locally.

I use a Macbook for my local development, so I was able to install Redis easily using `brew` —

```sh:Terminal
brew install redis
```

Once Redis is installed, you can run it with the `redis-server` command —

````sh:Terminal
❯ redis-server

65139:C 06 Jul 2023 12:34:11.073 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
65139:C 06 Jul 2023 12:34:11.073 # Redis version=7.0.11, bits=64, commit=00000000, modified=0, pid=65139, just started
65139:C 06 Jul 2023 12:34:11.073 # Warning: no config file specified, using the default config. In order to specify a config file use redis-server /path/to/redis.conf
65139:M 06 Jul 2023 12:34:11.074 * Increased maximum number of open files to 10032 (it was originally set to 8192).
65139:M 06 Jul 2023 12:34:11.074 * monotonic clock: POSIX clock_gettime
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 7.0.11 (00000000/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running in standalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
 |    `-._   `._    /     _.-'    |     PID: 65139
  `-._    `-._  `-./  _.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |           https://redis.io
  `-._    `-._`-.__.-'_.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |
  `-._    `-._`-.__.-'_.-'    _.-'
      `-._    `-.__.-'    _.-'
          `-._        _.-'
              `-.__.-'

65139:M 06 Jul 2023 12:34:11.075 # WARNING: The TCP backlog setting of 511 cannot be enforced because kern.ipc.somaxconn is set to the lower value of 128.
65139:M 06 Jul 2023 12:34:11.075 # Server initialized
65139:M 06 Jul 2023 12:34:11.076 * Ready to accept connections
````

Make sure to follow the specific instructions for your operating system to get Redis installed.

### Running Redis with docker-compose

If you wanted to use `docker-compose` to run Redis, rather than running `redis-server` directly, you can use a `docker-compose.yml` file like this —

```yaml:docker-compose.yml
version: "3"
services:
  redis:
    image: redis:7.0-alpine
    ports:
      - 6379:6379
```

This is a really simple `docker-compose.yml` file — I've just created a container with the `redis:7.0-alpine` image, and exposed port `6379`.

You can then run your Redis container with —

```sh:Terminal
docker-compose up redis
```

## Installing Sidekiq

Installing Sidekiq in your Rails app is even simpler than installing Redis. You just need to add the `sidekiq` gem, run `bundle install`, and then configure your Rails app to use Sidekiq for its job queue.

You can add the Sidekiq gem to your Rails app by running —

```sh:Terminal
bundle add sidekiq
```

This command will add the `sidekiq` gem to your `Gemfile`.

Then, you need to run `bundle install` to download and install the `sidekiq` gem —

```sh:Terminal
bundle install

...
Using sidekiq 7.1.2
...
Bundle complete! 20 Gemfile dependencies, 82 gems now installed.
Use `bundle info [gemname]` to see where a bundled gem is installed.
```

Now that we've downloaded the `sidekiq` gem, you need to configure you Rails app to use Sidekiq as the job queue (by default, Rails will use `ActiveJob`.)

To do this, add these lines to your `config/application.rb` file —

```sh:config/application.rb
module YourCoolRubyOnRailsApp
  class Application < Rails::Application

    ...
    config.active_job.queue_adapter = :sidekiq
    config.active_job.queue_name_prefix = "an_optional_queue_prefix"
  end
end
```

We first set the `queue_adapter` to `:sidekiq`, so now your Rails app will start using Sidekiq for its job queue.

Then we set an (optional) queue name prefix.

## Running Redis and Sidekiq locally for Ruby on Rails development

So now we've got Redis and Sidekiq installed — nice! Now you need a way to run them at the same time as your Rails app so that your can use them for your local development environment.

There are two options — the first is to run Redis and Sidekiq directly, in separate terminal windows on your dev machine. The second option is to use the `bin/dev` script and `Procfile.dev` file that most Rails 7 apps ship with, to simplify things.

> Note: I've written a more in-depth guide on the `bin/dev` script and `Procfile.dev` file here — [Procfile.dev, bin/dev, and Rails 7 — how they work, and why (I think) they're great.](/blog/procfile-bin-dev-rails7)

### Running Redis and Sidekiq locally

You can just run Redis and Sidekiq locally.

To run Redis locally, open up a new terminal and run either —

```sh:Terminal
redis-server
```

or, if you used a `docker-compose.yml` file, run —

```sh:Terminal
docker-compose up redis
```

Then, in another terminal, you can start Sidekiq with —

```sh:Terminal
bundle exec sidekiq
```

These two commands will get Redis and Sidekiq running, and now your Ruby on Rails app should be able to connect to them.

The only downside to this method of running Redis and Sidekiq is that you'll need to keep these two terminal windows open in the background while developing your app. We solve this in the next section with the `Procfile.dev` script.

### Running Redis and Sidekiq using the Procfile.dev file

If you're using the `bin/dev` script and `Procfile.dev` file as part of your Rails development workflow, it's really easy to add Redis and Sidekiq to it.

Using this method will let you run all your development resources with a single `bin/dev` command.

Just add the following to your `Procfile.dev` file —

```sh:Procfile.dev
redis: redis-server
sidekiq: bundle exec sidekiq
```

For example, your entire `Procfile.dev` file might look like —

```sh:Procfile.dev
web: bin/rails server -p 3000
css: bin/rails tailwindcss:watch
redis: redis-server
sidekiq: bundle exec sidekiq
```

By adding the `redis:` and `sidekiq:` processes to your `Procfile.dev`, your can easily run all 4 services simply by running `bin/dev`.

> Note: I've written a more in-depth guide on the `bin/dev` script and `Procfile.dev` file here — [Procfile.dev, bin/dev, and Rails 7 — how they work, and why (I think) they're great.](/blog/procfile-bin-dev-rails7)

## Conclusion

Thanks for reading!

This was just a short article — still, I hope you found it useful!
