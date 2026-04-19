require "active_support/core_ext/integer/inflections"

module DateHelpers
  def format_date(date_string)
    d = Date.parse(date_string)

    "#{d.day.ordinalize} #{d.strftime("%B, %Y")}"
  end
end
