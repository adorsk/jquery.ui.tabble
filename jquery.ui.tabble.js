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

      this.cells = [];
      $.each(this.rows, function(pos, row){
        var cells = $(row).find('> td');
        that.cells.push(cells);
      });

      this.tabCells = {
        top: this.cells[0][1],
        left: this.cells[1][0],
        right: this.cells[1][2],
        bottom: this.cells[2][1],
      };

      this.tabs = {};
      $.each(this.tabCells, function(pos, tabCell){
        var $tab = $(tabCell).find('> div');
        $tab.addClass("ui-tabble-tab ui-tabble-tab-" + pos);
        that.tabs[pos] = $tab;
      });

      this._resize();

    },

    _resize: function(){
      $.each(this.tabs, function(pos, tab){
        if (pos == 'left' || pos == 'right'){
          $cell = $(tab).parent();
          $h3 = $(tab).find('> h3');
          console.log($cell);
          console.log($cell.innerHeight());
          $h3.width($cell.innerHeight());
        }
      });
    },

    _destroy: function() {
      this.element.removeClass( "ui-tabble ui-widget ui-widget-content ui-corner-all");
    }

  });

})( jQuery );
