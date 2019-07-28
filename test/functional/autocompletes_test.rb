require "test_helper"
require "capybara/minitest"

class AutocompletesTest < SystemTest
  include ESHelper
  setup do
    create(:rubygem, name: "LDAP")
    create(:rubygem, name: "LDAP-PLUS")
    import_and_refresh
    visit '/'
  end

  test "sample test" do
    fill_in "home_query", with: "LDAP"
    click_on "home_submit_button"

    assert page.has_content? "search"
    assert page.has_content? "LDAP"
  end
end
