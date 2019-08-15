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
    var originalForm = 'null';

    function listLength(){
      return list.find('li').length;
    };

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

    function correctIndexNumber(indicator) {
      switch (indicator){
        case -2: return list.find('li').length - 1; break;
        case list.find('li').length: return -1; break;
        default: return indicator; break;
      };
    };

    function movePrev(){
      indexNumber--;
      indexNumber = correctIndexNumber(indexNumber);
    };

    function moveNext(){
      indexNumber++;
      indexNumber = correctIndexNumber(indexNumber);
    }

    function upSelected() {
      list.find('li').removeClass('selected');
      movePrev();
      if ( indexNumber != -1 || indexNumber == list.find('li').length ){
        list.find('li').eq(indexNumber).focusedItem();
        that.val(list.find('.selected').text());
      } else {
        that.val(originalForm);
      };
      list.show();
    };

    function downSelected(){
      list.find('li').removeClass('selected');
      moveNext();
      if ( indexNumber != -1 || indexNumber == list.find('li').length ){
        list.find('li').eq(indexNumber).focusedItem();
        that.val(list.find('.selected').text());
      } else {
        that.val(originalForm);
      };
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

    function upSelect(e){
      (e.keyCode == 38 || (e.ctrlKey && e.keyCode == 80)) ? return true : return false;
    };

    function downSelect(e){
      (e.keyCode == 40 || (e.ctrlKey && e.keyCode == 78)) ? return true : return false;
    };

    this.keyup(function(e) {
      e.preventDefault();
      var input = $.trim($(this).val());
      if (input.length >= 2 && previousForm != input) {
        originalForm = that.val();
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
      } else{
      };
      if (upSelect(e)) {
        upSelected();
      } else if (downSelect(e)) {
        downSelected();
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

    this.parent().on({
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
