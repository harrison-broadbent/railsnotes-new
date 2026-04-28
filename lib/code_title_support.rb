# Kramdown converter extension: ~~~rb:Gemfile renders a title header above the code block
module CodeTitleSupport
  ICONS_DIR = File.expand_path("language_icons", __dir__)

  def self.icon_for(lang)
    path = File.join(ICONS_DIR, "#{lang}.svg")
    File.exist?(path) ? File.read(path).strip : ""
  end

  def convert_codeblock(el, indent)
    lang = el.options[:lang] || ""
    title = ""

    if lang.include?(":")
      actual_lang, code_block_title = lang.split(":", 2)

      el.options[:lang] = actual_lang
      el.attr["class"] = "language-#{actual_lang}" if el.attr["class"]
      icon = CodeTitleSupport.icon_for(actual_lang)
      title = "<div class='code-title'>#{icon}#{code_block_title}</div>"
    end

    title + super
  end
end
