require('script!zepto/zepto');

$(document).ready(function() {
  $('#menuLink').on('click', function() {
    $('#layout, #menuLink, #menu').toggleClass('active');
  });
});