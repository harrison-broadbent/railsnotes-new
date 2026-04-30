---
title: Simple Lazy Loading in Rails with Hotwire and Turbo Frames
date: "2023-07-25"
tags: ["hotwire", "tailwindcss", "popular"]
draft: false
description: Hotwire and Turbo Frames make it easy to add lazy-loading into our Rails apps — I'm talking only 12 lines of code! Plus, we can use TailwindCSS to create a skeleton loader for our Turbo Frames.
images: ["images/blog/simple-lazy-loading-hotwire-turbo-frames-rails/cover.png"]
---

> Hotwire and Turbo Frames make it easy to add lazy-loading into our Rails apps — I'm talking only 12 lines of code! Plus, we can sprinkle in some TailwindCSS to create a basic skeleton loader for our Turbo Frames.
>
> This is what we're going to build —
>
> ![A simple lazy loader for our Ruby on Rails app, built with Hotwire, Turbo Frames and TailwindCSS.](images/blog/simple-lazy-loading-hotwire-turbo-frames-rails/lazy-skeleton.gif)

So — you want to add lazy loading to your Rails app.

In this article **I'm going to walk you through exactly how to do that**, and I think you'll be surprised by how **easy** it is (we can do it in 12 lines of code!).

**Hotwire and Turbo Frames make lazy loading super simple** — with a couple of Turbo Frames and a few small adjustments, your Ruby on Rails app will be able to lazy-load content from anywhere.

Let's get started!

## Scaffolding a sample Rails app

I'll be adding lazy-loading to a sample Rails app, which we generate in this section.

These commands will generate everything we need, and then in the next section, we'll add lazy-loading with some `turbo_frame_tag` elements.

To generate the sample Rails app, run these commands in your terminal —

```sh:Terminal
# generate a new Rails app, and include TailwindCSS
rails new hotwire_turbo_lazy_loading_2 --css=tailwind && cd hotwire_turbo_lazy_loading

# Scaffold a new Post model
rails g scaffold Post title:string

# Migrate the database
rails db:migrate

# Start our Rails app
bin/dev
```

If everything went well, you should be able to visit https://localhost:3000/posts, and see the `Posts#index` page.

Now we can move on to the good stuff — adding lazy loading to our Rails app, with the help of some Turbo Frames and Hotwire!

## Lazy loading with Hotwire and Turbo Frames

Rails makes lazy-loading easy with its `turbo_frame_tag` element.

If you're not familiar with a `turbo_frame_tag`, here's a simple example —

```erb
<%= turbo_frame_tag :frame_name, src: src_path, loading: :lazy do %>
  Temporary content while we're loading...
<% end %>
```

What's going on here?

It's really simple — **this Turbo Frame will load the contents of a different Turbo Frame, and overwrite its current content with the new content.**

The new content comes from a Turbo Frame with a matching `:frame_name`, located at the `src_path`.

By setting `loading: :lazy`, we can make our Turbo Frame do this loading lazily (duh). While we're waiting, the contents inside the current `turbo_frame_tag` will be displayed — this makes it easy to [add a skeleton-loader to our Turbo Frame](#building-a-skeleton-loader-with-tailwindcss).

Essentially, our Turbo Frame will transplant data from a different Turbo Frame (which is probably in another Rails view), into the current Turbo Frame.

> You can read more about Turbo Frames in the [official Hotwire handbook.](https://turbo.hotwired.dev/handbook/frames#lazy-loading-frames)

To add lazy-loading into our Rails app, we just need to do two things —

- First, we need to add a Turbo Frame to a view and set it up correctly (the most likely views we want to lazy-load in are `#index` views, since getting all the records from the database can be slow, or views which render data from external APIs).
- Then, we need to create another view, controller action and route to provide the data for our Turbo Frame to render.

If this sounds a bit complicated, don't worry — just read the code below! We add the entire lazy-loading view for our `Posts#index` method in 12 lines of code.

To create a basic lazy loader, adjust your `posts/index.html.erb` to include a `turbo_frame_tag` —

```erb:posts/index.html.erb
<div class="w-full">
  <p class="text-xl font-bold">Lazy loading with Hotwire and Turbo Frames</p>
  <%= turbo_frame_tag :posts_lazy, src: posts_index_lazy_path, loading: :lazy do %>
  <% end %>
</div>
```

This `turbo_frame_tag` is going to lazily call the `posts_index_lazy_path` route, and try to find another `turbo_frame_tag` called `:posts_lazy`.

This should make our next steps obvious — we need to create the `posts_index_lazy_path`, and add a Turbo Frame at that path called `:posts_lazy`, which renders the content for our `Posts#index` view.

To do that, in your `PostsController`, you need to add a new controller action for our view —

```ruby:PostsController.rb
def index_lazy
  @posts = Post.all
end
```

Then we need to map our new `Posts#index_lazy` controller action to a route —

```ruby:routes.rb
Rails.application.routes.draw do
  get 'posts/index_lazy', to: 'posts#index_lazy'
  resources :posts
end
```

And finally, we need to create a view for our new `Posts#index_lazy` controller action —

```erb:posts/index_lazy.html.erb
# this will be inserted into the turbo_frame_tag in posts/index.html.erb

<%= turbo_frame_tag :posts_lazy do %>
  Count: <%= @posts.count %>
  <%= render @posts %>
<% end %>
```

That's it for our simple lazy loader! It's just a couple of Turbo Frames, alongside a new `Posts#index_lazy` route to load our `Posts`.

If we [seed our database with some fake data](/blog/seed-your-database-with-the-faker-gem), we can see our lazy-loader in action —

![Lazily loading 100,000 fake Posts in our Rails app with a Turbo Frame lazy loader.](images/blog/simple-lazy-loading-hotwire-turbo-frames-rails/lazy-basic.gif)

> Note 1: I seeded my database with 100,000 test `Posts` to help test out our lazy loader. You can check out my article on [seeding with the faker gem and `upsert_all`](/blog/seed-your-database-with-the-faker-gem) if you need some help seeding your database.
>
> Note 2: I adjusted the `_posts` partial to be shorter, which is why the GIF from above might look a bit different to yours.

So we've got our basic lazy loading Turbo Frame working — nice!

Right now though, we just have a blank screen while we wait for our content to load. That's some pretty terrible UX!

In the next section, we fix this by combining our Turbo Frame with some TailwindCSS to build a simple skeleton loader.

## Building a skeleton loader with TailwindCSS

Before we start — what is a skeleton loader?

It's just a UI placeholder for your content. A skeleton loader gives your user some visual feedback while they wait for your content to lazily load in the background.

![A basic skeleton loader. They're usually just some flashing grey boxes, to remind your users that your app hasn't broken — it's just loading.... slowly.](images/blog/simple-lazy-loading-hotwire-turbo-frames-rails/skeleton.gif)

Skeleton loaders are [great for user experience!](https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a#results) [One (small) study](https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a) found that using skeleton loaders will leave your users happier than blank screens or spinners, and make your users perceive your loading times as shorter!

Let's make one ourselves — we can combine our Turbo Frame with some basic HTML and TailwindCSS to make a simple skeleton loader for our `Posts`.

Here's a basic skeleton loader I whipped up by combining our Turbo Frame with some TailwindCSS —

```erb:index.html.erb
<div class="w-full">
  <p class="text-xl font-bold">Lazy loading with Hotwire and Turbo Frames</p>
  <%= turbo_frame_tag :posts_lazy, src: posts_index_lazy_path, loading: :lazy do %>
    <div class="animate-pulse w-1/12 mt-6">
      <div class="p-2 w-full bg-stone-500 mb-2 rounded-md"></div>
      <div class="p-2 w-full bg-stone-500 mb-2 rounded-md"></div>
      <div class="p-2 w-full bg-stone-500 mb-2 rounded-md"></div>
    </div>
  <% end %>
</div>
```

The main thing happening here is inside our `turbo_frame_tag`. The content inside the `turbo_frame_tag` will be rendered initially, and then replaced with the lazily-loaded `Posts` once they've all loaded.

Reload the page, and we can see our skeleton loader in action —

![Our finished lazy loader for our Rails app, combining our Turbo Frame with a skeleton loader.](images/blog/simple-lazy-loading-hotwire-turbo-frames-rails/lazy-skeleton.gif)

The `animate-pulse` class is very useful for showing a pulsing skeleton loader. You can also move your skeleton loader into its own partial, to make it easier to manage.

## Conclusion

I hope you found this article useful!

Adding lazy loading to a Ruby on Rails is surprisingly easy — Hotwire and Turbo Frames make the whole process pretty clean and flexible.

I also encourage you to check out [this excellent guide on lazy loading](https://boringrails.com/tips/turboframe-lazy-load-skeleton) from the BoringRails blog, which helped me write this post.

I've also written another article about the [turbo_frame_tag, Hotwire and lazy-loading](/blog/simple-lazy-loading-hotwire-turbo-frames-rails) which you might find interesting!

> Handy Resources:
>
> - [Lazy-loading content with Turbo Frames and skeleton loader | BoringRails blog](https://boringrails.com/tips/turboframe-lazy-load-skeleton)
> - [Hotwire/Turbo Documentation](https://turbo.hotwired.dev/handbook/frames#lazy-loading-frames)
