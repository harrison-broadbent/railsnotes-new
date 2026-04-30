---
title: Edit Rails Credentials using VS Code
date: "2024-01-04"
tags: ["credentials", "vscode"]
draft: false
description: This short guide shows you how to use VS Code to edit secrets in your Ruby on Rails app when you run `rails credentials:edit`. I also include a handy `bin/credentials:edit` script to simplify things.
images: ["images/blog/rails-credentials-vscode-edit/cover.png"]
---

> This is a quick guide showing you how to use VS Code to edit [secrets in your Rails apps](https://railsnotes.xyz/blog/custom-credentials-in-your-rails-app) when you run `rails credentials:edit`. By default, Rails will use the `$EDITOR` environment variable, which is typically `vi` or `nano`; Luckily, It's easy to change, and I've included a handy script to streamline the process!

I use [Rails credentials](https://edgeguides.rubyonrails.org/security.html#custom-credentials) a lot! They're a handy, native alternative to storing environment variables in a `.env` file, and I've previously written about [switching from environment variables to Rails credentials](https://railsnotes.xyz/blog/custom-credentials-in-your-rails-app).

One small thing that annoys me though is the default editor. A lot of Ruby on Rails developers use VS Code, but `rails credentials:edit` will use the `$EDITOR` environment variable to edit your secrets. This is typically `vi` or `nano`, both of which can be a bit cumbersome.

To help, I wrote this short article. I'll show you how to use VS Code to edit your Rails credentials instead. I also share a handy script, `bin/credentials:edit`, which runs `rails credentials:edit` with a default editor exported. Let's go!

## Use VS Code to edit Rails Credentials

To edit your Rails credentials using VS Code, you want this command —

```sh:Terminal
EDITOR="code --wait" rails credentials:edit
```

_"So Harrison"_, I hear you ask, _"...what does this command do?"_

Since `rails credentials:edit` looks at the `$EDITOR` variable, we set it to `code --wait`. This instructs our command to use VS Code to edit our secrets.

> Note: If you leave off the `--wait` flag, VS Code will launch, but the `credentials:edit` command won't wait for you to make your edits, so editing your credentials won't work.

Then we run the actual `rails credentials:edit` command. **Because we've exported the correct `$EDITOR` value, this command will launch VS Code**, open the credentials file for you to edit, and wait until you save and close the file again. The `rails credentials:edit` command will hang until you've closed the file in VS Code.

If all goes well, VS Code should launch and let you edit your secrets, like so —

![Editing our Rails secrets using VS Code when we run rails credentials:edit](images/blog/rails-credentials-vscode-edit/edit.gif)

This is how I typically edit secrets in my Ruby on Rails apps. **I rely on the history search function of my terminal (`ctrl + r`) to run the command;** I'll start typing `EDITOR`, and hit enter on the suggestion for the full command, which works well enough.

Lately though, I've been experimenting with wrapping this command up as a little script, which I've shared below.

> Note: Of course, you could also export `code --wait` as the default value for `$EDITOR` in your `.bashrc` or `.zshrc`. I prefer to use `nano` for most things, so the command above sets it inline.

## Handy script with a default $EDITOR exported

Recently I've been adding this tiny script to my Ruby on Rails apps; It wraps the command from above and saves you having to search your terminal history to find it again.

Here's the script —

```sh:bin/credentials:edit
#!/bin/bash
# handy script to run `rails credentials:edit` with EDITOR exported.

export EDITOR="code --wait"

bin/rails credentials:edit $@
```

> The `$@` symbol in the script above is crucial!
>
> Any arguments you pass the `credentials:edit` command come through in the `$@` symbol. For instance, if you run`bin/credentials:edit --environment=development` to specify environment-level credentials, `--environment=development` will get passed through as `$@`, and the command will work as you'd expect.

You'll need to create the file and make it executable as well; The full commands for doing that are —

```sh:Terminal
# 1. create the file
touch bin/credentials:edit

# 2. edit the file and add the script contents
nano bin/credentials:edit # use whatever editor you like

# 3. make the script executable
chmod +x bin/credentials:edit

# 4. run it!
bin/credentials:edit
```

Enjoy! You can change the name of the script to whatever you want, but I think `bin/credentials:edit` makes a lot of sense, since it mirrors the `rails credentials:edit` command.

## Conclusion

Thanks for reading! I hope you found this quick article helpful. I prefer using VS Code to edit my Rails credentials; I find it easier to copy and paste things around in VS Code compared to `nano`, and it's easier to get the correct YAML formatting.
