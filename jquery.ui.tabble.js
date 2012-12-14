(function( $, undefined ) {

  $.widget( "ui.tabble", {
    version: "@VERSION",
    delay: 300,
    options: {
      stretchTable: false,
      addToggleArrows: true
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
      this.$tbody = this.element.find('> tbody');
      if (! this.$tbody || ! this.$tbody.length){
        this.$tbody = this.element;
      }

      var $rows = this.$tbody.find("> tr");
      this.rows = {
        top: $rows[0],
        center: $rows[1],
        bottom: $rows[2]
      };

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
        $(tabCell).addClass('ui-tabble-tabcell ' + pos);

        if (pos == 'center'){
          return;
        }
        // @TODO
        // Break this out
        // into a set tab function here.
        // Sensing widths/heights, or setting defaults.
        // Setting lefts/rights.
        var $tab = $(tabCell).find('> div').eq(0);
        if (! $tab){
          if (pos == 'top' || pos == 'bottom'){
            $(that.rows[pos]).addClass('empty');
          }
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

        // Prepend toggle arrow to header.
        if (that.options.addToggleArrows){
          var expanded = '\u25BC';
          var contracted = '\u25B2';
          if (pos == 'bottom'){
            expanded = '\u25B2';
            contracted = '\u25BC';
          }
          $h.prepend('<span class="ui-tabble-arrow"><span class="expanded">' + expanded + '</span><span class="contracted">' + contracted + '</span></span>');
        }

        // Set corners.
        var hWidth = Math.ceil($h.outerHeight(true));
        $tab.addClass('ui-corner-' + pos);
        if (pos == 'top' || pos == 'bottom'){
          $(that.rows[pos]).removeClass('empty');
        }
      });

      // Assign events to tab headers.
      // @TODO: change this to be more like typical jquery.ui event handling
      $(this.$tbody).on('click', '.ui-tabble-tab > h3', function(e){
        var $h = $(e.currentTarget);
        var $tab = $h.parent();
        var pos = $tab.attr('pos');
        that.toggleTab({pos: pos});
			})

      // Mark empty top/bottom rows.
      $.each(['top', 'bottom'], function(i, pos){
        var $tab = that.tabs[pos];
        if (! $tab.length){
          $(that.rows[pos]).addClass('empty');
        }
      });

      this.resize();
    },

    resize: function(){
      var that = this;

      // Resize cells and reposition contents.
      $.each(this.tabCells, function(pos, cell){

        // Ignore center.
        if (pos == 'center'){
          return;
        }
        var $cell = $(cell);
        var expanded = $cell.hasClass('expanded');
        var targetWidth = 0;
        var $tab = that.tabs[pos];
        var $h;
        var $b;
        var hWidth = 0;
        var bWidth = 0;

        if ($tab){
          $h = $tab.find(' > h3').eq(0);
          $b = $tab.find(' > div').eq(0);
        }

        if ($h){
          hWidth = Math.ceil($h.outerHeight(true));
          targetWidth += hWidth;
          if (pos == 'left' || pos == 'top'){
            $h.css(pos, 0);
          }
          else if (pos == 'right'){
            if (! expanded){
              $h.css('left', 0);
            }
          }
          else if (pos == 'bottom'){
            if (! expanded){
              $h.css('top', 0);
            }
          }
        }

        if ($b){
          if (pos == 'left' || pos == 'right'){
            bWidth = Math.ceil($b.outerWidth(true));
            if (pos == 'left'){
              $b.css('left', hWidth);
            }
            else if (pos == 'right'){
              if (expanded){
                $b.css('left', 0);
                $h.css('left', bWidth);
              }
              else{
                $b.css('left', -bWidth);
              }
            }
          }
          else if (pos == 'top' || pos == 'bottom'){
            bWidth += Math.ceil($b.outerHeight(true));
            if (pos == 'top'){
              $b.css('top', hWidth);
            }
            else if (pos == 'bottom'){
              if (expanded){
                $b.css('top', 0);
                $h.css('top', bWidth);
              }
              else{
                $b.css('top', -bWidth);
              }
            }
          }

          if ($cell.hasClass('expanded')){
            targetWidth += bWidth;
          }
        }


        if (pos == 'left' || pos == 'right'){
          // We resize the cells in the top row,
          // as these control width in a fixed-layout table.
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
          var $tab = $(tab);
          //var $cell = $tab.parent();
          $h3 = $tab.find('> h3');
          $h3.outerWidth($tab.innerHeight());
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
        bWidth = Math.ceil($b.outerWidth(true));
        // Use the cells in the top row to set width,
        // per fixed-layout table.
        $widthCell = $(this.widthCells[pos]);
      }
      else if (pos == 'bottom' || pos == 'top'){
        dim = 'height';
        bWidth = Math.ceil($b.outerHeight(true));
        $widthCell = $cell;
      }
      var hWidth = Math.ceil($h.outerHeight(true));

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
        if (pos == 'right'){
          anim_pos = 'left';
        }
        else if (pos == 'bottom'){
          anim_pos = 'top';
        }
        var h_a_opts = {};
        var b_a_opts = {};
        h_a_opts[anim_pos] = parseInt($h.css(anim_pos),10) + delta;
        b_a_opts[anim_pos] = parseInt($b.css(anim_pos), 10) + delta;
        deferreds.push($h.animate(h_a_opts));
        deferreds.push($b.animate(b_a_opts));
      }

      if (this.options.stretchTable){
        var $table = $(this.element);
        var table_a_opts = {};
        table_a_opts[dim] = $table[dim]() + delta;
        deferreds.push($table.animate(table_a_opts));
      }

      var promise = $.when.apply($, deferreds);
      promise.then(function(){
        that.resize();
      });
      return promise;
    },

    _capitalize: function(s){
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

  });

})( jQuery );
