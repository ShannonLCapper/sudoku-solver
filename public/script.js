(function( $ ) {
  $.fn.focusAtEnd = function() {
    return this.each(function() {

      var $el = $( this ),
          el = this;

      //Focus on element if it isn't already
      if ( !$el.is( ":focus" ) ) {
        $el.focus();
      }

      if ( el.setSelectionRange ) {

        //Double because Opera inconsistent about carriage return length
        var len = $el.val().length * 2;
        //Needs timeout for some reason or it doesn't work
        setTimeout(function() {
          el.setSelectionRange( len, len );
        }, 1 );

      } else {

          //As fallback, replace the contents with itself
          //Doesn't work in Chrome, but Chome can do setSelectionRange
          $el.val( $el.val() );
      }

      //Scroll to bottom in case we're in a tall textarea
      this.scrollTop = 999999;

    });
  }
}(jQuery));

var sudoku = {

  init: function() {
    $("#sudokuForm table").on(
      {
        "input": this.processInput,
        "keydown": this.moveSlotFocus,
      }, 
      "td input"
    );

    $("#sudokuForm button[type='reset']").click( this.fadeOutSlots );

    $("#sudokuForm").on( "submit", this.submitSudoku );
  },

  findSlots: function() {
    return $( this ).closest( "form" ).find( ".slot" );
  },

  fadeOutSlots: function( event ) {
    event.preventDefault();
    var $slots = sudoku.findSlots.call( this );
    $slots.animate( 
      {"opacity": 0 }, 
      200, 
      "swing", 
      function() {
        sudoku.emptySlots.call( this );
        $slots.css( "opacity", 1 );
      }
    );
    sudoku.clearMessage();
  },
  
  emptySlots: function() {
    var $slots = sudoku.findSlots.call( this );
    $slots.val( "" );
    $slots.attr("value", "");
    $slots.data( "origVal", "" );
    $slots.removeClass("highlight");
  },

  getArrowKey: function(event) {
    event = event || window.event;
    switch (event.which) {
    case 38:
      return "up";
    case 40:
      return "down";
    case 37:
      return "left";
    case 39:
      return "right";
    default:
      return null;
    }
  },

  processInput: function( event ) {

    var elem = this;
    var $elem = $( elem );

    // Make sure only numbers 1-9 can be inputted
    $elem.val( $elem.val().replace( /[^1-9]/g, "" ) );

    // Prevent multiple number input (glitch on mobile)
    $elem.val( $elem.val()[0] || "" );

    // Highlight or unhighlight based on if field is empty
    $elem.toggleClass( "highlight", elem.value !== "" );

    // If a new number is typed in, move to the next input field
    var valChanged = $elem.data( "origVal" ) !== $elem.val();
    if ( $elem.val() !== "" &&  valChanged ) {
      sudoku.moveSlotFocus.call( this, event, "forward" );
    }

    //Clear any messages to user if a number is changed
    if ( valChanged ) {
      sudoku.clearMessage();
    }

    // Save the value in the field for later reference
    $elem.data( "origVal", $elem.val() );

  },

  getRowAndColumn: function( slot ) {
    var $slot = $( slot );
    var slotName = slot.name;
    var row = parseInt(slotName[0], 10);
    var column = parseInt(slotName[2], 10);
    return { row: row, column: column};
  },

  moveSlotFocus: function(event, direction) {
    direction = direction || sudoku.getArrowKey(event);
    if (!direction) return;
    if (direction === "up" || direction === "down" ) {
      event.preventDefault(); //stops arrow keys from changing number
    }
    var $slot = $( this );
    var rowAndColumn = sudoku.getRowAndColumn(  this );
    var row = rowAndColumn.row;
    var column = rowAndColumn.column;
    switch (direction) {
      case "up":
        row -= 1;
        break;
      case "down":
        row += 1;
        break;
      case "left":
          column -= 1;
        break;
      case "right":
        if ( $slot.caret() !== $slot.val().length ) {
          return;
        } else {
          column += 1;
        }
        break;
      case "forward":
        if ( column === 8 ) {
          column = 0;
          row += 1;
        } else {
          column += 1;
        }
        break;
      default:
        return;
    }
    var newSlotName = row + "-" + column;
    var $newSlot = $("input[name=" + newSlotName + "]");
    var newSlot = $newSlot[0];

    if ( newSlot ) {
      $newSlot.focusAtEnd();
    }
    
  },

  toggleLoadingIcon: function() {
    var $submitBtn = $( this ).closest( "form" ).find( "button[type='submit']" );
    if ( $submitBtn.is( ":disabled" ) ) {
      $submitBtn.html( $submitBtn.data( "text" ) );
      $submitBtn.removeAttr( "disabled" );
    } else {
      $submitBtn.data( "text", $submitBtn.text() );
      $submitBtn.attr( "disabled", "disabled" );
      $submitBtn.html( "<i class='fa fa-spinner fa-pulse fa-fw'></i>" );
    }
    
  },

  fillSlots: function( answers ) {
    sudoku.findSlots.call( this )
      //Set empty slots to 0 opacity
      .filter( function() {
        return $( this ).val() === "";
      })
      .css( "opacity", 0 )

      //Fill in answers
      .val( function( index ) {
        var coords = sudoku.getRowAndColumn(  this );
        var row = coords.row;
        var column = coords.column;
        return answers[row][column];
      })

      //Fade in filled slots
      .animate( {"opacity": 1 }, 200 );
  },

  messageUser: function( message ) {
    $( "#message" ).text( message );
  },

  clearMessage: function() {
    $( "#message" ).text( "" );
  },

  submitSudoku: function( event ) {

    event.preventDefault();

    var form = $( "#sudokuForm" );
    form.find( ":focus").blur();

    $.ajax({
      type: "POST",
      url: "/solution",
      data: form.serialize(),
      dataType: "json",
      timeout: 5000,
      beforeSend: function() {
        sudoku.toggleLoadingIcon.call( form );
      },
      complete: function() {
        sudoku.toggleLoadingIcon.call( form );
      }
    })
      .done(function( response ) {
        if ( response.solution ) {
          sudoku.fillSlots.call( form, response.solution );
          sudoku.clearMessage();
        } else {
          sudoku.messageUser( "There are no possible solutions for the provided sudoku");
        }
      })
      .fail(function() {
        sudoku.messageUser( "Oops! Something went wrong. Try again in a moment." );
      });
  }
}



$(document).ready(function() {

  sudoku.init() 

});  