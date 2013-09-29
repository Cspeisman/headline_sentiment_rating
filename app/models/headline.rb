class Headline < ActiveRecord::Base
  has_many :sentiment_data, :uniq => true
  belongs_to :source
  validates :content, length: { in: 15..255},
            uniqueness: true
  validates :date, presence: true
  validates :archive_url, presence: true

  def self.date(some_date) # returns all of the headlines that match that date
    search_date = DateTime.parse(some_date.to_s)
    date_range = search_date.beginning_of_day...search_date.end_of_day
    self.where(date: date_range)
  end

  def self.get_average(some_date)
    hdays = self.date(some_date)

    score = 0

    hdays.each do |day|
      day.sentiment_data.each do |data|
        score += data.sentiment_score
      end
    end

    score/hdays.count
  end
end
