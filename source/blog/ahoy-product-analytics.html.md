---
title: Internal product analytics with Ahoy
date: "2025-05-30"
tags: ["ahoy", "analytics", "gem"]
draft: false
description: Learn how to use the Ahoy gem to track feature usage within your Ruby on Rails apps.
images: ["images/blog/ahoy-product-analytics/cover.png"]
---

> Learn how to use the [Ahoy gem](https://github.com/ankane/ahoy) to track utilization of features inside your app. With just a few lines of code, you can track which features your users are interacting with (plus: filter out prefetch requests for cleaner data).

Once you launch a new app or SaaS, one of the first questions you'll ask yourself is: **"is _anyone_ actually using my app?"**

Shortly followed by: **"OK, we have some users.... but which features in my app are they using?"**

This article helps you answer the second question. By wiring the [Ahoy gem](https://github.com/ankane/ahoy) into your Rails controllers, it's easy to track which actions your users take.

(By the way, [the Blazer gem](/blog/blazer-gem-rails) is perfect for answering the first question).

## Why use Ahoy

Ahoy is a simple, first-party analytics engine for Rails (and it's great!). You install the gem, initialize it, and use it to track visitors to your website.

**However, Ahoy also includes [events](https://github.com/ankane/ahoy?tab=readme-ov-file#events), which is what we're interested in.** Events map neatly onto specific actions a logged-in user takes within your app (for instance, Events [integrate with Devise automatically](https://github.com/ankane/ahoy?tab=readme-ov-file#users) to link to a specific `user_id`).

We'll use Ahoy to automatically [record Events in our controller actions](#tracking-controller-actions-with-ahoy), then use something like [Blazer](/blog/blazer-gem-rails) to query those events and answer questions like:

- What are the most common actions my users take?
- How many users are interacting with feature X?

## Adding Ahoy to your Rails app

Ahoy is pretty easy to install (or follow the [installation instructions](https://github.com/ankane/ahoy?tab=readme-ov-file#installation) directly):

```ruby
# 1. Add to Gemfile
gem "ahoy_matey"

# 2. Then run:
bundle install
rails generate ahoy:install
rails db:migrate

# 3. Restart Rails and voila!
```

There are a few options in `config/initializers/ahoy.rb`, but you shouldn't need to worry about them.

If you reload your app, Ahoy will create an `Ahoy::Visit` to track your pageview. Since we're only concerned about `Ahoy::Event` records, you can disable visit tracking by adding this line to your `ApplicationController`:

```ruby:application_controller.rb
class ApplicationController < ActionController::Base
 skip_before_action :track_ahoy_visit
  ...
end
```

(disabling visits is optional)

## Tracking controller actions with Ahoy events

With Ahoy wired up correctly, it's easy to track which controller actions your users hit.

You can track events across all your controllers by adding this `after_action` to your `ApplicationController` (inspired by the [official example](https://github.com/ankane/ahoy?tab=readme-ov-file#events)):

```ruby:application_controller.rb
class ApplicationController < ActionController::Base
  # auto-track events
  after_action :track_controller_action

  private

  def track_controller_action
    # ignore prefetched instant-click requests
    return if request.headers["X-SEC-PURPOSE"] == "prefetch"

    name = "controller_action"
    ahoy.track name, request.path_parameters
  end
end
```

This **records** an `Ahoy::Event` after each controller action with `ahoy.track`, and **filters out prefetch requests** automatically.

Without this filtering, Ahoy would record an event any time a user hovered over a link, polluting your data.

> With Turbo (Hotwire), Rails pre-fetches links when you hover over them, so that if you _do_ click the link, the page is already mostly loaded and transitions ~instantly.
>
> Read more about instantclick requests and `X-SEC-PURPOSE` here: [Any method of knowing if a link has been “instant-clicked” (Reddit)](https://www.reddit.com/r/rails/comments/1b02xtu/any_method_of_knowing_if_a_link_has_been/)
>
> View the source code here: [turbo/link_prefetch_observer.js](https://github.com/hotwired/turbo/blob/main/src/observers/link_prefetch_observer.js#L111)

By default, we record a generic `controller_action` event, which looks like this:

```ruby
> Ahoy::Event.last
=>
#<Ahoy::Event:0x000000014daf1b28
 id: 29,
 visit_id: 10,
 user_id: 1,
 name: "controller_action",
 properties: {"action" => "create", "controller" => "meetings/exports", "meeting_id" => "63"},
 time: "2025-05-26 02:22:06.518373000 +0000">
```

Within the event's `properties`, Ahoy records the controller & action that tracked the event. If the route includes a record id (`meeting_id` in this case), that will be included too.

If you're using Devise, Ahoy automatically populates the `user_id` too. Likewise for `visit_id` and visits.

If you don't want to track events in _all_ your controllers (it can be a lot of data!), you can scope Ahoy's event-tracking to specific controllers.

Just move the `after_action :track_controller_action` out of `ApplicationController` and into the specific controllers you're interested in (the `track_controller_action` method can remain though).

Now that you're recording events, let's look at how to query them.

## Querying your Ahoy events

While you can [query your Ahoy::Events in ActiveRecord](https://github.com/ankane/ahoy?tab=readme-ov-file#explore-the-data), I prefer to use SQL (paired with [Blazer dashboards](https://github.com/ankane/blazer?tab=readme-ov-file#blazer)).

Below are a few handy queries to get you started.

### Events grouped by controller name

Here's a great overview query to count all `Ahoy::Events`, grouped by controller:

```sql
SELECT
  properties ->> 'controller' AS controller,
  COUNT(*) AS events
FROM ahoy_events
GROUP BY controller
ORDER BY events DESC;
```

Blazer will automatically render your results as a chart like this:

![Ahoy::Events grouped by controller, rendered automatically by Blazer into a bar chart](images/blog/ahoy-product-analytics/blazer.png)

You'll get results like this:

| controller      | events |
| --------------- | ------ |
| meeting/exports | 40     |
| meeting/shares  | 10     |

### Events grouped by controller name & action

You can dig a level deeper with a `(name, action)` grouping across your events. This differentiates between `index / show` events, `show / create` events etc.

```sql
SELECT
  properties ->> 'controller' AS controller,
  properties ->> 'action' AS action,
  COUNT(*) AS events
FROM ahoy_events
GROUP BY controller, action
ORDER BY events DESC;
```

You'll get results like this:

| controller      | action | events |
| --------------- | ------ | ------ |
| meeting/exports | create | 40     |
| meeting/shares  | create | 10     |

### Unique users for each controller action

To narrow down the number of unique users who've hit each controller path (ie: interacted with each feature), use a query like this:

```sql
SELECT
  properties ->> 'controller' AS controller,
  properties ->> 'action' AS action,
  COUNT(DISTINCT user_id) AS unique_users
FROM ahoy_events
GROUP BY controller, action
ORDER BY unique_users DESC;
```

You'll get results like this:

| controller      | action | unique_users |
| --------------- | ------ | ------------ |
| meeting/exports | create | 21           |
| meeting/shares  | create | 6            |

## Conclusion

I've been using this pattern very successfully within [AttendList](https://attendlist.com) to track feature usage.

Ahoy is a great, lightweight option for tracking product analytics in your app. Unlike more heavyweight solutions, it's trivial to add Ahoy & Blazer to your Rails app and play around, and remove them again if they're not what you're after.

Certainly, there are limitations here. The biggest one is that: if a feature doesn't map 1:1 with a controller action, it's harder/impossible to track. For instance, if you have two tabs on a page but all their data is loaded within the same controller action, you won't be able to use `Ahoy::Events` to differentiate between which tab was viewed.

If you're interested in learning more, I found a [GoRails tutorial](https://gorails.com/episodes/internal-metrics-with-ahoy-and-blazer) from 2017 in a similar vein to this article (I haven't watched it though).
