module Jekyll
  class RequireTag < Liquid::Tag

    def initialize(tag_name, filename, tokens)
      super
      @filename = filename.strip
    end

    def render(context)
      context.registers[:site].pages.select do |page|
        page_id = page.data["require_id"]
        page_id && page_id.strip == @filename
      end
    end
  end
end

Liquid::Template.register_tag('require', Jekyll::RequireTag)