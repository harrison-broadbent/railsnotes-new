---
title: ""
date: "2023-06-25"
tags: [""]
draft: true
description: ""
images: ["images/blog/cover.png"]
---

> [insert tagline here]

## live search

generate sample app or come from hotwire

- use the example 'hello' controller just to test

change `application.debug = false` to be true and see in console -

```js
controller.ts:20 application #starting
controller.ts:20 application #start
controller.ts:20 hello #initialize
controller.ts:20 hello #connect
```

rails g stimulus search

change to `<div data-controller="search">`

adjust connected method to log to console

`search controller connected`

## set up our references

```
<div data-controller="search">
  <h1 class="font-bold text-4xl">Posts#index</h1>
  <p>Find me in app/views/posts/index.html.erb</p>

  <input
    data-action="search#update"
    class="w-full border" placeholder="search..." />

  <%= turbo_stream_from :posts %>
  <div data-target="search.content" id="posts">
    <%= render @posts %>
  </div>
</div>

```

and add the target into the searchController.
this will let the search controller reference the element

## make it trigger and just log to console

## create our update method

have to start writing custom js here

in our case, get the text content then filter the nodelist

we can do this -
console.log(this.queryTargets) -> [array]

or this -
console.log(this.queryTarget) -> singular

## make it trigger

https://stimulus.hotwired.dev/reference/actions

shorthands -

```
The full set of these shorthand pairs is as follows:

Element Default Event
a       click
button  click
details toggle
form    submit
input   input
input type=submit       click
select  change
textarea        input
```

so we can just write - `<input data-action="search#update" class="w-full border" placeholder="search..." />`

```html
<div>
  <h1 class="text-4xl font-bold">Posts#index</h1>
  <p>Find me in app/views/posts/index.html.erb</p>

  <input class="w-full border" placeholder="search..." />

  <%= turbo_stream_from :posts %>
  <div id="posts"><%= render @posts %></div>
</div>
```

need 3 things -

- targets
- event
- controller

`data-controller="search"`

dont do this -
data-target="search.query"

do this -
data-search-target="query"

## toggles
