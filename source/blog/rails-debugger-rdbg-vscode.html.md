---
title: Using Rails debugger/rdbg with VS Code
date: "2024-03-12"
tags: ["vscode", "development", "debugger"]
draft: false
description: A short introduction to the rdbg/debugger extension for VS Code, plus a guide on how to set it up correctly to debug your Ruby on Rails applications, as well as your RSpec specs. The VS Code extension takes 5 minutes to setup and it's great!
images: ["images/blog/rails-debugger-rdbg-vscode/cover.png"]
---

> In this article, I show you how to use VS Code's "Run and Debug" panel to connect directly to a `debugger` instance, using the [VSCode rdbg Ruby Debugger extension](https://marketplace.visualstudio.com/items?itemName=KoichiSasada.vscode-rdbg).
>
> We're lucky in the Ruby on Rails world to have the [powerful debug gem](https://github.com/ruby/debug) available, and it becomes even more handy when it's integrated directly into VS Code, where you can take advantage of breakpoints, automatically debugging Exceptions and more.

Until recently, I was dropping `debugger` statements in my code and interacting with them via the terminal (like a filthy peasant 😭).

That was starting to irk me! Particularly at work, I found that with both a `sidekiq:` and `web:` process running locally, it was tricky to debug properly since I'd have a bunch of `sidekiq:` logs flying by while I was trying to investigate the `web:` process.

What if there was a better way? A way to connect directly to a `debugger` from within VS Code? Luckily, there is! **Enter the [VSCode rdbg Ruby Debugger extension](https://marketplace.visualstudio.com/items?itemName=KoichiSasada.vscode-rdbg) — it's great and surprisingly easy to set up.**

**By the end of this article, you're going to have that extension installed and connecting directly to `debugger` instances in your Ruby on Rails code _within_ VS Code. I'll also show you how to use the rdbg VS Code extension to debug RSpec specs. Let's dive in!**

## Setting up VS Code rdbg

I'm assuming you've already got the Ruby [debug](https://github.com/ruby/debug) gem available (Rails includes it by default). It's what lets you drop `debugger` or `binding.break` statements in your code.

To get up and running, you just need to tweak your Rails app to expose `debugger` ports and configure VS Code to use the `rdbg` extension.

Just follow these steps to get set up —

1. **Start by exporting `RUBY_DEBUG_OPEN=true` as an environment variable.** I do this within my `Procfile.dev` like:

```sh:Procfile.dev
web: RUBY_DEBUG_OPEN=true bin/rails server -p 3000
sidekiq: RUBY_DEBUG_OPEN=true bundle exec sidekiq
...
```

> Note: I've exported that environment variable twice, for the `web:` and `sidekiq:` processes. This is so you can connect to instances of a `debugger` regardless of whether it's the `web:` or `sidekiq:` process that triggers it. You could also just export this globally from a `.env` file.
>
> I've also written extensively about [bin/dev and the Procfile.dev](https://railsnotes.xyz/blog/procfile-bin-dev-rails7) if you're interested.

Exporting this environment variable means that when you drop `debugger` lines in your code, rather than launching an interactive session, you'll see `DEBUGGER: wait for debugger connection...`; We'll set up `rdbg` within VS Code to connect to this.
At the start of the `web:` process log you'll also see:

```sh:Terminal
web | DEBUGGER: Debugger can attach via UNIX domain socket (/.../rdbg-72149)
```

2. **Install the [VSCode rdbg Ruby Debugger extension](https://marketplace.visualstudio.com/items?itemName=KoichiSasada.vscode-rdbg).** This extension provides the adapter between VS Code and `rdbg/debugger`.

You can just install this extension directly, but it's also available in my [Ruby on Rails VS Code extension pack](https://marketplace.visualstudio.com/items?itemName=RailsNotes.railsnotes-ruby-on-rails-extension-pack) from my [Ruby on Rails / VS Code setup guide](https://railsnotes.xyz/blog/vscode-rails-setup).

3. **Open the "Run and Debug" menu from within VS Code (⬆⌘D on MacOS).** Next, click _"create a launch.json file."_ (it's just text and not very obvious!) and select `Ruby (rdbg)`. This will create a `launch.json` file for the extension like this:

```json:launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "rdbg",
      "name": "Debug current file with rdbg",
      "request": "launch",
      "script": "${file}",
      "args": [],
      "askParameters": true
    },
    {
      "type": "rdbg",
      "name": "Attach with rdbg",
      "request": "attach"
    }
  ]
}
```

This JSON file defines two debugging configurations for VS Code. The main one you'll use with Rails is `Attach with rdbg`. This will attach the VS Code "Run and Debug" interface to the open debugger port in your app.

4. **With your Rails app running, adjust the dropdown in the VS Code "Run and Debug" menu so that "Attach with rdbg" is selected, then hit play (`►`).** Select the `rdbg` process to connect to, and a Ruby REPL will open:

```sh:VSCODE_DEBUG_CONSOLE
Ruby REPL: You can run any Ruby expression here.
Note that output to the STDOUT/ERR printed on the TERMINAL.
[experimental]
  `,COMMAND` runs `COMMAND` debug command (ex: `,info`).
  `,help` to list all debug commands.
```

> Note: If you've set `RUBY_DEBUG_OPEN=true` for both your `web:` and `sidekiq:` processes, it can be hard to tell them apart! You can either 1. just connect to both, or 2. double-check the output in your terminal from when the process started, like `...attach via UNIX domain socket (/.../rdbg-72149)`, which tells you which `rdbg` to connect to (in this case, `rdbg-72149`).

5. Within your Rails app, hit the code path to trigger the `debugger`. If everything is set up correctly, the debugging interface within VS Code will connect to your `debugger`, and you'll be able to interact with it from the `DEBUG CONSOLE` panel!

That's it! Now you're connected to a `debugger` directly within VS Code. You get breakpoints, call stacks, and a clean interface to deal with. Below is an example GIF of what it's like to connect to a `debugger` in your Ruby on Rails app, via the `rdbg` VS Code extension &darr;

![Connecting to a running debugger in your Ruby on Rails app, via the `rdbg` VS Code extension.](images/blog/rails-debugger-rdbg-vscode/vscode-rdbg.gif)

In the next section, I've put together a couple of handy tips for interacting with `rdbg` via the VS Code extension.

## Quick tips for working with the VS Code rdbg console

Here's just a rapid-fire grab bag of handy commands and tips I've picked up using `rdbg` from within VS Code —

- All the `rdbg` commands are prefixed with a `,comma`.
- There's a bunch of commands built into `rdbg`, like `,info`, which prints information about the class you're debugging.
- Use `continue` or just `c` to advance the `debugger`.
- Use `info` for a short overview of the class your `debugger` is in,
- Use `ls` for a detailed outline of the current scope, like the available methods and instance variables,
- Use `list` or just `l` to show source code around your `debugger`, like:

```sh:VSCODE_DEBUG_CONSOLE
,list
(rdbg:command) list
    1| class AppController < ApplicationController
    2|   before_action :authenticate_user!
    3|   layout "app"
    4|
    5|   def index
=>   6|     debugger
    7|   end
    8| end
```

- Use `break [line_number]` or just `b [line_number]` to set additional breakpoints from your `debugger` session. This pairs well with the `list/l` command from above, letting you set a breakpoint a few lines ahead of your current session.
- The VS Code "Run and Debug" section also has two checkboxes in the "Breakpoints" panel which let you trigger a `debugger` session on any exception or `RuntimeError` which can be handy to proactively catch things.

## Debugging RSpec specs inside VS Code

It's great to be able to interact with breakpoints in your application, but there's another situation when breakpoints can be handy — inside your specs.

Connecting to a `debugger` within an RSpec spec is super handy for digging into a failing spec (or a passing one that shouldn't be!), but there's no example included in the `launch.json` file for the rdbg extension.

Fortunately, there's an excellent [Github issue](https://github.com/ruby/vscode-rdbg/issues/410#issuecomment-1984045990) with the correct task for your `launch.json` file —

```json:launch.json
{
    "type": "rdbg",
    "name": "RSpec current line with rdbg",
    "request": "launch",
    "useBundler": true,
    "script": "./bin/rspec",
    "args": [
        "${file}:${lineNumber}"
    ],
}
```

> Note: make sure you've got `bin/rspec` available by generating binstubs with `bundle binstubs rspec-core`.

That command will launch the current RSpec spec within VS Code through the "Run and Debug" workflow, and automatically attach to any `debugger` statements that get hit (via the rdbg VS Code extension).

Personally, I find debugging specs in VS Code less useful than debugging breakpoints in a running application (since it's easy to run specs from the terminal and interact with them there) — however, this will mean that you never have to leave VS Code now if that's your thing.

## Conclusion

That's it! Just a short article on connecting the Rails `debugger` (`rdbg`) with VS Code, so that you can use the native "Run and Debug" tooling within VS Code to debug your Ruby on Rails apps.

Make sure to check out my [Ruby on Rails / VS Code setup guide](https://railsnotes.xyz/blog/vscode-rails-setup) for a more general overview of my recommended extensions for using VS Code for Ruby on Rails development.
