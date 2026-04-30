---
title: Exploring the Blazer gem
date: "2025-05-30"
tags: ["blazer", "analytics", "gem", "bi"]
draft: false
description: Learn how to use the Blazer gem in your Ruby on Rails app to query data in SQL, build dashboards, and run automated checks.
images: ["images/blog/blazer-gem-rails/cover.png"]
---

> Learn about the [Blazer gem](https://github.com/ankane/blazer), the easiest way to query data from your Ruby on Rails apps.
>
> It takes 2 minutes to install and lets you [query your data](#a-typical-blazer-query-result) in SQL, assemble [queries into dashboards](#building-dashboards-from-blazer-queries), run [regular checks](#checks) and much more.

---

**I've been using — and loving — the [Blazer gem](https://github.com/ankane/blazer) a _lot_ lately.**

(To the point where I now auto-add it to any new [side-project](https://attendlist.com)).

**Blazer is perfect for querying your production database, pulling some stats, and whipping up a dashboard** (without dancing the `ssh`-into-the-prod-server dance). It's basically a low-budget [Metabase](https://www.metabase.com/) built specifically for Ruby on Rails.

It supports an [astonishing number of data sources](https://github.com/ankane/blazer?tab=readme-ov-file#charts) — 23 by my count — including classics like `PostgreSQL`, `MySQL`, `SQLite`, and `BigQuery`. It runs your queries in transactions (so you don't accidentally mutate data), and supports [read-only users](https://github.com/ankane/blazer?tab=readme-ov-file#charts) for extra safety. Oh, and [Hacker News loves Blazer.](https://news.ycombinator.com/item?id=39524327)

I've explored Blazer more below, broken down into:

- Writing [Blazer queries](#a-typical-blazer-query-result),
- Creating [Blazer dashboard](#building-dashboards-from-blazer-queries)
- Building [Blazer checks](#checks)
- And finally, [getting started with Blazer](#getting-started)

## A typical Blazer query result

You'll probably spend about 90% of your time in Blazer crafting queries.

Here's Blazer's query page:

![The results page of a typical Blazer query: the auto-generated chart is a really cool touch.](images/blog/blazer-gem-rails/dashboard.png) _The results page of a typical Blazer query: the auto-generated chart is a really cool touch._

Your actual SQL query lives in the top-left, with the results below. Here, you can see Blazer's first trick: **charts**.

Blazer [automatically generates charts](https://github.com/ankane/blazer?tab=readme-ov-file#charts) based on the column types returned from your query.

**In the example above,** because we returned a `string` column followed by a `numeric (count)` column, Blazer rendered a handy bar chart.

**Charts are one of my favorite Blazer features:** they're easy to use (once you get the hang of them), and despite their, overall, low-budget feel, they're _very_ handy.

> Blazer has some official examples to try. Here's a [basic query you can edit](https://blazer.dokkuapp.com/queries/3-linked-column/edit) to test out it's interface.

Some more thoughts after writing plenty of Blazer queries:

- **Forking & cloning queries is really neat & easy** (blue `fork` button in the top-right group). I'll often use one query as the basis for another, tweak it until I'm happy, then fork it as it's own query. Blazer accommodates that workflow perfectly.
- **The auto-generated charts can be fiddly to setup**, since they depend on the order & typing of query results. I often flick back to the [charts section of Blazer's README](https://github.com/ankane/blazer?tab=readme-ov-file#charts) for help.
- **I'd really, really love an "auto format SQL" button** similar to the [one in Metabase](https://www.metabase.com/docs/latest/questions/native-editor/writing-sql#format-sql-queries). It's such a handy QOL feature and without it, I find my queries get messy, fast (yes, I could just write neater queries 😅).

### Wildcards in your queries

Blazer also supports `{wildcard values}` in your queries. Wildcards let you enter values on the fly rather than baking them into a query.

One of the [official examples](https://blazer.dokkuapp.com/queries/9-time-range-selector) uses wildcards for start & end times. Blazer is even smart enough to render a calendar datepicker for easy input.

```sql:wildcards_1.sql
SELECT * FROM ratings
WHERE rated_at >= {start_time}
AND rated_at <= {end_time}
```

Another classic example is filtering records for a specific `user_id`, like:

```sql:wildcards_2.sql
select * from your_table
where user_id = {user_id}
```

## Building dashboards from Blazer queries

Blazer lets you group multiple queries together into a dashboard ([official example here](https://blazer.dokkuapp.com/dashboards/1-dashboard-demo)). Handy, and self-explanatory.

Here's a screenshot from that [dashboard example](https://blazer.dokkuapp.com/dashboards/1-dashboard-demo):

![Blazer lets you easily group queries together into dashboards. They're handy, but not very high-density (visually). A 2-column layout would be game-changing.](images/blog/blazer-gem-rails/dashboard_multiple.png)

Dashboards work well — It's vastly easier to open 1 dashboard vs. N different queries.

I have a gripe though:

I find Blazer's dashboards quite visually sparse. Since each chart is stacked on top of each other, only ~1 result is visible at a time (the screenshot above is zoomed out).

It would be awesome to, one day, see a 2-column layout. You'd be able to fit more data into the same screen real estate. Of course, since [Blazer is open source](https://github.com/ankane/blazer) I could add that myself... we'll see 😅

## Checks

Blazer _also supports_ (wow it supports a lot of stuff, doesn't it?) [Checks](https://github.com/ankane/blazer?tab=readme-ov-file#checks).

![Checks run in the background on a timer, and notify you if they fail](images/blog/blazer-gem-rails/check.png)

Checks are [queries that run at set intervals](https://blazer.dokkuapp.com/checks), and automatically alert you if they fail.

Checks can fail based on these 3 conditions:

- Query returns **no results**,
- Query returns **any results**,
- Blazer detects [an anomaly](https://github.com/ankane/blazer?tab=readme-ov-file#anomaly-detection), backed by Blazer's anomaly detection integrations.

I won't comment here too much, since I haven't used Checks yet. But they seem handy, especially when coupled with the more sophisticated approaches to anomaly detection, like [Prophet](https://github.com/ankane/prophet-ruby) (another `ankane` gem!).

Blazer delivers checks via [email or Slack](https://github.com/ankane/blazer?tab=readme-ov-file#checks-optional). Again, very handy.

## Getting started

So you've read this far: **ready to give Blazer a try?**

> protip: Play around with Blazer locally in a `git` branch first to make sure you like it.

To get started with Blazer, follow these steps (from the [official instructions](<(https://github.com/ankane/blazer?tab=readme-ov-file#installation)>)):

```ruby:blazer_install.rb
# 1. install / add to Gemfile.rb
gem "blazer"

# 2. Generate the migrations
rails generate blazer:install
rails db:migrate

# 3. Mount Blazer to a path (in routes.rb)
mount Blazer::Engine, at: "blazer"
```

That installs everything and mounts Blazer to `/blazer`.

Next, add an environment variable to your production environment that points Blazer to your database:

```sh
ENV["BLAZER_DATABASE_URL"] = "postgres://user:password@hostname:5432/database"
```

[Authentication](<(https://github.com/ankane/blazer?tab=readme-ov-file#installation)>) is also a good idea, otherwise anyone could come along and query your database!

[Basic authentication](https://github.com/ankane/blazer?tab=readme-ov-file#installation) works fine, or you can hide Blazer behind [Devise authentication](https://github.com/ankane/blazer?tab=readme-ov-file#devise):

```ruby:blazer_auth.rb
# 1. Basic auth:
# add these ENV variables, or set them in an initializer.
#
ENV["BLAZER_USERNAME"] = "andrew"
ENV["BLAZER_PASSWORD"] = "secret"

# 2. Devise auth:
# You can also hide Blazer behind Devise.
#
authenticate :user, ->(user) { user.email == "you@example.com" } do
 mount Blazer::Engine, at: "blazer"
end
```

If you choose the basic auth option, you'll login to your Blazer dashboard like this:

![Securing Blazer behind basic auth](images/blog/blazer-gem-rails/auth.png)

It would be wise to also set up a [read-only user for Blazer](https://github.com/ankane/blazer?tab=readme-ov-file#permissions), although I tend to skip this step myself. I'd do this if multiple people were going to use Blazer though (it's easy to setup anyway: just a single command inside your database console).

Blazer also supports a [basic permissions model](https://github.com/ankane/blazer?tab=readme-ov-file#query-permissions) which, again, would be worth exploring if you've got multiple people sharing Blazer.

That should be enough to get you started with Blazer though. Once you've explored it a bit (either locally or the [online demo](https://blazer.dokkuapp.com/)), make sure you read the [full README](https://github.com/ankane/blazer), since it covers concepts I left out from this article.

## Conclusion

If you couldn't already tell, I think Blazer is **awesome**.

It's a great way to get up-and-running with basic queries & dashboards in production, and saves you messing around with `ssh` and production consoles.

(It also pairs well with other gems like [Ahoy](https://github.com/ankane/ahoy), which I've written about further: [Product analytics with the Ahoy gem (and Blazer)](/blog/ahoy-product-analytics))

**At this point, it's probably saved me hours of re-writing the same queries** and pulling the same data for basic things: new user signups, utilization of certain features etc.

Since Blazer's so well-integrated with Rails — and easy to install — it doesn't feel like overkill to mount it to a fresh Rails app with only a handful of users.
