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
        "ui-tabble ui-widget ui-widget-content ui-corner-all"
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
        var $tab = $(tabCell).find('> div');
        $tab.addClass("ui-tabble-tab " + pos);
        $tab.attr('pos', pos);
        that.tabs[pos] = $tab;

        // Add corner class to header.
        $h3 = $tab.find('> h3').eq(0);
        if (pos == 'left' || pos == 'right'){
          $h3.addClass('ui-corner-top');
        }
        else{
          $h3.addClass('ui-corner-' + pos);
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

      var pos = opts.pos;
      var $cell = $(this.tabCells[pos]);

      if ($cell.hasClass('expanding')){
        return;
      }

      var dim;
      if (pos == 'left' || pos == 'right'){
        dim = 'width';
      }
      else if (pos == 'bottom' || pos == 'top'){
        dim = 'height';
      }

      var expanded = $cell.hasClass('expanded');

      var dMax = parseInt($cell.css('max' + this._capitalize(dim)), 10);
      var dMin = parseInt($cell.css('min' + this._capitalize(dim)), 10);
      var delta = dMax - dMin;
      var targetDim;
      if (expanded){
        delta = -1 * delta;
        targetDim = dMin;
      }
      else{
        targetDim = dMax;
      }

      var cell_a_opts = {};
      cell_a_opts[dim] = targetDim;
      $cell.animate(
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
      )

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
        $h3.animate(h3_a_opts);
      }

      if (this.options.stretchTable){
        var $table = $(this.element);
        var table_a_opts = {};
        table_a_opts[dim] = parseInt($table.css(dim),10) + delta;
        $table.animate(table_a_opts);
      }

      // @TODO: chain animations, to get deferred.
      // return deferred.
    },

    _capitalize: function(s){
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

  });

})( jQuery );
