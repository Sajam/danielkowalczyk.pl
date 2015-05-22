!$(function () {
  "use strict";

  $('pre').each(function () {
    new CodeListing($(this));
  });
});
