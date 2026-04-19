document.addEventListener("DOMContentLoaded", function () {
  var footnotes = document.querySelector(".footnotes");
  var prose = document.getElementById("prose-content");
  if (!footnotes || !prose) return;

  // prose.style.position = "relative";

  footnotes.querySelectorAll("li").forEach(function (li) {
    var idx = li.id.replace("fn:", "");
    var ref = prose.querySelector('a.footnote[href="#fn:' + idx + '"]');
    if (!ref) return;

    var note = document.createElement("div");
    note.className = "sidenote";
    note.innerText =
      idx +
      ": " +
      li.innerText.replaceAll('↩', "")
    // li.innerHTML.replace(/<a[^>]*reversefootnote[^>]*>.*?<\/a>/g, "");

    var top = ref.getBoundingClientRect().top - prose.getBoundingClientRect().top;
    note.style.setProperty("--footnote-top", top + "px");

    var parent = ref.closest("p") || ref.closest("li");
    if (parent) parent.after(note);
  });

  footnotes.style.display = "none";
});
