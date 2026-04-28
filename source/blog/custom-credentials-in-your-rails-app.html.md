---
title: Replace .env with Rails Credentials in your Ruby on Rails app
date: 2023-05-14 07:49
description: A deep dive into the basics of Rails credentials, explore their benefits and drawbacks, and showing you how easy it is to integrate this powerful tool into your Rails app development process...
images: ["/static/images/custom-credentials-in-your-rails-app/cover.png"]
tags: ["credentials"]
---

> Did you know that Rails has a built-in credentials manager that you can use instead of `.env` variables?

Traditionally, developers have relied on `.env` files to store and manage sensitive information. If you've ever worked in software professionally, or built a substantial hobby project, I'm sure you're very familiar (even a bit too familiar...) with `ENV` variables.

Something you might not have realized though, is that Rails comes with a a powerful built-in tool that makes managing environment variables even easier — `Rails.application.credentials`.

In this article, we're going to dive into the basics of Rails credentials, explore the benefits and drawbacks of this approach, and demonstrate how easy it is to integrate this powerful tool into your Rails app development process.

Rails Credentials are explained a little bit in the [official Rails security guide](https://edgeguides.rubyonrails.org/security.html#environmental-security), but it's not very clear. I've included some examples that will make it really easy for you to start adding and editing your credentials.

We'll look at adding credentials with `EDITOR="nano" rails credentials:edit`, and using them in our app with `Rails.application.credentials.key[value]`. It's even possible to create different sets of keys for different environments (`dev, staging, production`).

## What are Rails Credentials?

Rails credentials are built-in encrypted configuration storage introduced in `Rails 5.2`, specifically designed to manage sensitive information in your application, such as API keys, security tokens, and other secrets that you don't want to expose in your version control system.

Rails comes pre-configured to encrypt and decrypt these credentials securely using the `master.key` file, _which should never be committed to your repository_.

## Adding Credentials via the Terminal

To start using Rails credentials in your Rails app, the first thing you need to do is open the credentials editor.

You can do this by running the command:

```sh
$ EDITOR="nano" rails credentials:edit # nano
```

This command will create a new credentials file (`config/credentials.yml.enc`) and the `master.key` file if they don't exist.

You can replace `nano` with other text editors like `vim` or `code`. For example, you can do -

```sh
EDITOR="code --wait" bin/rails credentials:edit # vscode
```

or

```sh
EDITOR="vim" bin/rails credentials:edit # vim
```

> If you're interested, I've written more deeply about [editing Rails credentials using VS Code](https://railsnotes.xyz/blog/rails-credentials-vscode-edit), which included sharing a handy script to avoid typing `EDITOR=` all the time.

Now, you can add your credentials to the editor. You might end up with something like —

```yaml
aws:
  access_key_id: 123
  secret_access_key: 345

google_oauth2:
  client_id: g_client_id_2881
  client_secret: GOC-12345

sendgrid:
  api_key: SG.abc12345
```

Save and close the editor. The new credentials are now encrypted and saved in the `config/credentials.yml.enc` file.

## Using Credentials in your Rails App

To use the credentials in your Rails app, access them using `Rails.application.credentials`. For example:

```ruby
# initialize some AWS config
Aws.config.update({
  access_key_id: Rails.application.credentials.aws[:access_key_id],
  secret_access_key: Rails.application.credentials.aws[:secret_access_key]
})


# Use SendGrid with ActionMailer
ActionMailer::Base.smtp_settings = {
  user_name: 'apikey',
  password: Rails.application.credentials.sendgrid[:api_key],
}
```

Rails Credentials are really useful in lots of different scenarios. For example, I use them in this article about [using ActionMailer for emails](/blog/refactoring-a-ruby-on-rails-app-to-use-actionmailer-for-transactional-email), where the last example from above is from.

They're also handy for avoiding fiddling with ENV when you're [deploying a Rails app to a cloud host.](/blog/deploying-ruby-on-rails-on-render-with-databse-redis-sidekiq-cron)

## Using different credentials for different environments

As of `Rails 6`, we can break our credentials up into different environment groups, which are automatically loaded depending on the environment (dev, testing, production) we are in.

All we need to do is pass the `--environment` flag like so -

```ruby
rails credentials:edit --environment production
```

and Rails will create a new `production.key` and `production.yml.enc` for us inside `config/credentials`.

Rails will automatically detect which set of keys to use based on the current `RAILS_ENV` environment variable value -

```sh
RAILS_ENV=development rails c
> Rails.application.credentials.config # the original credentials

RAILS_ENV=production rails c
> Rails.application.credentials.config # the production credentials
```

Rails will default to the original credentials if it can't find an environment-specific set.

## Benefits of Using Rails Credentials

Using Rails credentials has several advantages over traditional `.env` files:

- **Security**: With Rails credentials, sensitive data is encrypted by default, which reduces the risk of accidental exposure.
- **Centralized management**: All secrets are stored in a single place, making it easier to maintain and manage.
- **Integration with Rails**: It's a built-in feature, meaning it's well maintained and designed to work seamlessly with the Rails framework.

## Drawbacks of Using Rails Credentials

While Rails credentials provide numerous advantages, there are a few drawbacks worth considering:

- **Initial Learning Curve**: Developers familiar with .env files may initially find Rails credentials to be a new concept to learn and implement.
- **Limited to Rails 5.2 and above**: Rails credentials aren't available in Rails versions below 5.2, limiting their use for developers working on older applications.

## Conclusion

The `Rails.application.credentials` approach offers an elegant and secure way to manage environment variables in your Rails app.

By harnessing the power of encrypted credentials storage, it simplifies your development and deployment process without sacrificing security.

If you haven't tried Rails credentials yet, now may be the perfect time to give it a shot and unleash its potential in your Rails app development process.
