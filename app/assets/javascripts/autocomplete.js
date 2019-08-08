$(function() {
  $('#home_query').autocomplete();
  $('#query').autocomplete();
});


(function($) {
  $.fn.autocomplete = function() {
    var indexNumber = -1;
    var previousForm = 'null';
    var listName = this.attr('id') + "-suggestList";
    var that = this;
    var form = 'null';
    this.attr('autocomplete', 'off');
    this.after("<ul id=" + listName + "></ul>");
    var list = $('#' + listName);
    list.attr('class', 'suggest-list');

    function addDataToSuggestList(data) {
      list.find('li').remove();
      for (var i = 0; i < data.length && i < 10; i++) {
        var newLi = $('<li>').text(data[i]);
        $(newLi).attr('class', 'menu-item');
        list.append(newLi);
      }
      indexNumber = -1;
      list.show();
    };

    $.fn.focusedItem = function() {
      $('li').removeClass('selected');
      this.addClass('selected');
    };

    function move(dir) {
      switch (dir) {
        case 'prev':
          indexNumber--;
          break;
        case 'next':
          indexNumber++;
          break;
      };
      switch (indexNumber) {
        case -1:
        case -2:
          indexNumber = list.find('li').length - 1;
          break;
        case list.find('li').length:
          indexNumber = 0;
          break;
      };
    };

    function arrowSelect(arrow) {
      list.find('li').removeClass('selected');
      switch (arrow) {
        case 'up':
          move('prev');
          break;
        case 'down':
          move('next')
          break;
      };
      list.find('li').eq(indexNumber).focusedItem();
      that.val(list.find('.selected').text());
      list.show();
    };

    this.blur(function() {
      list.hide();
    });
    this.focus(function() {
      if (!list.find('li').length) {
        list.hide();
      } else {
        list.show();
      };
    });

    this.keyup(function(e) {
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
            addDataToSuggestList(data);
          } else {
            list.hide();
          };
        });
      };
      if (e.keyCode == 38) {
        arrowSelect('up');
      } else if (e.keyCode == 40) {
        arrowSelect('down');
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
        that.val($(this).text())
        that.parent().submit();
      },
      'mouseenter': function() {
        $(this).focusedItem();
        indexNumber = $('.selected').index();
      },
      'mouseleave': function() {
        $(this).removeClass('selected');
      }
    }, ('#' + listName + ' > .menu-item'));
  };
})(jQuery);
