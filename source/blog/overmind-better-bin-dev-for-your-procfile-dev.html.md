---
title: Overmind 🪬, a better bin/dev for your Procfile
date: "2023-07-26"
tags: ["procfile", "development", "popular"]
draft: false
description: Overmind is a Procfile manager on steroids — like Foreman and bin/dev, but... a lot better. It's deeply configurable, and integrates with tmux so you can stop, restart and attach to running processes.
images: ["images/blog/overmind-better-bin-dev-for-your-procfile-dev/cover.png"]
---

> Overmind 🪬 is like `foreman` and `bin/dev` on steroids — it does everything that they do and more, it's deeply customizable, and it integrates with `tmux` so you can attach to a running process for live debugging.
>
> I wish I had learned about Overmind sooner! `foreman` and `bin/dev` were fine, but now that I've discovered Overmind, I don't see myself ever going back.

[Overmind 🪬](https://github.com/DarthSim/overmind) is what you'd get if `foreman` and `bin/dev` had a baby... and then put the baby on steroids... and made it lift weights 💪👶. OK not quite, but you get the idea.

**Overmind is a `Procfile` manager — the most advanced one there is** (probably).

If we give Overmind a `Procfile` like this —

```sh:Procfile
web: bin/rails server -p 3000
redis: redis-server
worker: bundle exec sidekiq
```

We can use Overmind to run all these processes simultaneously, by running `overmind start`.

That's pretty standard stuff though (and no different from `foreman` and `bin/dev`).

**But Overmind takes `Procfiles` to the next level** — it's deeply integrated with `tmux`, it can restart, attach to, and kill running processes, and it has a [multitude of configuration options.](https://github.com/DarthSim/overmind) This makes it [great for debugging](/blog/overmind-better-bin-dev-for-your-procfile-dev#connect-to-a-running-process-with-overmind-connect), and let's you do some [cool things](/blog/overmind-better-bin-dev-for-your-procfile-dev#cool-things-we-can-do-with-overmind-that-we-cant-do-with-bindev) that `bin/dev` can't.

**If you're not satisfied with `bin/dev`** — maybe you don't like how hard it is to attach a `debugger`, or you want to restart processes on the fly — **then Overmind is what you've been looking for.**

> If you've never heard of `foreman` and `bin/dev`, read this — [foreman, bin/dev and Procfile.dev.](/blog/procfile-bin-dev-rails7)
>
> And if you've never heard of `tmux`... well... you're probably in the wrong place 😅. But if you're keen to learn, [start learning tmux here.](https://www.hamvocke.com/blog/a-quick-and-easy-guide-to-tmux/)

In this article, I'll walk you through installing and using Overmind — I'm going to show you what makes Overmind great. Plus, I've got some cool things that we can do with Overmind (but we can't do with `bin/dev`) that I think you'll like.

> If you're familiar with [Overmind](https://github.com/DarthSim/overmind), you've probably also heard of its little sister, [Hivemind](https://github.com/DarthSim/hivemind).
>
> In most cases, I think it's fine to completely ignore Hivemind. If you think that Overmind is too advanced for you, that's OK! I recommend just sticking with `foreman` and `bin/dev`.

Before we start, we need to install Overmind.

## Installing Overmind

Overmind is compatible with Mac and Linux (sorry Windows folks, you're out of luck).

> You can also read the [official installation docs.](https://github.com/DarthSim/overmind#installation)

Installing Overmind on Mac is easy, thanks to `brew`.

Overmind uses `tmux` to connect to our processes, so install `tmux` first —

```sh:Terminal
brew install tmux
```

From there, install Overmind by running —

```sh:Terminal
brew install overmind
```

If you're running Linux, the setup is a little bit more involved — I recommend this great [StackExchange thread](https://unix.stackexchange.com/questions/599510/how-to-install-overmind-in-ubuntu) which covers how to install Overmind on Ubuntu.

## Overmind Basics — what makes Overmind a better bin/dev?

Now that we've got Overmind installed, let's dive into what makes it so powerful.

You can use `overmind` in your Ruby on Rails apps to run a `Procfile.dev` by typing —

```sh:Terminal
overmind start -f Procfile.dev
# shorthand: overmind start -> overmind s
```

The `-f Procfile.dev` flag is important since by default Overmind will look for a `Procfile`, not a `Procfile.dev`. The `-f` flag lets us adjust that.

Observe as `overmind` brings your processes to life —

```sh:Terminal
overmind start -f Procfile.dev

system | Tmux socket name: overmind-overmind-test-kGX8OotSbMDa8MH1ZG8nF
system | Tmux session ID: overmind-test
system | Listening at ./.overmind.sock
css    | Started with pid 85484...
web    | Started with pid 85483...
web    | => Booting Puma
...
web    | * Listening on http://127.0.0.1:3000
web    | * Listening on http://[::1]:3000
web    | Use Ctrl-C to stop
css    |
css    | Rebuilding...
css    | Done in 173ms.
```

**So we've got the processes in our `Procfile.dev` running — so what?** Everything we've done so far is stuff that `foreman` and `bin/dev` can also do.

**Not anymore. This is where we depart from the world of `foreman`, and enter the Overmind 🪬.**

### Connect to a running process with `overmind connect`

To start, we can connect to a running process with `overmind connect [process]`, like this —

```sh:Terminal
overmind connect web
# shorthand: overmind connect -> overmind c
```

This connects us to the `tmux` session of our running process (which Overmind automatically started).

This can be **extremely useful**, especially for debugging!

Debugging with `foreman` and `bin/dev` is usually quite tricky, since you can't attach to the `web:` process.

Overmind changes that. Here's an example where we connect to a `web:` process, to debug a controller action —

![With Overmind, we can connect directly to the web: process and interact with the debugger.](images/blog/overmind-better-bin-dev-for-your-procfile-dev/overmind-connect.gif)

We call `debugger` inside our controller action, and then use Overmind to connect directly to our `web:` process and the `debugger` instance.

```sh:Terminal
overmind connect web

# inside tmux for web: process
Started GET "/posts" for ::1 at 2023-07-26 12:30:16 +1000
Processing by PostsController#index as HTML
...
[2, 11] in app/controllers/posts_controller.rb
     4|   # GET /posts or /posts.json
     5|   def index
     6|     @posts = Post.all
=>   7|     debugger
     8|   end
=>#0    PostsController#index at ~/Documents/projects/random-apps/overmind-test/app/controllers/posts_controller.rb:7
...
(rdbg) puts @posts # debug our @posts array
```

> Note: A helpful Redditor pointed out that if you're already using `tmux` for your terminal, running Overmind inside your `tmux` instance can make it impossible to `overmind connect` to your processes (since they're nested in your `tmux`). I haven't looked into this myself, but I wanted to give any `tmux` aficionados a heads-up.

### Stopping and Restarting Processes with `overmind stop` and `overmind restart`

Overmind makes it easy to stop running processes, as well as restart them.

When I was writing this article, I was faced with the question — **Why would you want to do this?**

Some ideas I had:

- Perhaps you want to test how your running Rails app handles disconnections from its background worker, or from Redis.
- Or maybe you want to restart a Sidekiq worker whose memory usage has ballooned.
- And maybe... you just have an... er... interesting way of getting your kicks.

Regardless of your reasons, you can stop a running `Procfile` process with `overmind stop` —

```sh:Terminal
overmind stop redis

...
redis  | Interrupting...
redis  | 94740:signal-handler (1690354454) Received SIGINT scheduling shutdown...
redis  | 94740:M 26 Jul 2023 16:54:14.813 # User requested shutdown...
```

Similarly, you can restart a running process (or start a stopped process) with `overmind restart` —

```sh:Terminal
overmind restart redis
# shorthand: overmind restart -> overmind r

redis  | Exited
redis  | Restarting...
redis  | 97145:C 26 Jul 2023 16:56:20.994 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
...
redis  | Restarted with pid 97144...
```

### More detailed terminal output, thanks to `tmux` control mode

If you run a [Redis or Sidekiq](/blog/adding-redis-and-sidekiq-to-a-ruby-on-rails-app) process using `overmind`, you should notice extra output in your terminal, compared to launching them with `bin/dev`.

Say that we have **a `Procfile.dev` with a `redis:` and a `sidekiq:` process.**

Running `bin/dev` and `foreman` will give you this (less output 👎) —

![The bin/dev script and foreman dont run our processes interactively, so you won't see their full output.](images/blog/overmind-better-bin-dev-for-your-procfile-dev/foreman-terminal.png)

Whereas running `overmind start` will give you this (more output 🥳) —

![Overmind captures the full process output, so we get to see some pretty ASCII pictures — yay!](images/blog/overmind-better-bin-dev-for-your-procfile-dev/overmind-terminal.png)

Much cooler 😎.

Both `foreman` and `overmind` run both processes the same way, but Overmind displays more output than Foreman.

This is because `overmind` uses the [`tmux` control mode](https://github.com/tmux/tmux/wiki/Control-Mode) to capture the output of our processes. This lets it grab more information than `bin/dev` and `foreman`.

`foreman` and `bin/dev` don't run our processes in an interactive terminal (unline Overmind), so the graphics aren't displayed.

In actual usage, these graphics make absolutely no difference. I think it's cool though — a bit like a hidden gem of using `overmind` over `foreman` and `bin/dev`.

## Moving configuration into a .overmind.env file

Overmind supports lots of command line arguments — you used one when you passed `-f Procfile.dev`, **but there are a lot more, and most come in handy!**

**It would be great though if you didn't have to pass these flags each time** you wanted to run `overmind start`, otherwise you'll quickly end up with a mess like this —

```sh
overmind start -f Procfile.dev -c migration -r web,worker -T -m web=2,worker=2
```

Fortunately, we can store these options in one of Overmind's configuration files, rather than passing them via the command line.

Overmind makes it easy to do this. From the Overmind docs —

> The [configuration] files will be loaded in the following order:
>
> ~/.overmind.env
>
> ./.overmind.env
>
> ./.env
>
> $OVERMIND_ENV

In most cases, I think it makes sense to create a `.overmind.env` file in the root directory of your Rails app (or add them to `.env` if you're using [ENV variables instead of Rails credentials](/blog/custom-credentials-in-your-rails-app)).

Create a `.overmind.env` file inside the root of your Rails app, so you can permanently set the `-f Procfile.dev` argument —

```sh:Terminal
# run inside your Ruby on Rails app
touch .overmind.env
echo OVERMIND_PROCFILE=Procfile.dev >> .overmind.env
```

Now, your project will have a `.overmind.env` file like this —

```sh:.overmind.env
OVERMIND_PROCFILE=Procfile.dev
```

From the [Overmind documentation](https://github.com/DarthSim/overmind#specifying-a-procfile), we can see that `OVERMIND_PROCFILE` is the matching environment variable for the `-f` flag.

Some other handy `.overmind.env` variables that you might find useful, from the [Overmind docs](https://github.com/DarthSim/overmind#usage) —

- `OVERMIND_SHOW_TIMESTAMPS=1` will **display inline timestamps** next to the process logs (`foreman` and `bin/dev` do this by default, Overmind doesn't).
- `OVERMIND_PROCESSES=web,worker` **will only run** the `web:` and `worker:` processes and no others (adjust the process names as you need).
- `OVERMIND_IGNORED_PROCESSES=redis` **will not run** the `redis:` process (making it the inverse of the `OVERMIND_PROCESSES` variable).
- `OVERMIND_FORMATION=web=2,worker=5` will **run multiple instances** of the `web:` and `worker:` processes.
- `OVERMIND_CAN_DIE=migrate` will allow a process called `migrate` to terminate, without shutting down the other running processes (we use this in the next section).

## Cool things we can do with Overmind (that we can't do with bin/dev)

Since Overmind is so much more powerful than `foreman` and `bin/dev`, there are some cool tricks and extra things we can do with it.

I plan to add to this section as I use Overmind more and discover uses for it.

### Automatically run your Database Migrations

There is one handy configuration option for Overmind that opens up heaps of new possibilities for processes — `OVERMIND_CAN_DIE`.

Usually, when Overmind or `foreman` detects that a process has died, they shut down all our other running processes.

But what if we want to run a one-off task like database migrations?

With Overmind, we can do exactly that.

First, add a new process to your `Procfile`. I've added the `migration` process below, which will run any pending database migrations whenever we start our app —

```sh:Procfile.dev
web: bin/rails server -p 3000
css: bin/rails tailwindcss:watch
migration: rails db:migrate
```

Then tell Overmind that the process is allowed to die —

```sh:.overmind.env
OVERMIND_CAN_DIE=migration
```

And you should see that when you run `overmind start`, the process runs, finishes and dies, without stopping the other running processes.

```sh:Terminal
overmind start

migration | Started with pid 86462...
web       | Started with pid 86460...
css       | Started with pid 86461...
...
migration | == 20230726011609 CreatePosts: migrating ======================================
migration | -- create_table(:posts)
migration |    -> 0.0007s
migration | == 20230726011609 CreatePosts: migrated (0.0007s) =============================
migration |
migration | Exited
css       |
css       | Rebuilding...
css       |
css       | Done in 175ms.
web       |
```

I think this pattern has a lot of potential! I used it here for database migrations, but you could use it for running `bundle` or `npm install`, running (idempotent) database seeds, etc etc.

## Conclusion

I hope you found this article useful! I enjoyed diving into Overmind — I love [`foreman` and the `bin/dev` script](/blog/procfile-bin-dev-rails7), and Overmind builds on from where `foreman` left off to deliver something even more impressive.

And credit to the brilliant [Sergey Alexandrovich](https://github.com/DarthSim) for creating both Overmind and it's little sister Hivemind.

> Resources:
>
> [Introducing Overmind and Hivemind | EvilMartians](https://evilmartians.com/chronicles/introducing-overmind-and-hivemind)
>
> [Overmind on Github](https://github.com/DarthSim/overmind)
