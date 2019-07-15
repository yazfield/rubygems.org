$(function(){
  $('#home_query').autocomplete();
  $('.header__search').autocomplete();
});


(function($){
  $.fn.autocomplete = function() {
    var indexNumber = -1;
    var previousForm = 'null';
    var listName = this.attr('id') + "-suggestList";
    var that = this;
    this.attr('autocomplete', 'off');
    this.after("<ul id=" + listName + "></ul>");
    var list = $('#' + listName);
    list.attr('class', 'suggest-list');

    this.blur(function(){
      list.hide();
    });
    this.focus(function(){
      if (!list.find('li').length){
        list.hide();
      } else {
        list.show();
      };
    });

    this.keyup(function(e){
      e.preventDefault();

      var input = $.trim($(this).val());
      if (input.length >= 2 && previousForm != input) {
        $.ajax({
          url: '/api/v1/search/autocomplete',
          type: 'GET',
          data: ('query=' + input),
          processData: false,
          contentType: false,
          dataType: 'json'
        }).done(function(data) {
          if (data.length) {
            list.find('li').remove();
            for (var i = 0; i < data.length && i < 10; i++) {
              var newLi = $('<li>').text(data[i]);
              $(newLi).attr('class', 'menu-item');
              list.append(newLi);
            }
            indexNumber = -1;
            list.show();
          } else {
            list.hide();
          };
        });
      };

      if (e.keyCode == 40) {
        list.find('li').removeClass('selected');
        indexNumber += 1;
        if (indexNumber > (list.find('li').length - 1)) {
          indexNumber %= (list.find('li').length);
        };
        list.find('li').eq(indexNumber).mouseenter();
        list.show();
      } else if (e.keyCode == 38) {
        list.find('li').removeClass('selected');
        indexNumber -= 1;
        if (indexNumber < (list.find('li').length - 1)) {
          indexNumber %= (list.find('li').length);
        };
        list.find('li').eq(indexNumber).mouseenter();
        list.show();
      };
      if (input.length < 2) {
        list.hide();
        list.find('li').remove();
      };
      if (!list.find('li').length) {
        list.hide();
      };
      previousForm = $.trim($(this).val());
    });

    $(document).on({
      'mousedown': function() {
        setTimeout(function() {
          that.focus();
        }, 0);
      },
      'mouseenter': function() {
        list.find('li').removeClass('selected');
        $(this).addClass('selected');
        that.val($(this).text());
        previousForm = that.val();
      },
      'mouseleave': function() {
        $(this).removeClass('selected');
      }
    }, '.menu-item');
  };
})(jQuery);
