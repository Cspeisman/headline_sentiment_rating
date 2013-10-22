require 'wayback'
# require 'open-uri'
require 'nokogiri'
require_relative "black_list_helper.rb"

@first_time = true
@check_array = []
@black_list = []

def parse_page(raw_html)
  page = Nokogiri::HTML(raw_html)

  @cleaned_headlines =[]

  # check_tags(page)

  parse (page.css("h1 a"))
  parse (page.css("h2 a"))
  parse (page.css("h3 a"))
  parse (page.css("h4 a"))
  parse (page.css("a"))
  # parse (page.css("h2 a"))
  find_dups()

  @cleaned_headlines

end


def parse(a_tags)
  # h_one = page.css("h1 a")
  # nokogiri_a
  return if a_tags.length <= 0

  span_tags = a_tags.css("span")
  p_tags =  a_tags.css("p")

  if !(span_tags.empty?)
    clean_data(span_tags)
  # elsif !(p_tags.empty?)
  #   clean_data(p_tags)
  end

  clean_data(a_tags)

  @cleaned_headlines if @cleaned_headlines.length > 0


  # p array_text = grab_text(nokogiri_a)
end

def clean_data(tags)
  array = []
  tags.each do |tag|
    cleaned_tag = tag.text.gsub("\n"," ").strip
    next if cleaned_tag.length < 15
    next if @black_list.include?(cleaned_tag)
    next if @cleaned_headlines.include?(cleaned_tag)
    next if cleaned_tag.include?("AP Photo")
    next if cleaned_tag.include?("http")
    next if cleaned_tag.include?("//")

    return array if @cleaned_headlines.length >= 20
    @cleaned_headlines << cleaned_tag
  end
  # array
end


def find_dups()
    dups = @check_array & @cleaned_headlines
    @cleaned_headlines.each {|headline| @check_array << headline}
    add_to_black_list(dups)
    dups.each { |headline| @black_list << headline } unless !dups
    dups.each {|headline| @check_array.delete(headline)}
end

