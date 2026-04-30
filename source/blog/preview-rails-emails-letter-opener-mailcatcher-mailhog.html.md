---
title: Preview Rails mailers with letter_opener, MailCatcher and MailHog
date: "2023-08-07"
tags: ["actionmailer"]
draft: false
description: This article covers everything you ever wanted to know (and more) about previewing emails and ActionMailer templates in Ruby on Rails. I cover native ActionMailer previews, the letter_opener gem, MailCatcher and MailHog. I've tested them all, and I cover how to use them, and their pros and cons.
images:
  [
    "images/blog/preview-rails-emails-letter-opener-mailcatcher-mailhog/cover.png",
  ]
---

> Lately, I've been previewing a lot of emails.
>
> I've been building the [RailsNotesUI ActionMailer Components Library](https://railsnotesui.xyz/email-templates) — think ActionMailer components like `Email::Button` — so I needed an easy way to preview my Rails mailers.
>
> I ended up going pretty deep into previewing emails in Ruby on Rails, and I wanted to share it with you here. The short version of this article is that the `letter_opener` gem is OK, I love MailCatcher, and MailHog is great (but a bit overkill for me). And if you want, you can skip all this extra stuff, and just use ActionMailer's native previews.

**If you're sending emails from your Ruby on Rails apps, you're going to want to preview them** (please do... I've seen some _wonky_ emails).

**Fortunately, there are four (!!!) great ways to do this in Rails —**

- ActionMailer includes native [mailer previews](https://guides.rubyonrails.org/action_mailer_basics.html#previewing-emails).
- Then there's the [letter_opener](https://github.com/ryanb/letter_opener) gem, which is simple, but basic.
- There's also [MailCatcher](https://github.com/sj26/mailcatcher), my personal favourite.
- Finally there's [MailHog](https://github.com/mailhog/MailHog), the most advanced of the bunch.

I've experimented with all four of these methods while I've been working on [RailsNotesUI](https://railsnotesui.xyz/email-templates). The good news is that any of these methods will probably serve you well, but there are some subtle differences which I'll cover.

In this article, I'm going to share everything I've learned about email previewing in Rails, and **I'm going to show you how to quickly preview emails in your Ruby on Rails apps**, using each of these methods (mailer previews, `letter_opener`, `MailCatcher` and `MailHog`).

> Note: All these methods assume you're using ActionMailer to deliver your emails (if you're calling `Mailer.deliver_now`, you should be OK). These methods either hijack the `action_mailer.delivery_method` attribute to deliver emails to a preview inbox, or in the case of native mailer previews, just render your mailer directly.
>
> Never heard of ActionMailer? If you're interested in learning, I wrote about ActionMailer here — [From API calls to ActionMailer.](/blog/refactoring-a-ruby-on-rails-app-to-use-actionmailer-for-transactional-email)

## Using ActionMailer's native mailer previews

**Ruby on Rails has a simple, easy way of previewing your mailers**, and it's where I recommend you start. **Plus, this method requires no extra dependencies.**

Every time you generate a `mailer` in your Ruby on Rails apps, ActionMailer also generates an `ActionMailer::Preview` for your email. You can view them in your browser, and they look a bit like this —

![A native ActionMailer preview of your email — no extra gems or dependencies needed here!](images/blog/preview-rails-emails-letter-opener-mailcatcher-mailhog/mailer-preview.png)

> Learn more in the [official ActionMailer docs](https://guides.rubyonrails.org/action_mailer_basics.html#previewing-emails)
>
> I've also created a [Rails Generate Mailer Command Builder](https://railsg.xyz/mailer) that you might find handy!

Wait what? How did Rails generate this mailer preview?

When you generate an ActionMailer mailer, Rails creates a couple of files, and one of those is the `test/mailers/previews/preview.rb` file —

```sh:Terminal
rails g mailer test

      create  app/mailers/test_mailer.rb
      invoke  erb
      create    app/views/test_mailer
      invoke  test_unit
      create    test/mailers/test_mailer_test.rb
      create    test/mailers/previews/test_mailer_preview.rb # <<< your preview
```

If you open that file, you'll see something like this —

```ruby:test/mailers/previews/test_mailer_preview.rb
# Preview all emails at http://localhost:3000/rails/mailers/test_mailer
class TestMailerPreview < ActionMailer::Preview
end
```

Rails automatically generated an `ActionMailer::Preview` for our mailer. We just need to fill it in!

We need to add a method to `TestMailerPreview` which invokes the email we want to preview. To preview the `TestMailer.send_bg_email` email, first add a method like this —

```ruby:test/mailers/previews/test_mailer_preview.rb
class TestMailerPreview < ActionMailer::Preview
 def test_email
  TestMailer.send_bg_email
 end
end
```

Then, we start our Rails app locally and visit the preview URL (http://localhost:3000/rails/mailers). We can see a list of all our mailer previews —

![The index view of all your mailer previews. If you add more previews or mailers, they'll show up here.](images/blog/preview-rails-emails-letter-opener-mailcatcher-mailhog/mailer-preview-index.png)

Then we can click on one of our mailer previews to see it —

![Native preview of our mailer, using the built-in previews from ActionMailer.](images/blog/preview-rails-emails-letter-opener-mailcatcher-mailhog/mailer-preview.png)

That's it! **This is by far the easiest way to preview emails in your Rails app — you just need to add a method to your `mailers/previews` files and you're set.**

One handy thing about ActionMailer previews is that your email previews are responsive (for testing mobile views of your emails). You can use your browser developer tools to resize your viewport and get an idea of how your mailers will look at different sizes —

![ActionMailer email previews are responsive, which is handy for testing media breakpoints and mobile layouts.](images/blog/preview-rails-emails-letter-opener-mailcatcher-mailhog/mailer-preview-reflow.gif)

One last thing — It's important to note that unlike any of the following options, **ActionMailer previews don't actually send your emails, just render them**.

In practice, this shouldn't change how your emails look (since all the options in this article are browser-based, they'll all look the same on your device). It means though that ActionMailer previews won't pass through the Rails SMTP gateway (unlike with `letter_opener`, `MailCatcher` or `MailHog`).

## Previewing emails with the letter_opener gem

The [letter_opener gem](https://github.com/ryanb/letter_opener) is pretty basic compared to the other options in this article. It's still handy though, and easy to set up.

Here's what a `letter_opener` preview of an email looks like —

![An email from my Rails app, captured by the letter_opener gem, and displayed in a browser window.](images/blog/preview-rails-emails-letter-opener-mailcatcher-mailhog/letter-opener.png)

Unlike `MailCatcher` and `MailHog` (from the next sections), the `letter_opener` gem won't give you an inbox. It just grabs the emails you send from your Rails app, and automatically displays them in a new browser tab.

If you're testing lots of emails, the lack of inbox, plus the auto-opening in a new tab gets annoying (lots of browser tabs, hard to find old emails, etc). If you're just sending a couple of test emails though, there's nothing to worry about.

> You could check out [letter_opener_web](https://github.com/fgrehm/letter_opener_web) for a `letter_opener` powered inbox. However, I recommend just using `MailCatcher` or `MailHog` instead. I don't think `letter_opener_web` is as good as the other two options.

To use `letter_opener` in your Rails app, first add it to your `Gemfile` —

```ruby:Gemfile
gem "letter_opener", group: :development
```

> Note: don't forget to `bundle`

Next, we need to configure Rails to send emails to `letter_opener`. We can do that by editing `config/environments/development.rb`, and adding —

```ruby:config/environments/development.rb
config.action_mailer.delivery_method = :letter_opener
config.action_mailer.perform_deliveries = true
```

That's it! These two lines configure ActionMailer to send emails via `letter_opener`. Once they're sent, `letter_opener` will intercept them and open them up for us in our browser.

> Note: The `letter_opener` gem has a few configuration options, which you can learn more about at the [letter_opener GitHub page](https://github.com/ryanb/letter_opener?search=1#configuration). In most cases though, you won't need to touch them.

In most cases, the `letter_opener` gem will probably give you everything you need — a simple way to preview emails in your Rails app.

You could stop reading here, but I encourage you to continue — `MailCatcher` and `MailHog` aren't too different from `letter_opener`, but they have a few handy things which make them nicer to work with.

## Previewing emails with MailCatcher

I like [MailCatcher](https://mailcatcher.me/). It's easy to set up, it gives you a neatly organized web inbox (unlike `letter_opener`), and it's simpler than `MailHog`.

From the MailCatcher website —

> Catches mail and serves it through a dream.
>
> MailCatcher runs a super simple SMTP server which catches any message sent to it to display in a web interface. Run `mailcatcher`, set your favourite app to deliver to `smtp://127.0.0.1:1025` instead of your default SMTP server, then check out http://127.0.0.1:1080 to see the mail that's arrived so far.

MailCatcher does one thing well. It runs a local inbox for us, which our Rails app can send mail to, and we can view in our browser. It looks like this —

![An example of the MailCatcher inbox. I love how plain and boring it is 😅](images/blog/preview-rails-emails-letter-opener-mailcatcher-mailhog/mailcatcher.png)

MailCatcher is also quick to set up. The [MailCatcher setup instructions](https://github.com/sj26/mailcatcher#how) are easy to follow, but to repeat them here, we first install the `mailcatcher` gem —

```sh:Terminal
gem install mailcatcher
```

> Note: don't add `mailcatcher` to your `Gemfile`. You want to install it system-wide.

Then start `mailcatcher` with —

```sh:Terminal
mailcatcher

Starting MailCatcher v0.9.0
==> smtp://127.0.0.1:1025
==> http://127.0.0.1:1080
*** MailCatcher runs as a daemon by default. Go to the web interface to quit.
```

Running `mailcatcher` starts two separate servers — the first is the `http:` server, which we visit in our browser to preview our emails. The second is the `smtp:` server, which is where we want our Rails app to deliver our emails.

> Note: MailCatcher runs as a daemon by default, so you don't need to keep a terminal window running.

We can adjust our Rails app to route emails to `mailcatcher` like so —

```ruby:config/environments/development.rb
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = { :address => "127.0.0.1", :port => 1025 }
config.action_mailer.raise_delivery_errors = false
```

Now, if we visit http://127.0.0.1:1080 and send an email, it shows up in our MailCatcher inbox —

![All the emails we send from our Ruby on Rails app will show up here, in our MailCatcher inbox. This makes it easy to go back and find older emails, plus it cuts down on the number of open browser tabs (compared to Letter Opener).](images/blog/preview-rails-emails-letter-opener-mailcatcher-mailhog/mailcatcher.png)

> I've been using `rails runner` to send emails directly from my terminal, like this — `rails runner "Mailer.invoice().deliver_now"`
>
> I've written more about `rails runner` here — [Skipping the console with Rails Runner.](/blog/skip-rails-console-with-rails-runner)

That's it! Again, the setup is easy, and we can also do handy things like view our email source code, and download it as a `.eml` file.

**The only major drawback to note (that I've found) is that MailCatcher doesn't correctly reflow when we adjust our browser viewport, which makes it impossible to test responsive layouts.**

You can see that if we shrink our viewport, MailCatcher also shrinks, which isn't what we want —

![Shrinking the browser viewport causes the entire MailCatcher window to shrink, which makes it impossible to test mobile layouts of our emails. This is my only major drawback of MailCatcher, and it's pretty annoying.](images/blog/preview-rails-emails-letter-opener-mailcatcher-mailhog/mailcatcher-bork.png)

I don't think this issue is a total show-stopper, but it can be pretty annoying.

**If it's an issue for you, `MailHog`(below) does everything that `MailCatcher` does, plus it correctly resizes the viewport.**

## Upgrading from MailCatcher to MailHog

[MailHog](https://github.com/mailhog/MailHog) is like MailCatcher but better. It does everything that MailCatcher does, plus it correctly responds to a resized browser viewport, and it includes a couple of handy extras (like Jim, the chaos monkey 🙉).

Getting started with MailHog is easy. On my Macbook, it's as simple as —

```sh:Terminal
brew install mailhog
```

MailHog is designed to be a drop-in replacement for MailCatcher. If we run `mailhog`, you'll see that it starts running on the same SMTP port that MailCatcher did —

```sh:Terminal
mailhog

2023/08/08 12:45:23 Using in-memory storage
[HTTP] Binding to address: 0.0.0.0:8025
2023/08/08 12:45:23 Serving under http://0.0.0.0:8025/
2023/08/08 12:45:23 [SMTP] Binding to address: 0.0.0.0:1025
```

This means that we can re-use our MailCatcher configuration with MailHog —

```ruby:config/environments/development.rb
# this is the same config that we used for MailCatcher
# no changes needed
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = { :address => "127.0.0.1", :port => 1025 }
config.action_mailer.raise_delivery_errors = false
```

If we send an email from our Rails app, you'll see it appear inside our MailHog inbox —

![MailHog previewing our email. To me, MailHog is a bit more cluttered than MailCatcher, which is a drawback.](images/blog/preview-rails-emails-letter-opener-mailcatcher-mailhog/mailhog.png)

**MailHog has a few handy improvements over MailCatcher, but its big feature is Jim, the chaos monkey 🙉.**

Enabling Jim will configure MailHog to behave erratically when it receives emails, which can be helpful for debugging. I haven't used Jim enough to say more, but it's worth looking into if you want to test your emails more thoroughly.

**Unlike MailCatcher, MailHog will also correctly resize our email preview as we adjust our browser viewport.** This makes it easy to test mobile/responsive email layouts, which is a big plus.

**Despite MailHog being superior to MailCatcher feature-wise, I still find myself drawn to MailCatcher.** I think it's because, for me, the MailCatcher UI is simpler than MailHog. I also like how MailCatcher runs as a background daemon, whereas you need to keep MailHog alive in a terminal window.

**Honestly though, MailHog and MailCatcher are similar enough that I think it's worth just picking the one you like more.**

## Conclusion

Thanks for reading — I hope you found this article useful! Who knew that the world of Ruby on Rails mail previewing tools could be so rich and diverse!

Whether you end up choosing `letter_opener`, MailCatcher, MailHog or native mailer previews, I think you'll be in good hands.

And if you're stuck. you can always do what I did, and try out all 4!
