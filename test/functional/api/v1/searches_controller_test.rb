require "test_helper"

class Api::V1::SearchesControllerTest < ActionController::TestCase
  include ESHelper

  def self.should_respond_to(format)
    context "with query=match and with #{format.to_s.upcase}" do
      setup do
        get :show, params: { query: "match" }, format: format
      end

      should respond_with :success
      should "contain a hash" do
        assert_kind_of Hash, yield(@response.body).first
      end
      should "only include matching gems" do
        gems = yield(@response.body)
        assert_equal 1, gems.size
        assert_equal "match", gems.first["name"]
      end
    end

    context "with no query and with #{format.to_s.upcase}" do
      setup do
        get :show, format: format
      end

      should respond_with :bad_request
      should "explain failed request" do
        assert page.has_content?("Request is missing param 'query'")
      end
    end
  end

  context "on GET to show" do
    setup do
      @match = create(:rubygem, name: "match")
      @other = create(:rubygem, name: "other")
      create(:version, rubygem: @match)
      create(:version, rubygem: @other)
      import_and_refresh
    end

    should_respond_to(:json) do |body|
      JSON.parse(body)
    end

    should_respond_to(:yaml) do |body|
      YAML.safe_load body
    end
  end

  context "on GET to autocomplete" do
    setup do
      @match1 = create(:rubygem, name: "match1")
      @match2 = create(:rubygem, name: "match2")
      create(:version, rubygem: @match1)
      create(:version, rubygem: @match2)
      import_and_refresh
      get :autocomplete, params: { query: "ma" }
    end

    should "get names of gems" do
      assert page.has_content?("match1")
      assert page.has_content?("match2")
    end

    should "only respond gem exist" do
      assert page.has_no_content?("other")
    end
  end
end
