require "test_helper"
require "capybara/minitest"

class AutocompletesTest < SystemTest
  include ESHelper

  setup do
    create(:rubygem, name: "rubocop")
    create(:rubygem, name: "rubocop-performance")
    import_and_refresh
    Capybara.app_host = 'localhost:3000' #temporary solution for not connecting the webpage
    Capybara.current_driver = :selenium_chrome
    visit root_path
    Selenium::WebDriver.logger.level = :error #In this version of Capybara, "deprecated" warn appeears. This line suppress them.
  end

  test "search field" do
    fill_in 'home_query', with: "rubo"
    click_on 'home_submit_button'
    assert page.has_content? "search"
    assert page.has_content? "rubocop"
  end


  test "down arrow key to choose suggestion" do
    fill_field = find_by_id("home_query")
    fill_field.set("rubo")
    has_css?('li.menu-item')
    fill_field.send_keys :down
    fill_field.has_no_text?('rubo', :exact => true)
  end

  test "up arrow key to choose suggestion" do
    fill_field = find_by_id("home_query")
    fill_field.set("rubo")
    has_css?('li.menu-item')
    fill_field.send_keys :up
    fill_field.has_no_text?('rubo', :exact => true)
  end

  test "mouse click to choose suggestion" do
    fill_in 'home_query', with: "rubo"
    has_css?('li.menu-item')
    find('li', exact_text:'rubocop').hover
    find(:css, '.selected').click
    click_on 'home_submit_button'
    assert page.has_content? "search"
    assert page.has_content? "rubocop"
  end

  teardown do
    Capybara.use_default_driver
    Capybara.app_host = "#{Gemcutter::PROTOCOL}://#{Gemcutter::HOST}"
  end
end
