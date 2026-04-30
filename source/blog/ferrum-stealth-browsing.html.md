---
title: Stealthly Web Scraping in Ruby with Ferrum
date: "2025-01-21"
tags: ["ferrum", "web-scraping"]
draft: false
description: Learn how to setup Ruby and Ferrum for stealthy web scraping and browsing, including setting up correct headers, proxying requests, rotating your user agents, restricting bandwidth usage and more.
images: ["images/blog/ferrum-stealth-browsing/cover.png"]
---

> In this article, I share all the tips and best-practices I've found for web scraping with Ruby and [Ferrum](https://github.com/rubycdp/ferrum).
>
> I cover _everything_, from setting basic headers to proxying requests, including extra stealth evasions, rotating your user agents and more.

I've been using [Ferrum](https://github.com/rubycdp/ferrum) to do a lot of web-scraping lately, and I wanted to share some tips and best-practices I've ~~stumbled on~~ developed.

Ferrum is a headless browser driver, similar to [Playwright](https://playwright.dev/) and [Puppeteer](https://pptr.dev/), which you can use to automatically visit, interact with, and scrape data from websites from your Ruby on Rails app.
Ferrum has been gaining popularity lately in the Ruby on Rails community for being fast and Ruby-native.

In this article, I share everything I've learned about stealthy scraping with Ferrum — how to avoid basic blocks, preserve bandwidth, rotate user agents and integrate with proxies. I've also included a few sites in [this article's appendix](#appendix-1-sites-to-test-for-bot-detection) to test your bot detection.

Let's dive in.

## Setting up Ferrum, browser headers, hide "AutomationControlled"

After installing Ferrum with `bundle add ferrum`, you'll need to set it up.

Here's a basic configuration which already incorporates a few tweaks:

```ruby:ferrum.rb
# Set "normal" looking browser headers
headers = {
  "Accept" => "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Encoding" => "gzip, deflate, br, zstd",
  "Accept-Language" => "en-GB,en-US;q=0.9,en;q=0.8",
  "Cache-Control" => "no-cache",
  "Pragma" => "no-cache",
  "Priority" => "u=0, i",
  "Sec-Ch-Ua" => '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  "Sec-Ch-Ua-Mobile" => "?0",
  "Sec-Ch-Ua-Platform" => "\"macOS\"",
  "Sec-Fetch-Dest" => "document",
  "Sec-Fetch-Mode" => "navigate",
  "Sec-Fetch-Site" => "cross-site",
  "Sec-Fetch-User" => "?1",
  "Upgrade-Insecure-Requests" => "1",
  "User-Agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
}

# Hide automation flag and adjust default window size to be less common
opts = {
  headless: "new",
  timeout: 35,
  window_size: [1366, 768],
  browser_options: {
    "disable-blink-features" => "AutomationControlled"
    },
}

browser = Ferrum::Browser.new(opts)
browser.headers.set(headers)
```

> Explore Ferrum's other options on [GitHub](https://github.com/rubycdp/ferrum?tab=readme-ov-file#customization).

We start by setting a bunch of "normal" looking browser headers, which I copied directly from the Chrome Network tab on my Macbook. You should match these headers as closely as possible to the actual hardware you're scraping on (so consider adjusting the User Agent and hints if you use a different version of Chrome, different OS etc.)

Browser headers are the first step to effective web scraping. If you fail to set sensible headers, the websites you're scraping will have no trouble figuring out you're a bot and blocking you. For example, by default Ferrum will include `HeadlessChrome/` in its user agent, clearly identifying your browser as a bot and making it trivial for websites to block you.

Because the `Accept-Encoding` header here includes `br` for Brotli, and `zstd` for Zstandard, you may need to add the following gems to your `Gemfile` to allow Rails to decode the responses:

```ruby:Gemfile.rb
# Ferrum will automatically start using these
gem "brotli"
gem "zstd-ruby"
```

Next let's take a look at `opts`, the hash of initialization options for Ferrum. Some key points to note:

- `headless: "new"` uses Chromes [new headless mode](https://developer.chrome.com/docs/chromium/headless). New headless mode runs Chrome just as if it were running in a window, but without displaying anything. In contrast, [old headless Chrome was an entirely different browser implementation](https://developer.chrome.com/docs/chromium/headless#:~:text=Previously%2C%20Headless%20mode%20was%20a%20separate%2C%20alternate%20browser%20implementation%20that%20happened%20to%20be%20shipped%20as%20part%20of%20the%20same%20Chrome%20binary.).
- `timeout: 35` is configurable and it just used to protect ourselves from pages that don't respond,
- `window_size: [1366, 768]` adjusts our Chrome viewport to be a non-standard value, rather than the default value for most automation libraries (1024x768). This makes Ferrum appear less suspicious and can help evade bot detection,
- `browser_options: {"disable-blink-features" => "AutomationControlled"}` is the **most critical tweak here**. This disables Chrome reporting that it's `AutomationControlled` — leaving this enabled is like screaming to every website you visit _"I'm a bot, please block me!"_.

Finally, we instantiate a `Ferrum::Browser` instance with our options, then set our headers.

You can double-check everything is set correctly with `browser.options` and `browser.headers`, and I also like to visit https://httpbun.com/headers using `browser.goto` and check my headers with `browser.body`.

## Adding the `puppeteer-extra-stealth` plugin

There's a common plugin for Puppeteer called [puppeteer-extra-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth) which helps mask a few other common bot signals, and fortunately, we can use this plugin with Ferrum too.

Ferrum supports passing an array of `extensions` when you instantiate a new browser, which is what we'll do:

1. Download the plugin by running `npx extract-stealth-evasions`, then save the resulting `stealth.min.js` somewhere in your app, like in `lib/web_scraping`.
2. Include `stealth.min.js` into Ferrum with:

```ruby
# include stealth.min.js into Ferrum as an extension
opts = {
  headless: "new",
  ...,
  extensions: [Rails.root.join("lib", "web_scraping", "stealth.min.js")]
}

```

> Thanks to [ttilberg](https://github.com/ttilberg) for sharing this tip in [a GitHub thread](https://github.com/rubycdp/ferrum/issues/142#issuecomment-931905205).

Your Ferrum instance should now pass all the checks on https://bot.sannysoft.com, which is a great start. There's still a lot more to do though!

## Limiting bandwidth waste

By default, Ferrum will load all the resources on each page you visit, but for web scraping, that's typically not necessary.

It can be wise to block most large resources — think images, videos, sounds and fonts — to speed up loading times and save bandwidth (which becomes valuable if you integrate a proxy in the next section, since you typically pay $x/GB for bandwidth).

It's possible to combine `browser.network.intercept` with `browser.on(:request)` to selectively skip loading resources based on their file extension, letting you save bandwidth. Here's an example:

```ruby:ferrum.rb
# Setup from previous steps
opts = { ... }
headers = { ... }
browser = Ferrum::Browser.new(opts)
browser.headers.set(headers)

# Specify which file extensions to block
blocked_images = %w[.jpg .jpeg .png .gif .bmp .svg .webp]
blocked_videos = %w[.mp4 .avi .mov .mkv .webm]
blocked_sounds = %w[.mp3 .ogg .wav .aac .flac]
blocked_fonts  = %w[.woff .woff2 .ttf .otf .eot]
blocked_filetypes = blocked_images + blocked_videos + blocked_sounds + blocked_fonts

# Add triggers to Ferrum to abort requests for the blocked filetypes
browser.network.intercept
browser.on(:request) do |request, index, total|
  if blocked_filetypes.any? { |ext| request.url.end_with?(ext) }
 request.abort
  end
 request.continue
end
```

Blocking these unnecessary requests can lead to some _massive_ bandwidth savings (2-5x or more), particularly if you're scraping resource-heavy websites, like e-commerce sites.

Unfortunately, I've found that blocking `.css` files can trigger anti-bot measures and Cloudflare challenges, so I don't recommend aborting those requests, despite their bandwidth cost.

## Proxying requests

While all the previous tweaks are important, and may be enough for small scraping workloads, once you start scraping more you're going to need some proxies.

No matter how inconspicuous your Ferrum setup is, if you start sending 10,000 requests/hour to a random website, they'll probably hit you with an IP ban. Proxies let you route traffic through different IP addresses to mask that all the traffic originates from you.

I use [Evomi (affiliate)](https://evomi.com?p=3H6IWO7U67) for proxies and I've been pleased. They're the most affordable proxies I could find on the market, [have good reviews](https://proxyway.com/reviews/evomi-review), and the proxies themselves don't get blocked too frequently. Note that the link to Evomi is an affiliate link — I'll receive a commission if you purchase through it, which helps support my blog, but you can visit Evomi [directly](https://evomi.com) if you'd prefer not to.

Most providers offer a few different products — datacenter proxies, residential proxies and mobile proxies — with static and dynamic IP addresses for both.

Web scraping typically uses dynamic IP addresses, but as for which type works best, you'll need to experiment. Datacenter proxies are cheaper but more susceptible to blocks, so I recommend starting with them and moving up to residential proxies if you need.

Regardless of what you choose, you can use a proxy with Ferrum like this:

```ruby:ferrum.rb
opts = { ... }
opts[:proxy] = {
  host: "core-residential.evomi.com",
  port: 1000,
  user: "xxx",
  password: "xxx"
} if Rails.env.production? # only proxy in prod to not waste bandwidth

browser = Ferrum::Browser.new(opts)
```

This will route all your Ferrum requests via your proxy. You may want to limit proxying to certain situations or environments though given you're typically charged for traffic. I check `Rails.env.production?` and use that to determine whether to proxy a request.

## Rotating user agents, user-agent hints

Rotating user agents is the second half of a smooth proxy-based scraping system. Rotating your user agents just means setting a different `"User-Agent"` header on each request. Since your user agent and IP are typically the largest trust signals to a website, adjusting your user agent can reduce your block rate.

> Example: If there are **5 million** IP addresses in your proxy pool and you're making **10,000** requests, the odds of getting a duplicate IP address on one of those requests is `>99.9%`.
>
> Rotating your user agent header means that even if your proxy pool assigns you an IP address you've already used recently, websites will have a harder time linking it back to you, reducing your block rate.

You might do something like this, making use of Ruby's `#sample` method, to pick out a random user agent on each request:

```ruby:ferrum.rb
opts = { ... }
headers = { ... }
user_agents = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
  "Mozilla/5.0 ...",
  "Mozilla/5.0 ...",
  "Mozilla/5.0 ..."
]

user_agent = user_agents.sample
user_agent_hints = ua_hints(user_agent)

headers
  .merge("User-Agent" => user_agent)
  .merge(user_agent_hints)

browser = Ferrum::Browser.new(opts)
browser.headers.set(headers)
```

We `#sample` our array of user agents each time we initialize a `Ferrum::Browser`.

Notice the `user_agent_hints` method — for a given user agent, we need a way to construct the correct [user-agent client hints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-CH-UA). A simple method might look like this:

```ruby:ferrum.rb
def user_agent_hints(user_agent_string)
 chrome_version = user_agent_string.match(/Chrome\/(\d+)\./)[1]

  {
    "Sec-Ch-Ua" => "\"Google Chrome\";v=\"#{chrome_version}\", \"Chromium\";v=\"#{chrome_version}\", \"Not_A Brand\";v=\"24\"",
    "Sec-Ch-Ua-Mobile" => "?0",
    "Sec-Ch-Ua-Platform" => "\"macOS\"",
    "Sec-Fetch-Dest" => "document",
    "Sec-Fetch-Mode" => "navigate",
    "Sec-Fetch-Site" => "cross-site",
    "Sec-Fetch-User" => "?1",
  }
end
```

However this method only works for Chrome user agents on macOS. You'll need to adapt this method to your needs.

## Putting it all together

That was a lot of disparate steps! Here's how I've put them all together in my app.

I've split things in half — there's a method called `#init_ferrum_browser` which is responsible for instantiating a `Ferrum::Browser` instance and a class called `HttpOpts` which handles browser headers.

```ruby:ferrum.rb
# Example:
#   url = "https://httpbun.com/headers"
#   browser = init_ferrum_browser
#   browser.goto(url)
#   browser.screenshot(path: "s1.png", full: true)
#
def init_ferrum_browser
 # setup basic Ferrum options
 opts = HttpOpts.ferrum_options
 headers = HttpOpts.headers
 browser = Ferrum::Browser.new(opts)
 browser.headers.set(headers)

  # Block requests to unnecessary resources
 blocked_images = %w[.jpg .jpeg .png .gif .bmp .svg .webp .avif]
 blocked_videos = %w[.mp4 .avi .mov .mkv .webm]
 blocked_sounds = %w[.mp3 .ogg .wav .aac .flac]
 blocked_fonts = %w[.woff .woff2 .ttf .otf .eot]
 blocked_extensions = blocked_images + blocked_videos + blocked_sounds + blocked_fonts

 browser.network.intercept
 browser.on(:request) do |request|
    if blocked_extensions.any? { |ext| request.url.end_with?(ext) }
      request.abort
    else
      request.continue
    end
  end

 browser
end
```

And here's the `HttpOpts` class which is called from `init_ferrum_browser`:

```ruby:http_opts.rb
class HttpOpts
  USER_AGENTS = ["...", "...", "..."]
  HEADERS = { ... }

  def self.ferrum_options
    options = {
      headless: "new",
      timeout: 35,
      window_size: [1366, 768],
      extensions: [Rails.root.join("lib/scraping/stealth.min.js")],
      browser_options: { "disable-blink-features" => "AutomationControlled" }, # hide automation
    }

    options[:browser_path] = ENV["BROWSER_PATH"] if Rails.env.production? # point Ferrum at browser binary in prod
    options[:proxy] = { host: "core-residential.evomi.com",
                        port: 1000,
                        user: "xxx",
                        password: "xxx" } if Rails.env.production?

    return options
  end

  def self.headers
    user_agent = USER_AGENTS.sample

    HEADERS
      .merge("User-Agent" => user_agent)
      .merge(user_agent_hints(user_agent))
  end

  private

  def self.user_agent_hints(user_agent_string)
    chrome_version = user_agent_string.match(/Chrome\/(\d+)\./)[1]

    {
      "Sec-Ch-Ua" => "\"Google Chrome\";v=\"#{chrome_version}\", \"Chromium\";v=\"#{chrome_version}\", \"Not_A Brand\";v=\"24\"",
      "Sec-Ch-Ua-Mobile" => "?0",
      "Sec-Ch-Ua-Platform" => "\"macOS\"",
      "Sec-Fetch-Dest" => "document",
      "Sec-Fetch-Mode" => "navigate",
      "Sec-Fetch-Site" => "cross-site",
      "Sec-Fetch-User" => "?1",
    }
  end
end
```

You should put `http_opts.rb` somewhere in your Rails app where it will get autoloaded, like in `app/models`.

These two bits of code incorporate all the tweaks I've discussed in this article (you'll still need to download `stealth.min.js`, set up your own proxies etc).

## Conclusion

Thanks for reading, and I hope you found this useful!

Web scraping can feel like black magic at the best of times, but doing it in Ruby with Ferrum makes it even harder — we don't have access to awesome libraries like [undetected-chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver) which apply a lot of patches automatically.

Even with all these patches though, you're going to run into trouble trying to scrape high-security websites. At some point, I think it's worth considering the effort you're investing towards web scraping, vs. using an external scraping service.

There is also the cat-and-mouse game to consider — websites are only going to increase their security. Will you have the time to invest in improving your scraping solution?

You can use the links in the appendix below to test your scraper and any new patches you apply.

### Appendix 1 (Sites to test for bot detection)

- https://httpbun.com/headers,
- https://bot-detector.rebrowser.net/,
- https://bot.sannysoft.com/,
- https://deviceandbrowserinfo.com/are_you_a_bot,
- https://abrahamjuliot.github.io/creepjs/,
- https://pixelscan.net/,
- https://www.browserscan.net,
