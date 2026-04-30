---
title: A simple Stimulus Tabs Controller
date: "2023-08-24"
tags: ["stimulus"]
draft: false
description: In this article, I share a handy Stimulus controller for adding tabs to your Rails apps. I also show you a different variation of the controller, and how to add it to your views. Plus, I've included a handy tip to avoid the annoying "flashing in" effect that can happen if you're not careful.
images: ["images/blog/simple-stimulus-tabs-controller/cover.png"]
---

> If you're after a Stimulus controller to handle tabs in your Ruby on Rails app, look no further. This controller handles toggling between multiple tabs, choosing a default tab, and adding CSS classes to the corresponding button.
>
> Here's the `tabs_controller` in action —
>
> ![Our Stimulus tabs controller in action, ready to sprinkle into your Ruby on Rails app.](images/blog/simple-stimulus-tabs-controller/tabs-code.gif)

This is a short article! I figure that you're probably on a mission right now to add tabs to your Ruby on Rails app, and are searching around for a Stimulus controller to help you.

Lucky for you, **this tabs controller works great.** I've been using it over at [RailsNotes UI](https://railsnotesui.xyz), like in the GIF above, and it's been very solid.

**Handy tip — Set all your non-default tabs to be hidden!** This removes the ugly "flashing in" effect that comes from your Stimulus controller taking a second to load. If your tabs aren't hidden by default, they'll first render, and then a second later get hidden by the `tabs_controller`. The TailwindCSS `hidden` class makes hiding your inactive tabs easy.

**With that said, here's the code! I hope you find it useful.** Further down, I also show you how to tweak the basic tabs controller to allow hiding all tabs, plus walk you through all the different `data` attributes you need to set in your views.

> If you're interested, I've also written about building a Stimulus toggle controller — [Your first Stimulus Controller — Learn Stimulus in Ruby on Rails by building a toggle.](/blog/your-first-stimulus-controller-learn-stimulus-ruby-on-rails-by-building-a-toggle-beginners-guide)

## The Stimulus controller — `tabs_controller.js`

The tabs code is just below, but to start with, you need to generate the controller. Do this by running —

```sh:Terminal
rails g stimulus tabs
```

This uses the Rails generator for Stimulus controllers (you can learn more by typing `rails g stimulus`). It creates a `tabs_controller.js` inside `app/javascript/controllers`, which is perfect.

And now for the tabs controller! I've added a few comments, but it's pretty straightforward. When our tabs controller `connects()`, we hide all tabs, then open the default one and style it's corresponding button correctly.

When we switch tabs and trigger the `select()` method, we do the same thing — hiding everything, then showing the selected tab and style it's button.

```js:tabs_controller.js
// app/javascript/controllers/tabs_controller.js
import {Controller} from "@hotwired/stimulus"

// Connects to data-controller="tabs"
//
export default class extends Controller {
    static classes = ['active']
    static targets = ["btn", "tab"]
    static values = {defaultTab: String}

    connect() {
        // first, hide all tabs
        this.tabTargets.map(x => x.hidden = true)

        // then, show the default tab
        let selectedTab = this.tabTargets.find(element => element.id === this.defaultTabValue)
        selectedTab.hidden = false

        // and activate the selected button
        let selectedBtn = this.btnTargets.find(element => element.id === this.defaultTabValue)
        selectedBtn.classList.add(...this.activeClasses)
    }

    // switch between tabs
    // add to your buttons: data-action="click->tabs#select"
    select(event) {
        // find tab matching (with same id as) the clicked btn
        let selectedTab = this.tabTargets.find(element => element.id === event.currentTarget.id)
        if (selectedTab.hidden) {
            // hide everything
            this.tabTargets.map(x => x.hidden = true) // hide all tabs
            this.btnTargets.map(x => x.classList.remove(...this.activeClasses)) // deactive all btns

            // then show selected
            selectedTab.hidden = false // show current tab
            event.currentTarget.classList.add(...this.activeClasses) // activate current button
        }
    }
}
```

> Thank you to /u/isometriks on Reddit for helping me improve this controller!

## Editing `tabs_controller.js` to allow closing all tabs

In the `tabs_controller` above, we only show/hide a tab if it's `hidden` — you can see that in the `select()` event, where we have the `if (selectedTab.hidden)` condition.

We can edit our tabs controller to allow us to close all our tabs and just show... nothing.

We just need to add a few lines to our `tabs_controller.js`, like this —

```js:tabs_controller.js {15-21}
  // switch between tabs
  // add to your buttons: data-action="click->tabs#select"
select(event) {
    // find tab matching (with same id as) the clicked btn
    let selectedTab = this.tabTargets.find(element => element.id === event.currentTarget.id)
    if (selectedTab.hidden) {
        // hide everything
        this.tabTargets.map(x => x.hidden = true) // hide all tabs
        this.btnTargets.map(x => x.classList.remove(...this.activeClasses)) // deactive all btns

        // then show selected
        selectedTab.hidden = false // show current tab
        event.currentTarget.classList.add(...this.activeClasses) // activate current button
    }
    // the code below enables showing no tabs
    // clicking on an active tab will close it, hiding everything
    else {
        // Hide all tabs, deactivate all buttons
        this.tabTargets.map(x => x.hidden = true)
        this.btnTargets.map(x => x.classList.remove(...this.activeClasses)) // deactive all btns
    }
}
```

## Connecting the `tabs_controller` to your HTML

Here's a simple, cut-back example of the `tabs_controller` in action. I pulled this out of the main [RailsNotes UI](https://railsnotesui.xyz) app.

You can see that we have two tabs, `tab1` and `tab2`. We set `tab1` as the default tab value, which corresponds to the `<div>` with `id=tab1`. The `<button>` which switches to `tab1` has a matching ID.

Since `tab1` is the default tab value, we set `tab2` to be `hidden` (using TailwindCSS). This prevents the "flashing in" effect I mentioned earlier.

```html:tabs.html
<div
  data-controller="tabs"
  data-tabs-active-class="bg-stone-900 text-stone-100"
  data-tabs-default-tab-value="tab1"
>
  <!-- buttons to toggle between tabs -->
  <div class="flex">
    <button id="tab1" data-tabs-target="btn" data-action="click->tabs#select">Tab1</button>
    <button id="tab2" data-tabs-target="btn" data-action="click->tabs#select">Tab2</button>
  </div>

  <!-- the tabs -->
  <div class="rounded-lg border">
    <div data-tabs-target="tab" id="tab1">
      <%= @tab1 content %>
    </div>

    <!-- tab 2 is hidden by default, to prevent 'flashing in' -->
    <div data-tabs-target="tab" id="tab2" class='hidden'>
      <%= @tab2 content %>
    </div>
  </div>
</div>
```

> Note: A few people have let me know that having duplicate id's in your HTML goes against best practice. All I can say is that I've been using this controller in production, and it's working great. Just a heads up.

## Resources

> https://blog.corsego.com/stimulusjs-tabs — this is where I derived the controller from. I've made some small edits, but this is the original version. Kudos to the author, Yaroslav Shmarov, for a handy controller.
