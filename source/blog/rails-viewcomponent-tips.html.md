---
title: Some ViewComponent tips (how I write them)
date: "2023-10-14"
tags: ["viewcomponents", "tips"]
draft: false
description: In this article, I share tips for writing Rails ViewComponents, based on my experience building RailsNotes UI, and other projects. If you use ViewComponents in your Ruby on Rails apps, read this article!
images: ["images/blog/rails-viewcomponent-tips/cover.png"]
---

> After spending years building with ViewComponents, including building an entire [Rails email component library](https://railsnotesui.xyz/email-templates), I've got some handy tips to share!
>
> From organizing your Rails ViewComponents with namespaces (and overwriting Zeitwerk in the process) to using `alias` to create nicer slot helpers, there's bound to be something interesting here for you.

**If you're reading this, you know about ViewComponents. Odds are that like me, you love them!** You've probably also heard of [Phlex](https://phlex.x), but decided to favour ViewComponents. You might even be keeping up with recent Rails improvements, like [allowing templates to define which locals they accept](https://github.com/rails/rails/pull/45602).

**Most of all though, like me, you want to get _better_ with ViewComponents.** I'm always on the lookout for new tips, and better ways I can write them.

I love ViewComponents (I'm not shy about it!), and in this article, I want to share some of my favourite tips with you — little tweaks and hacks I use with ViewComponents. Let's go!

## Namespace your components!

I put this first not to blow your mind (that might come later), but because it makes so much _sense_. Use namespaces! They'll help you organise all your components.

I namespace all my components, and try to use namespaces that indicate _where_ the components will be used.

For example, for [RailsNotes UI](https://railsnotesui.xyz), I use these namespaces —

- `Marketing::` — ViewComponents for the marketing section of the app. The pricing grid, hero section, newsletter form etc.
- `UI::` — ViewComponents for the application UI, like buttons, headings, flash messages etc.
- `Email::` — The RailsNotes UI email component libary, for the preview pages.

The ViewComponent generator supports namespaces — just include it in your generator command —

```sh:Terminal
❯ rails g component ui::card
      create  app/components/ui/card_component.rb
```

The `UI::` namespace is my favourite. I use it in all the time to hold the main app UI components.

## Tweak Zeitwerk for the perfect namespaces

By default, [Zeitwerk](https://github.com/fxn/zeitwerk) (the Rails auto-loader) will convert `underscore_cased/` folder names into `SentenceCased::` namespaces.

If you place components in the folder `frontend_marketing/`, you'd use the namespace `FrontendMarketing::`.

Sometimes, this isn't what you want! The most common case I run into is with components in a `ui/` folder — by default, Zeitwerk loads them under the `Ui::` namespace, rather than `UI::`.

We can tweak that with a custom Zeitwerk initializer —

```ruby:config/initializers/zeitwerk.rb
Rails.autoloaders.main.inflector.inflect("ui" => "UI")
```

> Read the thread on Twitter: [thread](https://twitter.com/_swanson/status/1707009730244120945)

This lets us place components inside `components/ui`, but use the namespace `UI::`, rather than `Ui::`. For example, `UI::Button`, rather than `Ui::Button`.

You could use this to generate uppercase namespaces like `FAQ::`, or lowercase ones like `app::` (but that's kinda weird 😅). Overall this is a handy little tweak I love, to organise my ViewComponents _just_ the way I like.

## Try Inline templates

This is probably the most controversial tip here 😳, but I'm a big fan of [inline templates!](https://viewcomponent.org/guide/templates.html#inline)

By that, I mean passing an `<<~ERB` heredoc to `erb_template`, inside my ViewComponents —

```ruby:components/ui/flash_messages.rb
class UI::FlashMessages < ViewComponent::Base
  def initialize; end

  erb_template <<~ERB
    <% flash&.each do |type, msg| %>
      ...
    <% end %>
  ERB
end
```

This is different from the default ViewComponent style of writing your component logic in a `component.rb` Ruby file, and the component template in a `component.html.erb` ERB file.

You can manually convert a component by including an `erb_template <<~ERB` heredoc, or you can generate components with the `--inline` option —

```sh:Terminal
❯ rails g component ui::card --inline
      create  app/components/ui/card_component.rb
```

I like writing inline components because the _entire_ component lives in a single file, rather than spread over two (similar to React).

**There are some drawbacks though, the main one being editor support. It's terrible!**

I hope this changes, but currently, editors (VS Code, RubyMine) handle inline templates badly — poor code formatting, poor linting, etc. I persist with writing components like this because I _really_ like everything living together, but it's not the React/JSX-style experience I want — it's more like coding in Notepad.

To sidestep this a bit, I like to prototype ERB code in a `html.erb` view. Then, I extract it into a component, to avoid writing too much code in the inline template.

This is personal preference more than anything, but I think people forget about the inline template option. It's got a lot of drawbacks, but it's still my favorite way of writing ViewComponents.

## Take advantage of `#before_render`

You'll probably stumble on the error "`#controller can't be used during initialization`" when writing ViewComponents —

```md:ViewComponent_error
`#controller` can't be used during initialization,
as it depends on the view context that only exists
once a ViewComponent is passed to the Rails render pipeline.

It's sometimes possible to fix this issue
by moving code dependent on `#controller` to a `#before_render` method.
```

What does it mean? It means that you've tried to call methods or Rails helpers inside the `#initialize` method of your component, when they aren't available. I normally encounter this when I use Rails path helpers (`root_path`, `posts_path`, etc) inside `#initialize`, when I'm building components like nabars and buttons.

So do what the message says, and use `#before_render`!

For instance, in my [dynamic navbar article](https://railsnotes.xyz/blog/rails-dynamic-nav-current-page#building-a-dynamic-navbar), we use `before_render` to instantiate the `@nav_links` of our navbar —

```ruby:ui/nav.rb
class UI::Nav < ViewComponent::Base
  def initialize
    ...
  end

  def before_render
    @nav_links = [
      {name: "Pricing", path: pricing_path},
      {name: "Components", path: components_path},
      {name: "Docs", path: documentation_path},
    ]
  end

  ...
end
```

## Drop the \_component suffix from your files

Of course your ViewComponents are components!

They live inside `app/components`. You don't need `_component` at the end of each filename, and names like `NavComponent`, `TableComponent` etc. are repetitive.

But, when you generate a component, your auto-generated files all have the `_component` suffix —

```sh
❯ rails g component ui::nav --inline
      create  app/components/ui/nav_component.rb
      ...
```

And your component names end with `Component` to match —

```ruby:ui/nav_component.rb
class UI::NavComponent < ViewComponent::Base
  ...
end
```

You can change this! Just rename `ui/nav_component.rb` to `ui/nav.rb`, and `UI::NavComponent` to `UI::Nav` — it keeps your file tree a bit nicer, and your views a bit cleaner.

You end up with a component like this —

```ruby:ui/nav.rb
class UI::Nav < ViewComponent::Base
  ...
end
```

Much better 👌

## Alias your slot helpers

> I stole this one from the [presentation slides](https://speakerdeck.com/rstankov/component-driven-ui-with-viewcomponent-gem) of [@rstankov](https://twitter.com/rstankov).

ViewComponents let you define [slots](https://viewcomponent.org/guide/slots.html), which let you pass one component to another, and render them. They also let you define [polymorphic slots](https://viewcomponent.org/guide/slots.html#polymorphic-slots), which let you build great, composable component layouts.

Typically, to pass a component to a slot, you'd write code like —

```erb:view.html.erb
<%= render UI::ColumnPair.new do |cp| %>
  <% cp.with_column(...) %>
  ...
<% end %>
```

You end up writing `with_{slot_component}` a _lot_.

For a tiny quality-of-life improvement, we can `alias` the `with_{slot_component}` method to `{slot_component}`, like this —

```ruby:components/email/column_pair.rb
class Email::ColumnPair < Email::Base
  renders_many :columns
  alias column with_column

  ...
end
```

The [Ruby `alias` keyword](https://www.rubyguides.com/2018/11/ruby-alias-keyword/) let's us define additional names for the same method. In this case, we define `column` to be another name for the `with_column` method.

Now we can write code like this —

```erb {2}:view.html.erb
<%= render Email::ColumnPair.new do |cp| %>
  <% cp.column(...) %>
  ...
<% end %>
```

In this case. we're writing `col.column`, rather than `col.with_column`. It's a tiny thing, but it keeps your views a little cleaner.

By combining aliased slot helpers with dropped component suffixes (from earlier) we can really tidy up our views.

## Consider building pages entirely from components

This is the final tip, and it starts with an example. Below is the Rails view for one of the [RailsNotes UI](https://railsnotesui.xyz) landing pages —

```erb:index.html.erb
<%= render Marketing::Hero.new %>
<%= render Marketing::PrimaryFeatures.new %>
<%= render Marketing::TemplatesSection.new %>
<%= render Marketing::Testimonials.new %>
<%= render Marketing::Pricing.new %>
<%= render Marketing::NewsletterForm.new %>
<%= render Marketing::Faq.new %>
```

No extra HTML, just ViewComponents (most of these components render other components).

Writing the page like this has made it easy to re-order and experiment with the layout. It also makes the structure of the page extremely obvious.

I'm sure this technique won't work for every situation (in many, it's probably a terrible idea!), but it's worth thinking about, and it's worked well for me.

Another example would be the [RailsNotes UI ActionMailer email templates](https://railsnotesui.xyz), which are built entirely from ViewComponents —

```erb:primary_action.html.erb
<%= render Email::Bg::Container.new do |email| %>
  <% email.masthead_image(src: "https://railsnotesui.xyz/logo.png", alt_text: "RailsNotes UI Logo") %>

  <%= render Email::Heading.new(text: "Please click this button!") %>
  <%= render Email::Text.new(text: "This template is for asking your users to do one specific thing. Maybe it's to reset their password, or download a file.") %>
  <%= render Email::Text.new(text: "When you want to get a button clicked, use this!") %>

  <%= render Email::Button.new(text: "Click me →", href: "https://example.com/action") %>
<% end %>
```

## Conclusion

Thanks for reading! If you couldn't tell, I think ViewComponents and Rails are a perfect pairing. It's my long-term hope that they get merged into Rails core, or at least push Rails to improve it's own partials/templating system.

I really, _really_ would love to hear your thoughts on this and any other ViewComponent tips you've learned using them in your Ruby on Rails apps.

Reach out to me on Twitter [@hrrsnbbnt](https://twitter.com/hrrsnbbnt), or email me at **harrison@railsnotes.xyz**.
