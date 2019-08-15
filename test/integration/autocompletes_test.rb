require "test_helper"
require "capybara/minitest"

class AutocompletesTest < SystemTest
  include ESHelper

  setup do
    Capybara.server_port = 3000
    Capybara.server_host = "localhost"
    Capybara.app_host = "http://localhost:3000"
    Capybara.current_driver = :selenium_chrome_headless
    Capybara.default_max_wait_time = 10
    Selenium::WebDriver.logger.level = :error # In this version of Capybara, 'deprecated' warn appeears. This line suppress them.

    rubygem = create(:rubygem, name: "rubocop")
    create(:version, rubygem: rubygem, indexed: true)
    rubygem = create(:rubygem, name: "rubocop-performance")
    create(:version, rubygem: rubygem, indexed: true)
    import_and_refresh

    visit root_path
    @fill_field = find_by_id "home_query"
    @fill_field.set "rubo"
  end

  def list_exist?
    find ".suggest-list"
  end

  test "search field" do
    click_on class: "home__search__icon"
    assert page.has_content? "search"
    assert page.has_content? "rubocop"
  end

  test "selected field is only one with cursor selecting" do
    list_exist?
    find(".suggest-list").all("li").each(&:hover)
    assert_selector ".selected", count: 1
  end

  test "selected field is only one with arrow key selecting" do
    list_exist?
    @fill_field.native.send_keys :down
    find ".selected"
    @fill_field.native.send_keys :down
    assert_selector ".selected", count: 1
  end

  test "suggest list doesn't appear with gem not existing" do
    list_exist?
    @fill_field.set "ruxyz"
    assert_all_of_selectors "#home_query-suggestList", visible: :hidden
  end

  test "suggest list doesn't appear unless the search field is focused" do
    list_exist?
    find("h1").click
    assert_all_of_selectors "#home_query-suggestList", visible: :hidden
  end

  test "down arrow key to choose suggestion" do
    list_exist?
    @fill_field.native.send_keys :down
    assert page.has_no_field? "home_query", with: "rubo"
  end

  test "up arrow key to choose suggestion" do
    list_exist?
    @fill_field.native.send_keys :up
    assert page.has_no_field? "home_query", with: "rubo"
  end

  test "ctrl + n key to choose suggestion" do
    list_exist?
    @fill_field.native.send_keys [:control, "n"]
    assert page.has_no_field? "home_query", with: "rubo"
  end

  test "ctrl + p key to choose suggestion" do
    list_exist?
    @fill_field.native.send_keys [:control, "p"]
    assert page.has_no_field? "home_query", with: "rubo"
  end

  test "search form should be focused when up from the top of suggestion list" do
    list_exist?
    @fill_field.native.send_keys :down, :up
    assert page.has_field? "home_query", with: "rubo"
    assert page.has_no_content? ".selected"
  end

  test "search form should be focused when up from the bottom of suggestion list" do
    list_exist?
    @fill_field.native.send_keys :up, :down
    assert page.has_field? "home_query", with: "rubo"
    assert page.has_no_content? ".selected"
  end

  test "down arrow key should loop" do
    list_exist?
    @fill_field.native.send_keys :down, :down, :down, :down
    assert find(".menu-item", match: :first).matches_css?(".selected")
  end

  test "up arrow key should loop" do
    list_exist?
    @fill_field.native.send_keys :up, :up, :up, :up
    assert find("#home_query-suggestList").all(".menu-item").last.matches_css?(".selected")
  end

  test "mouse hover a suggest item to choose suggestion" do
    list_exist?
    find("li", text: "rubocop", match: :first).hover
    assert_selector ".selected"
  end

  test "mouse click a suggestion item to submit" do
    find("li", text: "rubocop", match: :first).click
    assert_equal current_path, search_path || "/gems/"
    assert page.has_content? "rubocop"
  end

  teardown do
    Capybara.default_max_wait_time = 2
    Capybara.use_default_driver
    Capybara.default_host
    Capybara.app_host = "#{Gemcutter::PROTOCOL}://#{Gemcutter::HOST}"
  end
end
