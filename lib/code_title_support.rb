# Kramdown converter extension: ~~~rb:Gemfile renders a title header above the code block
module CodeTitleSupport
  def convert_codeblock(el, indent)
    lang = el.options[:lang] || ""
    title = ""

    if lang.include?(":")
      actual_lang, code_block_title = lang.split(":", 2)

      el.options[:lang] = actual_lang
      el.attr["class"] = "language-#{actual_lang}" if el.attr["class"]
      title = "<div class='code-title'>#{code_block_title}</div>"
    end

    title + super
  end
end
