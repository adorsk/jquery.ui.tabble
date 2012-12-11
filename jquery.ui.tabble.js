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

      this.widthCells = {
        left: this.cells[0][0],
        center: this.cells[0][1],
        right: this.cells[0][2]
      };

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
        var $tab = $(tabCell).find('> div').eq(0);
        if (! $tab){
          return;
        }

        $tab.addClass("ui-tabble-tab " + pos);
        $tab.attr('pos', pos);
        that.tabs[pos] = $tab;

        // Get the cell.
        $cell = $tab.parent();

        // Get header and body
        $h = $tab.find('> h3').eq(0);
        $b = $tab.find('> div').eq(0);

        // Set corners.
        var hWidth = $h.outerHeight(true);
        if (pos == 'left' || pos == 'right'){
          $h.addClass('ui-corner-top');
        }
        else if (pos == 'top' || pos == 'bottom'){
          $h.addClass('ui-corner-' + pos);
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

      this.resize();
    },

    resize: function(){
      var that = this;

      // Resize cells.
      $.each(this.tabCells, function(pos, cell){
        // Ignore center.
        if (pos == 'center'){
          return;
        }
        var $cell = $(cell);
        var targetWidth = 0;
        var $tab = that.tabs[pos];
        var $h;
        var $b;
        if ($tab){
          $h = $tab.find(' > h3').eq(0);
          $b = $tab.find(' > div').eq(0);
        }
        if ($h){
          targetWidth += $h.outerHeight();
        }
        if ($cell.hasClass('expanded')){
          if ($b){
            if (pos == 'left' || pos == 'right'){
              targetWidth += $b.outerWidth();
            }
            else if (pos == 'top' || pos == 'bottom'){
              targetWidth += $b.outerHeight();
            }
          }
        }

        // We resize the cells in the top row,
        // as these control width in a fixed-layout table.
        if (pos == 'left' || pos == 'right'){
          var $widthCell = $(that.widthCells[pos]);
          $widthCell.width(targetWidth);
        }
        else if (pos == 'top' || pos == 'bottom'){
          $cell.height(targetWidth);
        }
      });

      // Resize vertical tabs.
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
      opts = $.extend({}, opts);

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
      var $widthCell;
      if (pos == 'left' || pos == 'right'){
        dim = 'width';
        bWidth = $b.outerWidth(true);
        // Use the cells in the top row to set width,
        // per fixed-layout table.
        $widthCell = $(this.widthCells[pos]);
      }
      else if (pos == 'bottom' || pos == 'top'){
        dim = 'height';
        bWidth = $b.outerHeight(true);
        $widthCell = $cell;
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
      deferreds.push($widthCell.animate(
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
