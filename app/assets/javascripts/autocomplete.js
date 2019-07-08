var indexNumber = -1;
var previousForm = 'null';

$(document).on('keyup', '#home_query', function(e) {
  var result = $('.suggest-list')
  var number = -1;
  e.preventDefault();

  if (!$('.suggest-list').length) {
    $('.home__search-wrap').append("<ul class='suggest-list'></ul>");
  };

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
        $('.suggest-list').find('li').remove();
        for (var i = 0; i < data.length && i < 10; i++) {
          var newLi = $('<li>').text(data[i]);
          $(newLi).attr('class', 'menu-item');
          result.append(newLi);
          indexNumber = -1;
        }
        $('.suggest-list').show();
      } else {
        $('.suggest-list').hide();
      };
    });
  };
  if (input.length < 2) {
    $('.suggest-list').hide();
  }

  if (!$('.suggest-list li').length) {
    $('.suggest-list').hide();
  };

  if (e.keyCode == 40) {
    $('.suggest-list li').removeClass('selected');
    indexNumber += 1;
    if (indexNumber > ($('.suggest-list li').length - 1)) {
      indexNumber %= ($('.suggest-list li').length);
    };
    $('.suggest-list li').eq(indexNumber).mouseenter();
    $('.suggest-list').show();
  } else if (e.keyCode == 38) {
    $('.suggest-list li').removeClass('selected');
    indexNumber -= 1;
    if (indexNumber < ($('.suggest-list li').length - 1)) {
      indexNumber %= ($('.suggest-list li').length);
    };
    $('.suggest-list li').eq(indexNumber).mouseenter();
    $('.suggest-list').show();
  };
  previousForm = $.trim($(this).val());
});

$(document).on({
  'mousedown': function() {
    setTimeout(function() {
      $('#home_query').focus();
    }, 0);
  },
  'mouseenter': function() {
    $('.suggest-list li').removeClass('selected');
    $(this).addClass('selected');
    $('#home_query').val($(this).text());
    previousForm = $('#home_query').val();
  },
  'mouseleave': function() {
    $(this).removeClass('selected');
  }
}, '.menu-item');

$(document).on({
  'blur': function() {
    $('.suggest-list').hide();
  },
  'focus': function() {
    $('.suggest-list').show();
  }
}, '#home_query');
