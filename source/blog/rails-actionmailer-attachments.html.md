---
title: ActionMailer attachments in Ruby on Rails
date: "2023-10-28"
tags: ["actionmailer"]
draft: false
description: ActionMailer makes it easy to attach files to your emails. In this article, I show you how to attach single or multiple files, set custom encodings and mime_types, and attach images as inline attachments to display in your email body.
images: ["images/blog/rails-actionmailer-attachments/cover.png"]
canonicalUrl: "https://railsnotesui.xyz/blog/rails-actionmailer-attachments"
---

> ActionMailer makes it easy to attach files to your emails. In this article, I show you how to attach single or multiple files, set custom encodings and `mime_types`, and attach images as inline attachments to display in your email body.
>
> This post was originally published on the [RailsNotes UI Blog.](https://railsnotesui.xyz/blog/rails-actionmailer-attachments)

If you use ActionMailer to send a lot of emails, at some point, you'll probably want to attach files to them. You might want to send a `.pdf` invoice to a customer, or attach custom images inline inside a newsletter email.

**Fortunately, ActionMailer makes attaching files really easy!**

**In this article, I'll show you how to send emails with attachments using ActionMailer.** We'll cover a few examples, including —

- attaching a `.pdf` file to an email,
- attaching multiple files,
- adding inline attachments for things like images,
- and specifying custom encodings for your attachments.

Let's go!

## Basic File Attachments

ActionMailer makes it easy to attach files. Each mailer method has access to an `attachments` hash, which stores attachments and automatically includes them in your emails.

You assign attachments directly to `attachments`, specifying the file name and content.

To attach a single file (for example, a PDF invoice file) we can write something like this —

```ruby:app/mailers/invoice_mailer.rb
class InvoiceMailer < ActionMailer::Base
  def send_invoice(invoice)
    # attach a file to our email
    # should reference a binary blob, like from File.read
    attachments['invoice.pdf'] = File.read('path/to/invoice.pdf')

    mail(to: invoice.customer.email, subject: 'Your Invoice')
  end
end
```

In the code above, we read a PDF file from the disk and assign it to the `attachments` hash. When we send our email, ActionMailer will attach the file, and call it `invoice.pdf` (the name we specified).

When the `#mail` method inside `InvoiceMailer#send_invoice` is triggered, a multipart email with an attachment is sent. ActionMailer will automatically guess the `mime_type` for the file and set the `encoding`, plus handle attaching the file.

> For more info, you can read the [official Ruby on Rails/ActionMailer docs](https://guides.rubyonrails.org/action_mailer_basics.html#complete-list-of-action-mailer-methods).

## Attaching multiple files

ActionMailer also supports attaching _multiple_ files to your emails, in a very similar way to the above. We just need to assign multiple values to the `attachments` hash, and then ActionMailer will automatically attach them —

```ruby:app/mailers/invoice_mailer.rb
class InvoiceMailer < ActionMailer::Base
  def send_invoice(invoice)
    attachments['invoice.pdf'] = File.read('path/to/invoice.pdf')
    attachments['receipt.pdf'] = File.read('path/to/receipt.pdf')
    attachments['refund-policy.pdf'] = File.read('path/to/refund-policy.pdf')

    mail(to: invoice.customer.email, subject: 'Your Invoice')
  end
end
```

There is no limit to the number of files you can attach, but you will need to keep in mind [email attachment size limits](https://www.google.com/search?q=email+attachment+limit). For Gmail, there's a 25MB total file size limit across all attachments.

## Setting custom encodings for attachments

By default, ActionMailer will `Base64` encode your files. If the default encoding doesn't suit your needs though, you can encode your content differently. Pass the encoded content and encoding to the `attachments` hash, like so:

```ruby:mailer.rb
encoded_content = SpecialEncode(File.read('/path/to/filename.jpg'))
attachments['filename.jpg'] = {
  mime_type: 'application/gzip',
  encoding: 'SpecialEncoding',
  content: encoded_content
}
```

By specifying an encoding, ActionMailer will assume that your content is already encoded and won't attempt to Base64 encode it.

## Inline Attachments

Rails and ActionMailer also support _inline attachments_ — inline attachments are files to be displayed in the body of your email, typically images or videos.

To create an inline attachment, call `#inline` on the `attachments` hash within your mailer —

```ruby:welcome_mailer.rb
def welcome
  attachments.inline['image.jpg'] = File.read('/path/to/image.jpg')
end
```

Then in your mailer view, reference `attachments` as a hash, specify the attachment you want to show, and pass the result to the `image_tag` method:

```erb:welcome.html.erb
<p>Hello there, this is our image</p>
<%= image_tag attachments['image.jpg'].url, alt: 'My Photo', class: 'photos' %>
```

## Conclusion

ActionMailer in Ruby on Rails makes it easy to send emails with attachments, whether it's attaching single or multiple files or inline attachments.

You can also check out the [official ActionMailer docs](https://guides.rubyonrails.org/action_mailer_basics.html#complete-list-of-action-mailer-methods) for more information.

If you use ActionMailer a lot to send emails in your Ruby on Rails apps, you'll also probably love [RailsNotes UI, a collection of email templates and components for ActionMailer.](https://railsnotesui.xyz)
