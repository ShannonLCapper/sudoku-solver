function clearSlots() {
  var $slots = $(".slot")
  $slots.attr("value", "");
  $slots.data( "origVal", "" );
  $slots.removeClass("highlight");

  clearMessage();
}

function getArrowKey(event) {
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
}

$.fn.focusAtEnd = function() {
  return this.each(function() {

    var $el = $(this),
        el = this;

    //Focus on element if it isn't already
    if (!$el.is(":focus")) $el.focus();

    if (el.setSelectionRange) {

      //Double because Opera inconsistent about carriage return length
      var len = $el.val().length * 2;
      //Needs timeout for some reason or it doesn't work
      setTimeout(function() {
        el.setSelectionRange(len, len);
      }, 1);

    } else {

        //As fallback, replace the contents with itself
        //Doesn't work in Chrome, but Chome can do setSelectionRange
        $el.val($el.val());
    }

    //Scroll to bottom in case we're in a tall textarea
    this.scrollTop = 999999;

  })
}

function processInput( event ) {

  var elem = this;
  var $elem = $( elem );

  // Make sure only numbers 1-9 can be inputted
  $elem.val( $elem.val().replace(/[^1-9]/g, "") );

  // Prevent multiple number input (glitch on mobile)
  $elem.val( $elem.val()[0] || "" );

  // Highlight or unhighlight based on if field is empty
  $elem.toggleClass("highlight", elem.value !== "");

  // If a new number is typed in, move to the next input field
  var valChanged = $elem.data( "origVal" ) !== $elem.val();
  if ( $elem.val() !== "" &&  valChanged ) {
    moveSlotFocus.call( this, event, "forward" );
  }

  //Clear any messages to user if a number is changed
  if ( valChanged ) {
    clearMessage();
  }

  // Save the value in the field for later reference
  $elem.data( "origVal", $elem.val() );

}

function getRowAndColumn( slot = this ) {
  var $slot = $( this );
  var slotName = slot.name;
  var row = parseInt(slotName[0], 10);
  var column = parseInt(slotName[2], 10);
  return { row: row, column: column};
}

function moveSlotFocus(event, direction) {
  direction = direction || getArrowKey(event);
  if (!direction) return;
  if (direction === "up" || direction === "down" ) {
    event.preventDefault(); //stops arrow keys from changing number
  }
  var $slot = $( this );
  var rowAndColumn = getRowAndColumn(  this );
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
  
}

function fillSlots( answers ) {

  
  $( ".slot" )
    //Set empty slots to 0 opacity
    .filter( function() {
      return $( this ).val() === "";
    })
    .css( "opacity", 0 )

    //Fill in answers
    .val( function( index ) {
      var coords = getRowAndColumn(  this );
      var row = coords.row;
      var column = coords.column;
      return answers[row][column];
    })

    //Fade in filled slots
    .animate( {"opacity": 1 }, 200 );
}

function messageUser( message ) {
  $( "#message" ).text( message );
}

function clearMessage() {
  $( "#message" ).text( "" );
}

function submitSudoku( event ) {

  event.preventDefault();

  var form = $( "#sudokuForm" );
  form.find( ":focus").blur();

  $.ajax({
    type: "POST",
    url: "/solution",
    data: form.serialize(),
    dataType: "json",
  })
    .done(function( response ) {
      if ( response.solution ) {
        fillSlots( response.solution );
        clearMessage();
      } else {
        messageUser( "There are no possible solutions for the provided sudoku");
      }
    })
    .fail(function() {
      messageUser( "Oops! Something went wrong. Try again in a moment." );
    });
}

$(document).ready(function() {

  $("#sudokuForm table").on(
    {
      "input": processInput,
      "keydown": moveSlotFocus,
    }, 
    "td input"
  );

  $("#sudokuForm button[type='reset']").click(clearSlots);

  $("#sudokuForm").on("submit", submitSudoku);

});  