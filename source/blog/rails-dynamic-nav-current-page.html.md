---
title: Build dynamic navs with current_page? (and conditional classes)
date: "2023-09-01"
tags: ["ui", "viewcomponents"]
draft: false
description: This article explores a dynamic nav component I built using the current_page? helper method, plus Rails' conditional class helpers. The result? A simple, dynamic navbar component, with different styling based on current page. Plus I threw in the ViewComponent version too 😉
images: ["images/blog/rails-dynamic-nav-current-page/cover.png"]
---

> By combining the `current_page?` helper with dynamic classes, we can build a nav that's styled differently based on the page we're on. Here's an example —
>
> ![Dynamic nav in a Ruby on Rails app, using the current_page? and class_names helper methods.](images/blog/rails-dynamic-nav-current-page/nav.gif)

Nav bars. You've got one, I've got one — almost every Rails app has a nav.

I've finally built a nav I'm happy with, and I wanted to share it with you all! This nav combines the [current_page? helper](https://apidock.com/rails/ActionView/Helpers/UrlHelper/current_page%3F) with dynamic classes (under the hood, the [class_names helper](https://www.rubydoc.info/docs/rails/ActionView%2FHelpers%2FTagHelper:class_names)).

The final result? Conditional styling based on the page we're on. In this example, we use this to style our "active" page with a red underline.

Before we get to the example, I want to look at the `current_page?` helper, and how conditional classes work in our Rails views.

## The `current_page?` helper

`current_page?` is a helper method defined inside `ActionView::Helpers::UrlHelper` ([view the source](https://github.com/rails/rails/blob/main/actionview/lib/action_view/helpers/url_helper.rb#L609C4-L609C4)).

We pass it a path or URL, and it returns `true` if we're on that page.

For example, if we open our Rails app and visit the `root_path` of our app, `current_path?(root_path)` will be `true`.

The `current_path?` helper takes a few more optional arguments, but we've covered the crux of it. I'm sure it has a wide range of uses, but I typically use it for adding dynamic styles to my UIs (like we're doing with this navbar).

## Conditional classes (using the `class_names` helper)

The `class_names` helper (itself just an alias for `ActionView::Helpers::TagHelper.token_list`, [source](https://edgeapi.rubyonrails.org/classes/ActionView/Helpers/TagHelper.html#method-i-token_list)) was introduced as part of Rails 6.1 to make conditionally applying classes in your views easier.

We can use it implicitly in our views like this —

```erb
# class-1 applied, class-2 not
<%= tag.p class: [
  "class-1" : true,
  "class-2" : false
] %>

# output
<p class="class-1"></p>
```

We can use the `class_names` helper (implicitly) with any ActionView helper that accepts a `class:` attribute (tag helpers like `tag.p`, `link_to` like below, and more). We can even use it inside ViewComponents!

The advantage of the `class_names` helper is cleaner view code — rather than interpolating classes inside your views (`<p class="<%= "class-1" if true %>">`), we let Rails handle everything.

## Building a dynamic navbar

Here's the nav! Combining `current_path?` with the `class_names` helper (implicitly) inside our `link_to` tag makes dynamically applying classes easy.

The first group of classes inside our `link_to` are always applied. The second group are applied if we're on the current path (`current_path?(...) == true`), otherwise the third group apply (`!current_path?(...) == true`).

```erb:nav.erb
<% @nav_links = [
    { name: "Pricing", path: pricing_path },
    { name: "Components", path: components_path },
    { name: "Docs", path: documentation_path },
  ] %>

<% @nav_links.each do |link| %>
  <%= link_to link[:name],
              link[:path],
              class: [
                "border-b-2 px-1 hover:border-red-500",
                "border-red-500": current_page?(link[:path]),
                "border-transparent text-stone-700": !current_page?(link[:path]),
              ] %>
<% end %>
```

You can expand and adjust this as needed, but it's a perfect starting point for a simple, dynamic nav for your Ruby on Rails app.

Here's the same code packaged up as a [ViewComponent](https://viewcomponent.org/). I've been [diving into ViewComponents](/blog/rails-viewcomponent-tips) lately and I'm loving them. If you prefer regular partials though, you can use the code from above.

```ruby:components/ui/nav.rb
class Ui::Nav < ViewComponent::Base
  def before_render
    @nav_links = [
      {name: "Pricing", path: pricing_path},
      {name: "Components", path: components_path},
      {name: "Docs", path: documentation_path},
    ]
  end

  erb_template <<~ERB
    <nav>
      <% @nav_links.each do |link| %>
        <%= link_to link[:name],
                    link[:path],
                    class: [
                      "border-b-2 px-1 hover:border-red-500",
                      "border-red-500": current_page?(link[:path]),
                      "border-transparent text-stone-700": !current_page?(link[:path]),
                    ] %>
      <% end %>
    </nav>
  ERB
end
```

> Note: We call `def before_render` instead of `def initialize` since we need access to the path helpers. Learn more from the [ViewComponent docs.](https://viewcomponent.org/guide/lifecycle.html#before_render)

## Conclusion

I hope you found this article useful! This dynamic nav is something I pulled out of [RailsNotes UI](https://railsnotesui.xyz), and initially started as a [tweet.](https://twitter.com/hrrsnbbnt/status/1693657713492869375) People seemed to enjoy it, so I thought I'd turn it into something less transient.

I also hope you've learned something new! The `current_path?` helper is one I use all the time, and `class_names` is also growing on me. Both are super handy!
