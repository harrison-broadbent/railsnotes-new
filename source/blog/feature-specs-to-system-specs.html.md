---
title: Refactoring from feature specs to system specs
date: "2023-09-17"
tags: ["rspec", "testing", "refactoring"]
draft: false
description: In this article, I break down the difference between system specs and feature specs in RSpec and Rails, and walk you through refactoring your feature specs to system specs.
images: ["/static/images/feature-specs-to-system-specs/cover.png"]
---

> I've been writing feature specs for a while. Turns out, they should have been system specs instead! Maybe you've done the same, and I wouldn't blame you — there's not much good info available, and it's hard to find out what the differences are.
>
> To help, I wrote this article. In it, I break down the difference between system specs and feature specs in RSpec and Rails, and walk you through refactoring your feature specs to system specs.

Lately, I've been writing a lot of RSpec tests, and I came upon a conundrum — Should I write feature specs, or system specs? Given that [RSpec released system specs in 2017](https://rspec.info/blog/2017/10/rspec-3-7-has-been-released/#rails-actiondispatchsystemtest-integration-system-specs), it was surprisingly difficult to find an answer!

**Turns out, if your running Rails 5.1+, you should write system specs. If you've been writing feature specs though, it's OK!** I was doing that too, and they work _just fine._

If you want to make the (simple) transition though, this article is for you. I start with a quick breakdown of the differences between RSpec's feature specs and system specs. Then, I walk you through converting your feature specs into system specs.

## Feature Specs vs. System Specs — What's the difference?

There's one key difference between RSpec's feature specs and system specs — **system specs are RSpec's wrapper around native Rails system tests**, whereas feature specs are a kind of "proto-system-spec", from a time [before Rails included system tests](https://rspec.info/documentation/3.8/rspec-rails/#system-specs-feature-specs-request-specs-what-s-the-difference).

The RSpec team [officially recommends Rails 5.1+ apps use system specs](https://rspec.info/blog/2017/10/rspec-3-7-has-been-released/#rails-actiondispatchsystemtest-integration-system-specs) (since Rails 5.1 was the version of Rails which introduced native system tests).

Here's a great explanation of their differences, pulled from the RSpec wiki —

> Before Rails introduced system testing facilities, feature specs were the only spec type for end-to-end testing. While the RSpec team now officially recommends system specs instead, feature specs are still fully supported, look basically identical, and work on older versions of Rails.
>
> On the other hand, feature specs require non-trivial configuration to get some important features working, like JavaScript testing or making sure each test runs with a fresh DB state. With system specs, this configuration is provided out-of-the-box.

Both specs are fine, both are similar, but system specs have a few bonus extras —

- **System specs easily integrate with different test drivers.** By default, they run using `selenium`, but you can change that to `Rack::Test` or `playwright` easily. It's a simple change in system specs, but trickier with feature specs.

- **System specs also handle database cleaning between runs.** This saves you from installing the `database-cleaner` gem alongside your test suite.

That's it! The differences are slight, but I hope this section has cleared things up for you. It took me hours of research to piece this together!

Now, read on as I show you how to refactor your feature specs to system specs (it's simple, I promise 😉).

## Refactoring your feature specs to system specs

Refactoring from feature specs to system specs is, fortunately, pretty straightforward.

Essentially, we just add a new gem, edit `spec/rails_helper.rb`, and rename our feature specs into system specs.

Let's begin! Start by adding `selenium-webdriver` to your `Gemfile` —

```ruby:Gemfile
group :development, :test do
  ...
  # testing
  gem "capybara"
  gem "selenium-webdriver"
  gem "rspec-rails"
end
```

RSpecs system specs use `selenium` by default, but we're going to overwrite that. We're going to configure RSpec to run our system specs with `rack_test`, and only use `selenium` for javascript-enabled tests.

Let's do that now. By editing `rails_helper.rb`, we tell RSpec to use `rack_test` by default and only use `selenium` as needed. If you wanted to swap `selenium` for `playwright` (or another browser automation tool), you could do it here.

Add this to the end of your `rails_helper.rb` —

```ruby:spec/rails_helper.rb
RSpec.configure do |config|
  ...
  config.before(:each, type: :system) do
    driven_by :rack_test # rack_test by default, for performance
  end

  config.before(:each, type: :system, js: true) do
    driven_by :selenium_chrome_headless # selenium when we need javascript
  end
end
```

**So why do this? Why not use `selenium` for everything?**

Well, `rack_test` runs a lot faster than `selenium`, but it doesn't support javascript. By using `rack_test` as the default driver for our system specs, they run _much_ quicker. Then we tell RSpec to use `selenium` for tests that require javascript, since `selenium` emulates a full browser, and we get the best of both worlds — performance by default, and javascript testing when we need it.

If we didn't add this config, RSpec would use `selenium` for everything. There's nothing _wrong_ with this (although it might break some specs with its different API) — it would just be an unnecessary performance slowdown.

On to our next step though — time to edit our spec files.

To start, rename `spec/features` to `spec/system`. If you've configured RSpec with `config.infer_spec_type_from_file_location!`, this should be enough to tell RSpec to treat these as system specs.

I like to specify the `type:` of my specs directly anyway — if you do too, you'll need to edit your specs and change their `type:` —

```ruby:spec/system/your_spec.rb
# OLD: feature spec type
RSpec.feature "name", type: :feature do

# NEW: system spec type
RSpec.describe "name", type: :system do
```

**There's a chance that if you run `rspec` now, everything will work!** Your system specs will run as they should, and everything will pass. If so, congratulations!

**It's likely though that you'll run into some sort of error, caused by `selenium` (or whichever browser automation tool you're using).**

In my case (on macOS), I was getting this error —

```sh:Terminal
Selenium::WebDriver::Error::SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version 114
```

This one's pretty simple, it's caused by `selenium-chromedriver` not having access to a local `chromedriver` executable. To fix it, I just had to install `chromedriver` and give it permission to run —

```sh:Terminal
❯ brew install chromedriver
==> Downloading https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/116.0.5845.96/mac-arm64/chromedriver-mac-arm64.zip
==> Installing Cask chromedriver
==> Linking Binary 'chromedriver' to '/opt/homebrew/bin/chromedriver'
🍺  chromedriver was successfully installed!
```

Then I removed the extended attributes from `chromedriver`, so macOS could run it straight away —

```sh:Terminal
xattr -d com.apple.quarantine $(which chromedriver)
```

If you're on another operating system, you'll have to make sure you've correctly installed `chromedriver` yourself.

Once it's installed though, your system specs should work! RSpec should be able to load `selenium` correctly and interact with your specs.

![RSpec running my system specs with chromedriver.](/static/images/feature-specs-to-system-specs/chromedriven.gif)

> Note: I replaced `selenium_chrome_headless`, with `selenium_chrome` inside `rails_helper.rb` to run my specs in "headed mode" for the gif above. This lets you see what RSpec and `selenium` are actually _doing_, which is fun to watch and can be helpful for debugging.

Since RSpec system specs handle wiping the database for us, you can also remove the `database_cleaner` gem from your `Gemfile`, and any related configuration — in my case, I could also delete `spec/support/database_cleaner.rb`.

Enjoy your system specs!

## Conclusion and more resources

I hope you enjoyed this article! It was tough piecing together all the scattered info on system vs. feature specs, but I think this article is a solid place to start.

Feel free to reach out if you have any questions, otherwise, these links are great places to go for more information on RSpec's system specs and feature specs —

> RSpec changelog: https://rspec.info/blog/2017/10/rspec-3-7-has-been-released/#rails-actiondispatchsystemtest-integration-system-specs
>
> RSpec system spec and feature spec documentation: https://rspec.info/documentation/3.8/rspec-rails/#system-specs-feature-specs-request-specs-what-s-the-difference
>
> Upgrading to RSpec 3.7.2 and system specs: https://everydayrails.com/2018/01/08/rspec-3.7-system-tests.html
