class SourcesController < ApplicationController

  def index
    sources = Source.all
  end

  def grab_scatter
    render json: Source.get_all_cached.flatten.to_json
  end

  def headlines
    @headlines = {}
    @date = params["param1"]
    @source_name = params["param2"]
    if @source_name == 'aggregate'
      @link = ""
      sources = Source.all

      sources.each do |source|
        headline_records = source.headlines.date(@date)

        headline_records.each do |headline|
          @headlines[headline.content] = headline.sentiment_data.first.sentiment_score
        end
      end
    else
      @source = Source.find_by(name: @source_name)
      headline_records = @source.headlines.date(@date)
      # @headlines.order(@headlines.date.to_i)
      headline_records.each do |headline|
        @headlines[headline.content] = headline.sentiment_data.first.sentiment_score
      end
    @link = headline_records.first.archive_url
    end
    # p @headlines
    @headlines = @headlines.sort_by{|k, v| v }
    html = render_to_string(:partial => 'sandbox/headlines', :layout => false,
                     :locals => {headlines: @headlines, link: @link})

    render json: {html: html}
  end


end
