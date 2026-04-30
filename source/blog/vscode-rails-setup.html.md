---
title: A decent VS Code + Ruby on Rails setup
date: "2024-02-20"
tags: ["vscode", "development"]
draft: false
description: Setting up VS Code for Ruby on Rails development can be tricky, so I wrote this article to help. In it, I share different VS Code extensions for things like autocomplete, linting, formatting and more! I've even put together a handy extension pack to get you setup fast.
images: ["images/blog/vscode-rails-setup/cover.png"]
---

> Setting up VS Code for Ruby on Rails development can be tricky, so I wrote this article to help. Plus, I've turned the extensions in this article into a [VS Code Extension Pack.](https://marketplace.visualstudio.com/items?itemName=RailsNotes.railsnotes-ruby-on-rails-extension-pack) Use it to install all the extensions from this article in 1-click, to get started quickly with VS Code + Ruby on Rails.

**Using VS Code as a Ruby on Rails editor shouldn't be so hard!** It's tricky deciding which extensions to use, and a bunch of them are outdated or in a state of disrepair.

I'm hoping this short article will make it easier to setup VS Code for Ruby on Rails — I've collected the core extensions I use for all my Ruby on Rails editing, and even bundled them into a [handy extension pack](https://marketplace.visualstudio.com/items?itemName=RailsNotes.railsnotes-ruby-on-rails-extension-pack) so you can install them all at once.

I've grouped the extensions in this article into four categories — language servers, other LSPs, formatters/linters, and ERB formatters and language tools.

## Language Server (Ruby LSP... and Solargraph)

The language server is the bread-and-butter of an editing experience. It powers things like autocomplete, error-checking, jump-to-definition and more. **In the Ruby on Rails world, we've got two Language Servers — the [Shopify Ruby LSP](https://github.com/Shopify/vscode-ruby-lsp) (newer), and [Solargraph](https://github.com/castwide/solargraph) (older); I run both!**

![Language servers give you variable suggestions, goto definiton and more. This is an area that Ruby extensions have typically struggled in (compared to other languages)](images/blog/vscode-rails-setup/language-server.gif)

The Shopify Ruby LSP is an awesome project and improving every day (literally, there are updates to the extension every few days), but after nearly 2 years of development, it still doesn't _entirely_ replace Solargraph. **I find that Solargraph is still better at autocompleting variables and method names, so I just run both (they play nicely together).**

I'm _hoping_ that _one day_, the Shopify Ruby LSP will overtake Solargraph in features and we'll be able to just run a single Language Server, but it won't happen for a while. Until then though, you can safely run both Language Servers together without any trouble.

> Language Server Extensions:
>
> - [Shopify Ruby LSP (VS Code Extension Marketplace)](https://marketplace.visualstudio.com/items?itemName=Shopify.ruby-lsp)
> - [Solargraph (VS Code Extension Marketplace)](https://marketplace.visualstudio.com/items?itemName=castwide.solargraph)

## Other LSP Integrations (Stimulus LSP and Rails LSP)

The introduction of the [LSP protocol](https://microsoft.github.io/language-server-protocol/) paved the way for full-fledged LSPs like the [Ruby LSP](https://github.com/Shopify/ruby-lsp) from above, but it's also made it easy for smaller, bespoke LSPs to integrate with VS Code. There are currently two key LSPs worth checking out — [Stimulus LSP](https://github.com/marcoroth/stimulus-lsp) and [Rails LSP](https://github.com/Shopify/ruby-lsp-rails). Both are great!

The Stimulus LSP from [Marco Roth](https://twitter.com/marcoroth_) gives you editor suggestions for [Stimulus controllers](https://stimulus.hotwired.dev), and the Rails LSP from Shopify lets you hover over models in your app to view their schema.

If you're using the Rails LSP, make sure to follow the [installation instructions](https://github.com/Shopify/ruby-lsp-rails?tab=readme-ov-file#installation) by adding it to your Gemfile —

```ruby
group :development do
  gem "ruby-lsp-rails"
end
```

> Note: the Rails LSP sits on top of the Ruby LSP extension. You don't need to install an extra extension, just the gem.

The Stimulus LSP gets updated pretty frequently and is shaping up to be a really handy tool for building Stimulus controllers; The Rails LSP is pretty barebones right now, but I'm hoping that once Shopify has the Ruby LSP in a good place, they'll shift their focus to enhancing the Rails LSP.

> Other LSP Extensions:
>
> - [Stimulus LSP (VS Code Extension Marketplace)](https://marketplace.visualstudio.com/items?itemName=marcoroth.stimulus-lsp)
> - Rails LSP (just add the gem to your `Gemfile`)

## Ruby Linter & Formatter (Rubocop, Standard and Rufo)

Linters and formatters tend to go hand-in-hand, despite being slightly different — linters correct code _style (like how you structure conditionals)_, whereas formatters correct code _formatting (like whether to insert a space inside hashes)_.

Both are typically must-haves for any non-trivial project — they keep your code consistent between files and projects, and between teammates too.

The linter/formatter you pick just comes down to preference. Do you want to:

- use heavyweight [Rubocop](https://github.com/rubocop/rubocop) and tweak it until you're happy,
- choose [Standard](https://github.com/standardrb/standard) as a prescriptive linter + formatter,
- forgo linting altogether and use [Rufo](https://github.com/jnbt/vscode-rufo) for formatting?

I use Rufo in all my side-projects, and Standard at work — I like how prescriptive they are (compared to Rubocop), and I find that for side-projects I'm fine giving up linting for my preferred formatter, Rufo.

![Formatting some odd looking Ruby code with the Rufo extension](images/blog/vscode-rails-setup/rufo.gif)

> Note: make sure you've got the `rubocop`, `standard` or `rufo` gems available in your `PATH` (depending on which one you choose). You'll probably need to run one of:
>
> - `bundle add rubocop`
> - `bundle add standard`
> - `bundle add rufo`

> Ruby Linter & Formatter extensions:
>
> - [Rubocop (VS Code Extension Marketplace)](https://marketplace.visualstudio.com/items?itemName=rubocop.vscode-rubocop)
> - [Standard Ruby (VS Code Extension Marketplace)](https://marketplace.visualstudio.com/items?itemName=testdouble.vscode-standard-ruby)
> - [Rufo - Ruby formatter (VS Code Extension Marketplace)](https://marketplace.visualstudio.com/items?itemName=jnbt.vscode-rufo)

## Debugger (VS Code rdbg Ruby debugger)

There's just one extension you need to care about for interactive debugging in VS Code — it's the [VSCode rdbg Ruby Debugger extension](https://marketplace.visualstudio.com/items?itemName=KoichiSasada.vscode-rdbg).

The extension is great (and powerful)! It can connect directly to `debugger` instances in your code, attach to multiple `debuggers` at once (ie: `sidekiq:` and `web:` processes in `Procfile.dev`), automatically connect a debugger whenever your app raises an `Exception`, and more!

Some setup is required to use this extension. I decided it was a bit too much for this article, so I've broken it out into a separate article — [Using Rails debugger/rdbg with VS Code](/blog/rails-debugger-rdbg-vscode).

The quick overview though is that you need to export the `RUBY_DEBUG_OPEN=true` environment variable, install the extension, and then create a `launch.json` file in the VS Code "Run and Debug" menu. I initially put off doing this, but it's a really handy extension and takes 5 minutes to set up, so I reckon it's worth giving it a shot!

> Note: This section was added on March 13th, 2024 (after this article was originally published).

## ERB Formatter / Language Tool (Simple Ruby ERB, ERB Formatter/Beautify)

Finally, you'll need a separate set of extensions to handle Rails view templates. ERB is the most popular, and it's what I use, so I've included ERB-related extensions (you'll need to find your own extensions for HAML or Slim).

I use two ERB extensions for VS Code — the first is [Simple Ruby ERB](https://github.com/vortizhe/vscode-ruby-erb). It's _terribly_ maintained (last updated: 7 years ago), and I only really use it for the `ctrl + shift + ,` shortcut to insert and cycle through ERB tags (`<%%> --> <%=%> --> <%#%>`). It does also have some basic helpers for `if/else` blocks, `link_to` etc. which I _occasionally_ use (full list [here](https://github.com/vortizhe/vscode-ruby-erb/blob/master/snippets/erb.json)).

The other ERB extension I use is [ERB Formatter/Beautify](https://github.com/aliariff/vscode-erb-beautify); it's a formatter for `.erb` template files (duh!). It works pretty well, although I prefer how [Rufo](https://github.com/jnbt/vscode-rufo) formats Ruby within ERB files so I usually run both across a file.

![Using a snippet from Simple Ruby ERB, then formatting HTML and ERB with the ERB Formatter/Beautify extension](images/blog/vscode-rails-setup/erb-format.gif)

There are a bunch more ERB extensions that you can try out (for things like code snippet suggestions), but I'm pretty happy with these two and find them to be enough.

> Ruby Linter & Formatter extensions:
>
> - [ERB Formatter/Beautify (VS Code Extension Marketplace)](https://marketplace.visualstudio.com/items?itemName=aliariff.vscode-erb-beautify)
> - [Simple Ruby ERB (VS Code Extension Marketplace)](https://marketplace.visualstudio.com/items?itemName=vortizhe.simple-ruby-erb)

## Conclusion

That's it! I try to keep my set of VS Code extensions pretty lightweight, but I'm sure there are a bunch more great ones out there.

I hope my [Ruby on Rails VS Code extension pack](https://marketplace.visualstudio.com/items?itemName=RailsNotes.railsnotes-ruby-on-rails-extension-pack) is handy to you! I think it's a great way to get VS Code installed with a solid baseline set of extensions to cover all your bases.
