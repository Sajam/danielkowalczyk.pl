!(function (window) {
  "use strict";

  if (window.CodeListing) return;

  var CodeListing = window.CodeListing = function ($listing, options) {
    this.$listing = $listing;
    this.options = options;
    this.codeLines = undefined;
    this.codeLinesCount = undefined;
    this.numberingCharactersCount = undefined;

    this._options = undefined;
    this._persistentLine = undefined;

    return this.init();
  };

  CodeListing.prototype.init = function () {
    this.prepareContent()
      .bindEvents()
      .buildListing();

    return this;
  };

  CodeListing.prototype.prepareContent = function () {
    this._options = $.extend(
      true,
      {
        className: 'code-listing-default',
        lineNumbers: true,
        interactive: true,
        numberingStart: 1,
        monospaceCharacterWidth: 10,
        horizontalPadding: 10
      },
      this.options
    );

    this.$listing
      .addClass(this._options.className)
      .data('CodeListing', this);

    this.codeLines = this.$listing.html().split('\n');
    this.codeLinesCount = this.codeLines.length;
    this.numberingCharactersCount = this.codeLinesCount.toString().length;

    return this;
  };

  // @TODO: optimize events listeners (maybe don't create separate listeners for each instance?).
  CodeListing.prototype.bindEvents = function () {
    var _this = this;

    this.$listing.on('mouseenter', 'span', function () {
      _this.toggleActiveLine(parseInt($(this).attr('data-line'), 10));
    });

    this.$listing.on('click', 'span', function () {
      _this.togglePersistentLine(parseInt($(this).attr('data-line'), 10), true);
    });

    this.$listing.on('mouseleave', function () {
      _this.clearActiveLine();
    });

    this.$listing.on('click', '.raw', function () {
      var popupWindow = window.open('', 'RawCode', 'width=640, height=480');

      popupWindow.document.write('<pre>' + _this.codeLines.join('\n') + '</pre>');
      popupWindow.document.title = 'Raw code view';
    });

    return this;
  };

  CodeListing.prototype.buildListing = function () {
    var linesNumberingWidth = this.numberingCharactersCount * this._options.monospaceCharacterWidth +
      2 * this._options.horizontalPadding;

    this.$listing
      .empty()
      .append(
        $('<div>', {
          'class': 'listing'
        }).append(
          $('<div>', {
            'class': 'buttons'
          }).append(
            $('<a>', {
              'class': 'raw',
              text: 'Raw',
              title: 'View raw code in popup window'
            })
          ),

          this._options.lineNumbers ? $('<div>', {
            'class': 'numbering',
            style: 'width: ' + linesNumberingWidth + 'px;',
            html: this.codeLines.map(function (code, i) {
              return $('<span>', {
                'data-line': this._options.numberingStart + i,
                text: this._options.numberingStart + i
              });
            }, this)
          }) : '',

          $('<div>', {
            'class': 'code',
            style: 'margin-left: ' + (this._options.lineNumbers ? linesNumberingWidth : 0) + 'px;',
            html: this.codeLines.map(function (code, i) {
              return $('<span>', {
                'data-line': this._options.numberingStart + i,
                html: code
              });
            }, this)
          })
        )
      );

    return this;
  };

  CodeListing.prototype.clearActiveLine = function () {
    this.$listing.find('span.active:not([data-line="' + this._persistentLine + '"])').removeClass('active');
  };

  CodeListing.prototype.setActiveLine = function (lineNumber) {
    if (!this._options.interactive) return;

    this.$listing.find('span[data-line="' + lineNumber + '"]').addClass('active');
  };

  CodeListing.prototype.toggleActiveLine = function (lineNumber) {
    this.clearActiveLine();
    this.setActiveLine(lineNumber);
  };

  CodeListing.prototype.togglePersistentLine = function (lineNumber) {
    this._persistentLine = this._persistentLine === lineNumber ? undefined : lineNumber;
    this.setActiveLine(lineNumber);
  };
}(window));
