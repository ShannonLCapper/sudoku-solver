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

  init: function( $formEl ) {
    $formEl.on(
      {
        "input": this.processInput,
        "keydown": this.moveSlotFocus
      }, 
      "td input"
    );

    $formEl.on("click", "button[type='reset']", this.fadeOutSlots );
    $formEl.on( "submit", this.submitSudoku );
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

  getDirectionKey: function(event) {
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
    case 8:
      return "back";
    default:
      return null;
    }
  },

  processInput: function( event ) {

    var el = this;
    var $el = $( el );

    // Make sure only numbers 1-9 can be inputted
    $el.val( $el.val().replace( /[^1-9]/g, "" ) );

    // Prevent multiple number input (glitch on mobile)
    $el.val( $el.val()[0] || "" );

    // Highlight or unhighlight based on if field is empty
    $el.toggleClass( "highlight", $el.val() !== "" );

    // If a new number is typed in, move to the next input field
    var valChanged = $el.data( "origVal" ) !== $el.val();
    if ( $el.val() !== "" &&  valChanged ) {
      sudoku.moveSlotFocus.call( this, event, "forward" );
    }

    //Clear any messages to user if a number is changed
    if ( valChanged ) {
      sudoku.clearMessage();
    }

    // Save the value in the field for later reference
    $el.data( "origVal", $el.val() );

  },

  getRowAndColumn: function( slot ) {
    var $slot = $( slot );
    var slotName = slot.name;
    var row = parseInt(slotName[0], 10);
    var column = parseInt(slotName[2], 10);
    return { row: row, column: column};
  },

  moveSlotFocus: function(event, direction) {
    direction = direction || sudoku.getDirectionKey(event);
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
      case "back":
        if ( $slot.caret() !== 0 ) {
          return;
        } else if ( column === 0 ) {
          column = 8;
          row -= 1;
        } else {
          column -= 1;
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

    if ( $newSlot.length ) {
      $newSlot.focusAtEnd();
      // To correct for backspace firing input event and 
      // deleting last character in the new slot
      if ( direction === "back" ) {
        $newSlot.val( $newSlot.val() + " " );
      }
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

  handleServerResponse: function( response ) {
    if ( response.solution ) {
      sudoku.fillSlots.call( this, response.solution );
      sudoku.clearMessage();
    } else {
      sudoku.messageUser( "There are no possible solutions for the provided sudoku");
    }
  },

  submitSudoku: function( event ) {

    event.preventDefault();

    var $form = $( this );
    $form.find( ":focus").blur();

    $.ajax({
      type: "POST",
      url: $form.attr( "action" ),
      data: $form.serialize(),
      dataType: "json",
      context: $form,
      timeout: 3000,
      beforeSend: sudoku.toggleLoadingIcon,
      complete: sudoku.toggleLoadingIcon,
      success: sudoku.handleServerResponse,
      error: function() {
        sudoku.messageUser( "Oops! Something went wrong. Try again in a moment." );
      }
    });
  }
}



$(document).ready(function() {

  sudoku.init( $( "#sudokuForm" ) ); 

});  