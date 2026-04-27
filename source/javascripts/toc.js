document.addEventListener("DOMContentLoaded", function () {
  var tocContainer = document.getElementById("toc");
  if (!tocContainer) return;

  var prose = document.getElementById("prose-content");
  var headings = prose.querySelectorAll("h2, h3");
  if (headings.length === 0) {
    tocContainer.style.display = "none";
    return;
  }

  var list = document.createElement("ul");
  list.className = "space-y-1.5";

  headings.forEach(function (heading) {
    if (!heading.id) {
      heading.id = heading.textContent
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#" + heading.id;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById(this.getAttribute("data-target")).scrollIntoView({
        behavior: "smooth",
      });
    });
    a.textContent = heading.textContent;
    a.className =
      "toc-link font-sans block text-[13px] no-underline transition-colors duration-150 text-stone-400 hover:text-stone-600";
    a.setAttribute("data-target", heading.id);

    if (heading.tagName === "H3") {
      li.className = "pl-1.5";
    }

    li.appendChild(a);
    list.appendChild(li);
  });

  tocContainer.appendChild(list);

  var links = tocContainer.querySelectorAll(".toc-link");

  function updateActive() {
    var current = null;

    for (var i = 0; i < headings.length; i++) {
      if (headings[i].getBoundingClientRect().top <= 260) {
        current = headings[i].id;
      }
    }

    links.forEach(function (link) {
      if (link.getAttribute("data-target") === current) {
        link.classList.remove("text-stone-400");
        link.classList.add("text-stone-700");
      } else {
        link.classList.remove("text-stone-700");
        link.classList.add("text-stone-400");
      }
    });
  }

  window.addEventListener("scroll", updateActive, { passive: true });
  updateActive();
});
