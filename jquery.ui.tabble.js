(function( $, undefined ) {

  $.widget( "ui.tabble", {
    version: "@VERSION",
    delay: 300,
    options: {
      stretchTable: false,
    },

    _create: function() {
      var that = this,
      options = this.options;

      this.element.addClass(
        "ui-tabble ui-widget ui-widget-content"
      );

      this._processTabble();
    },

    _processTabble: function() {
      var that = this;

      this.rows = this.element.find("> tbody > tr");

      this.cells = [];
      $.each(this.rows, function(pos, row){
        var cells = $(row).find('> td');
        that.cells.push(cells);
      });

      this.tabCells = {
        top: this.cells[0][1],
        left: this.cells[1][0],
        center: this.cells[1][1],
        right: this.cells[1][2],
        bottom: this.cells[2][1]
      };

      this.tabs = {};
      $.each(this.tabCells, function(pos, tabCell){
        $(tabCell).addClass('ui-tabble-tabcell '+ pos);

        // @TODO
        // Break this out
        // into a set tab function here.
        // Sensing widths/heights, or setting defaults.
        // Setting lefts/rights.
        var $tab = $(tabCell).find('> div');
        $tab.addClass("ui-tabble-tab " + pos);
        $tab.attr('pos', pos);
        that.tabs[pos] = $tab;

        // Get the cell.
        $cell = $tab.parent();

        // Get header and body
        $h = $tab.find('> h3').eq(0);
        $b = $tab.find('> div').eq(0);

        // Set corners and initial positions and sizes.
        var hWidth = $h.outerHeight(true);
        if (pos == 'left' || pos == 'right'){
          $cell.width(hWidth);
          $h.addClass('ui-corner-top');
          $h.css('left', 0);
          if (pos == 'left'){
            $b.css('left', hWidth);
          }
          else if (pos == 'right'){
            $b.css('left', 0);
          }
        }
        else if (pos == 'top' || pos == 'bottom'){
          $cell.height(hWidth);
          $h.addClass('ui-corner-' + pos);
          $h.css('top', 0);
          if (pos == 'top'){
            $b.css('top', hWidth);
          }
          else if (pos == 'bottom'){
            $b.css('top', 0);
          }
        }
      });

      // Assign events to tab headers.
      // @TODO: change this to be more like typical jquery.ui event handling
      $(this.element).on('click', '.ui-tabble-tab > h3', function(e){
        var $h3 = $(e.target);
        var $tab = $h3.parent();
        var pos = $tab.attr('pos');
        that.toggleTab({pos: pos});
			})

      this._resize();
    },

    _resize: function(){
      $.each(this.tabs, function(pos, tab){
        if (pos == 'left' || pos == 'right'){
          $cell = $(tab).parent();
          $h3 = $(tab).find('> h3');
          $h3.width($cell.innerHeight());
        }
      });
    },

    _destroy: function() {
      this.element.removeClass( "ui-tabble ui-widget ui-widget-content ui-corner-all");
    },

    toggleTab: function(opts){
      var that = this;
      opts = $.extend({
        resize: true
      }, opts);

      var deferreds = [];

      var pos = opts.pos;
      var $cell = $(this.tabCells[pos]);
      var $tab = $(this.tabs[pos]);
      var $b = $tab.find('> div').eq(0);
      var $h = $tab.find('> h3').eq(0);

      if ($cell.hasClass('expanding')){
        return;
      }

      var dim;
      var bWidth;
      if (pos == 'left' || pos == 'right'){
        dim = 'width';
        bWidth = $b.outerWidth(true);
      }
      else if (pos == 'bottom' || pos == 'top'){
        dim = 'height';
        bWidth = $b.outerHeight(true);
      }
      var hWidth = $h.outerHeight(true);

      var expanded = $cell.hasClass('expanded');

      var fullWidth = hWidth + bWidth;
      var targetWidth;
      var delta = bWidth;
      if (expanded){
        delta = -1 * delta;
        targetWidth = hWidth;
      }
      else{
        targetWidth = fullWidth;
      }

      var cell_a_opts = {};
      cell_a_opts[dim] = targetWidth;
      deferreds.push($cell.animate(
          cell_a_opts,
          {
            complete: function(){
              $cell.removeClass('expanding');
              if (expanded){
                $cell.removeClass('expanded')
              }
              else{
                $cell.addClass('expanded')
              }
              if (opts.resize){
                that._resize();
              }
            }
          }
      ));

      if (pos == 'right' || pos == 'bottom'){
        var $tab = $cell.find('> div').eq(0);
        var $h3 = $tab.find('> h3').eq(0);
        var h3_a_opts;
        if (pos == 'right'){
          h3_a_opts = {'left': parseInt($h3.css('left'),10) + delta};
        }
        else if (pos == 'bottom'){
          h3_a_opts = {'top': parseInt($h3.css('top'),10) + delta};
        }
        deferreds.push($h3.animate(h3_a_opts));
      }

      if (this.options.stretchTable){
        var $table = $(this.element);
        var table_a_opts = {};
        table_a_opts[dim] = parseInt($table.css(dim),10) + delta;
        deferreds.push($table.animate(table_a_opts));
      }

      return $.when.apply($, deferreds);
    },

    _capitalize: function(s){
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

  });

})( jQuery );
