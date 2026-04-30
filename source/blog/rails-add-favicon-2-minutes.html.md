---
title: Add a favicon to your Rails app in 2 minutes
date: "2023-08-25"
tags: ["tips"]
draft: false
description: This is a super short article on how to add a favicon to your Ruby on Rails app. We combine the favicon_link_tag helper with asset_path, which makes it quick and easy.
images: ["images/blog/rails-add-favicon-2-minutes/cover.png"]
---

> "Every great Rails app starts with an epic `favicon.ico`"
>
> — Sun Tzu

If you're launching a new Ruby on Rails app, you'll want to add a favicon.

**Fortunately, Rails has a couple of handy helpers that make adding a favicon really easy. By combining `favicon_link_tag` with `asset_path`, we can add one in (literally) 2 minutes.** You just add your favicon to the asset path of your Rails app, then include it in your layouts.

Clocks ticking! Let's go!

## Adding your favicon to the asset path

> Note: I'll assume you've already got a `favicon.ico` ready to go.

Before we link to our favicon, we need to add it to our Rails app!

**We want to put it in the `app/assets/images` directory.** This will add our favicon to the Rails asset path, which lets our app process it through the asset pipeline. This ensures things like cache control headers are correctly set for our favicon (without us having to do anything).

Just copy and paste your `favicon.ico` across.

When you finish, you should have a file structure like this —

![File structure after adding your favicon to your Ruby on Rails app.](images/blog/rails-add-favicon-2-minutes/directory.png)

## Link to your favicon with `favicon_link_tag`

Once your favicon is in your Rails app, you need to link to it in the `<head>` of your view layouts.

**Rails includes a handy helper, `favicon_link_tag`, which we can combine with `asset_path` to easily link our favicon.**

> You can read the documentation for `favicon_link_tag` here — [favicon_link_tag (apidock.com)](https://apidock.com/rails/ActionView/Helpers/AssetTagHelper/favicon_link_tag)

Add the helper to the `<head>` section of your layouts —

```erb:application.html.erb
<%= favicon_link_tag asset_path('favicon.ico') %>
```

You would use it like this inside your Rails layouts —

```erb:application.html.erb
<head>
  ...
  # link to favicon in /app/assets/images
  <%= favicon_link_tag asset_path('favicon.ico') %>
  ...
</head>
```

The `favicon_link_tag` will generate HTML that correctly links to our favicon and looks like this —

```html
<link
  rel="icon"
  type="image/x-icon"
  href="/assets/favicon-d1259857d627d09da3a75ad3b777c4700d1c87ead961dd0195fc8338e0025d20.ico"
/>
```

**Now, I bet you're wondering — why does the `favicon.ico` file has such a long name?**

Since we included our favicon in the `/app/assets/images` path, Rails has processed our favicon as part of the asset pipeline.

If we were to change our apps favicon, Rails would re-generate the favicon file to avoid situations where browser caches might serve stale assets (this works because the filename of our favicon would change). This is why we use the `asset_path` helper when we call `favicon_link_tag` — we have to make sure we use the correct asset name.

Serving our favicon (and actually any static image) via the asset path has the handy benefit of setting the correct cache-control browser header. If you peruse your browser's network diagnostics panel, you should see that the `max-age=` cache header was set to the maximum duration of 1 year (31536000 seconds) —

![Combining `favicon_link_tag` with `asset_path` ensures we serve our favicon with the correct cache-control headers](images/blog/rails-add-favicon-2-minutes/cache-control.png)

This makes sure that visitors to your Rails app will cache your favicon, speeding up load times on subsequent visits.

We get all that for free, just by using the built in Rails helpers!

## Conclusion

This was a super short article! Normally, I write longer, more in depth articles. As it stands, I think I managed to just sneak in under the 2 minute time limit.

I quickly threw this guide together becuase I spent a while trying to do this myself! I hope that by sharing this article, I'll save you some time adding a favicon to your own Ruby on Rails app.

I hope you found this quick guide useful!
