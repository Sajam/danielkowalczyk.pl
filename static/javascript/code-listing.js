!(function (window) {
  "use strict";

  if (window.CodeListing) return;

  var CodeListing = window.CodeListing = function ($listing, options) {
    this.$listing = $listing;
    this.options = options;
    this.lines = undefined;
    this.persistentLines = [];

    return this.init();
  };

  CodeListing.prototype.init = function () {
    return this
      .prepareContent()
      .bindEvents()
      .buildListing();
  };

  CodeListing.prototype.prepareContent = function () {
    this.options = $.extend(true, {}, CodeListing.defaultOptions, this.options);
    this.$listing.addClass(this.options.className);
    this.lines = this.$listing
      .html()
      .split('\n');

    return this;
  };

  CodeListing.prototype.bindEvents = function () {
    var _this = this;

    if (this.options.interactive) {
      this.$listing
        .on('mouseenter', '[' + CodeListing.lineAttr + ']', function () {
          _this.toggleActiveLine(
            CodeListing.getLineNumber(this)
          );
        })
        .on('mouseleave', this.clearActiveLine.bind(this))
        .on('click', '[' + CodeListing.lineAttr + ']', function () {
          _this.togglePersistentLine(
            CodeListing.getLineNumber(this)
          );
        });
    }

    this.$listing.on('click', '.raw', this.showRawCode.bind(this));

    return this;
  };

  CodeListing.prototype.buildListing = function () {
    var numberingWidth = this.lines.length.toString().length * this.options.monospaceCharacterWidth +
      2 * this.options.numberingHorizontalPadding;

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

          this.options.numbering ? $('<div>', {
            'class': 'numbering',
            style: 'width: ' + numberingWidth + 'px;',
            html: this.lines.map(function (line, i) {
              return $('<span>', CodeListing.makeProps({
                lineAttr: this.options.numberingStart + i,
                text: this.options.numberingStart + i
              }));
            }, this)
          }) : '',

          $('<div>', {
            'class': 'code',
            style: 'margin-left: ' + (this.options.numbering ? numberingWidth : 0) + 'px;',
            html: this.lines.map(function (line, i) {
              return $('<span>', CodeListing.makeProps({
                lineAttr: this.options.numberingStart + i,
                html: line
              }));
            }, this)
          })
        )
      );

    return this;
  };

  CodeListing.prototype.setActiveLine = function (lineNumber) {
    this.$listing
      .find('[' + CodeListing.lineAttr + '="' + lineNumber + '"]')
      .addClass('active');
  };

  CodeListing.prototype.clearActiveLine = function () {
    var _this = this;

    this.$listing
      .find('.active')
      .each(function () {
      var $line = $(this);

      if (_this.persistentLines.indexOf(CodeListing.getLineNumber($line)) === -1) {
        $line.removeClass('active');
      }
    });
  };

  CodeListing.prototype.toggleActiveLine = function (lineNumber) {
    this.clearActiveLine();
    this.setActiveLine(lineNumber);
  };

  CodeListing.prototype.togglePersistentLine = function (lineNumber) {
    var persistentLineIndex = this.persistentLines.indexOf(lineNumber);

    if (persistentLineIndex > -1) {
      delete this.persistentLines[persistentLineIndex];
    } else {
      this.persistentLines.push(lineNumber);
    }

    this.setActiveLine(lineNumber);
  };

  CodeListing.prototype.showRawCode = function () {
    var popupWindow = window.open('', 'RawCode', 'width=640, height=480');

    popupWindow.document.write('<pre>' + this.lines.join('\n') + '</pre>');
    popupWindow.document.title = 'Raw code view';
  };


  /**
   * Static fields and methods.
   */

  CodeListing.defaultOptions = {
    className: 'code-listing',
    numbering: true,
    numberingStart: 1,
    interactive: true,
    monospaceCharacterWidth: 10,
    numberingHorizontalPadding: 10
  };

  CodeListing.lineAttr = 'data-code-listing-line';

  CodeListing.getLineNumber = function (element) {
    return parseInt($(element).attr(CodeListing.lineAttr), 10);
  };

  CodeListing.makeProps = function (props) {
    var result = {};

    Object.keys(props).map(function (propName) {
      result[CodeListing.hasOwnProperty(propName) ? CodeListing[propName] : propName] = props[propName];
    });

    return result;
  };
}(window));
