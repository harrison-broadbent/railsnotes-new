---
title: Run RSpec specs in parallel (with the parallel_rspec gem)
date: "2025-10-01"
tags: ["rspec", "tests"]
draft: false
summary: Run RSpec in parallel and speedup your specs by 2x-4x locally using the handy parallel_rspec gem.
images: ["/static/images/parallel_rspec/cover.png"]
---

> Learn how to run your RSpec tests in parallel — and bank a `2x-4x` speedup in the process — using the [parallel_rspec](https://github.com/willbryant/parallel_rspec) gem
>
> [parallel_rspec](https://github.com/willbryant/parallel_rspec) is a great gem that makes it easy to run your specs in parallel — it handles cloning your database and running tests across `N` parallel workers. Further down I also [benchmark the optimal number of workers](#fine-tuning-the-number-of-workers) and... turns out the defaults are pretty perfect 😅

---

## Overview

**RSpec runs specs serially in a single CPU process.** That is, one-by-one, using a single lonesome CPU core from your beefy dev machine. This is in contrast to [Minitest + Rails, which natively supports parallel testing](https://guides.rubyonrails.org/testing.html#parallel-testing-with-processes).

Given modern development machines typically have 8, 16, even 32+ powerful CPU cores, and plenty of RAM to boot, it would be great if we could **actually make use of that hardware** to run our specs in parallel (and hence much faster!).

We'd expect a sizeable speedup, and that's exactly what we see, if we run our RSpec specs with a gem like [parallel_rspec](https://github.com/willbryant/parallel_rspec). This gem makes it easy to run specs across `N` parallel workers (default `N=4`), leading to a `2x-4x` speedup (approx).

> I've tried a few different parallel RSpec gems and by far prefer `parallel_rspec`. Another popular option is [parallel_tests](https://github.com/grosser/parallel_tests), but I've always found it fiddly and annoying to deal with. In contrast, `parallel_rspec` has been rock-solid.

## Speed comparison

Here's a speed comparison between vanilla `rspec` and `parallel_rspec` (using the default `N=4` workers) running the [AttendList](https://attendlist.com) test suite on my base M2 MacBook Air.

It contains `279 examples` across a variety of spec types:

### Vanilla RSpec

```sh:Terminal
❯ rspec
........................................................................
.................................................

Finished in 32.39 seconds 🐌
```

### Parallel RSpec

```sh:Terminal
❯ bin/parallel:rspec
........................................................................
.................................................

Finished in 10 seconds 🤯
```

Running specs in parallel leads to a `~3.2x` speedup, saving `22.39` seconds.

## Getting started with `parallel_rspec`

Setting up the `parallel_rspec` gem is very straightforward (that's a big part of why I like this gem!)

Just add it to your Gemfile:

```rb:Gemfile
group :development, :test do
 gem 'parallel_rspec'
end
```

then install it with `bundle`.

The `parallel_rspec` gem runs each thread against its own database instance ([to avoid deadlocks](https://github.com/willbryant/parallel_rspec#:~:text=avoid%20locking%20and%20deadlocking%20problems.)), so prepare the test databases & run your specs with:

```sh:Terminal
# 1. prepare test databases
bundle exec rake db:parallel:create db:parallel:prepare

# 2. run specs in parallel
bundle exec prspec spec/
```

That's it! Your specs should run substantially faster than just running `rspec`.

Keep reading to explore my [benchmarks](#fine-tuning-the-number-of-workers) and [handy bin/parallel: scripts](#handy-binparallel-scripts).

> By default, `prspec` will use 4 workers to run your tests.
>
> You can tweak this by adjusting the `$WORKERS` environment variable. However, I've found that [4 workers is pretty perfect](#fine-tuning-the-number-of-workers), so be careful when tweaking this. If you do adjust `WORKERS`, ensure you re-run the `:create` and `:prepare` commands.

> Each `prspec` thread runs against a separate instance of your database (created when running `db:parallel:create` and migrated with `db:parallel:prepare`). It automatically handles creating and naming your additional database instances.

## Fine-tuning the number of workers

I've benchmarked `prspec` using `1-8` workers. The (rough and only vaguely scientific!) data I've collected is below:

> tldr; the default `WORKERS` value of `4` seems optimal, at least for my machine.

| N workers              | time            |
| ---------------------- | --------------- |
| 1 (rspec, no parallel) | 21.7 seconds    |
| 2                      | 12.4 seconds    |
| 3                      | 9.4 seconds     |
| **4\***                | **7.5 seconds** |
| 5                      | 8.9 seconds     |
| 6                      | 12.2 seconds    |
| 7                      | 16.6 seconds    |
| 8                      | 17.1 seconds    |

Here's that data plotted:

![In my testing, the default WORKERS value of 4 was optimal and led to specs running the quickest.](/static/images/parallel_rspec/optimal_threads.png)

I've run similar benchmarks on more powerful machines and got comparable results. With a beefy enough computer, though (and/or fewer other programs running), you may find `N=5` or even `N=6` to be optimal.

**However, for most people, `N=4` will deliver speedup enough without the need to re-run these benchmarks.**

> Note: Keen observers will note that `rspec` ran significantly faster here than (`21.7 seconds`) compared to the previous section (`32.39 seconds`). I ran these benchmarks against an earlier test suite of AttendList with fewer specs. The speedup in this section is similar, though — around `2.9x`

## Handy `bin/parallel:` scripts

I've put together a couple of scripts to encapsulate the 2 key things you'll do with `parallel_rspec`:

- setup the test databases — [bin/parallel:prepare](#binparallelprepare),
- run specs (in parallel!) — [bin/parallel:rspec](#binparallelrspec)

These scripts are modelled after the same `bin/` pattern as [bin/dev](/blog/procfile-bin-dev-rails7)

### `bin/parallel:prepare`

A short wrapper script to create & prepare test databases for each parallel thread:

```sh:bin/parallel:prepare
#!/usr/bin/env sh

# Prepare copies of DB for parallel_rspec
# https://github.com/willbryant/parallel_rspec
#
bundle exec rake db:parallel:create db:parallel:prepare
```

### `bin/parallel:rspec`

Wraps the actual spec running aspect of `parallel_rspec`. You call it like so:

```sh:Terminal
bin/parallel:rspec                # all specs
bin/parallel:rspec spec/models    # subset of specs
```

```sh:bin/parallel:rspec
#!/usr/bin/env sh

# Runs specs in parallel with parallel_rspec.
# By default runs in 4 groups (determined by WORKERS env)
# If no args are provided, run the whole suite; otherwise, run the given path(s).
#
# https://github.com/willbryant/parallel_rspec
#
set -e

if [ "$#" -eq 0 ]; then
 exec bundle exec prspec spec/       # run all specs if no path provided
else
 echo "Running parallel specs in $*..."  # prints "running parallel specs in spec/path/to/specs"
 exec bundle exec prspec "$@"
fi
```

## Conclusion

I've been using the [parallel_rspec](https://github.com/willbryant/parallel_rspec) gem a ton lately in my side projects, and it's worked so well that I've recently introduced it at my workplace too.

The speed gains from running specs in parallel are no-joke — `~3x` in this article — and `parallel_rspec` so far has been rock-solid, without any of the troubles I had dealing with [parallel_tests](https://github.com/grosser/parallel_tests).
