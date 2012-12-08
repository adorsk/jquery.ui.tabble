(function( $, undefined ) {

  $.widget( "ui.tabble", {
    version: "@VERSION",
    delay: 300,
    options: {
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
      this.rows.addClass("ui-tabble-row");

      this.cells = [];
      $.each(this.rows, function(pos, row){
        var cells = $(row).find('> td');
        cells.addClass("ui-tabble-cell");
        that.cells.push(cells);
      });

      this.tabCells = {
        top: this.cells[0][1],
        left: this.cells[1][0],
        right: this.cells[1][2],
        bottom: this.cells[0][1],
      };

      $.each(this.tabCells, function(pos, tabCell){
        $(tabCell).addClass('ui-tabble-tabcell ui-tabble-tabcell-' + pos);
      });

      this._resize();

    },

    _resize: function(){
      $.each(this.tabCells, function(pos, tabCell){
        if (pos == 'left' || pos == 'right'){
          $h3 = $(tabCell).find('> h3');
          $h3.width($(tabCell).innerHeight());
        }
      });
    },

    _destroy: function() {
      this.element.removeClass( "ui-tabble ui-widget ui-widget-content ui-corner-all");
    }

  });

})( jQuery );
