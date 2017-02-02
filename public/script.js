function clearSlots() {
  var $slots = $(".slot")
  $slots.attr("value", "");
  $slots.removeClass("highlight");
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
  if ( $elem.val() !== "" && $elem.data( "origVal" ) !== $elem.val() ) {
    moveSlotFocus.call( this, event, "forward" );
  }

  // Save the value in the field for later reference
  $elem.data( "origVal", $elem.val() );
}

function moveSlotFocus(event, direction) {
  direction = direction || getArrowKey(event);
  if (!direction) return;
  if (direction === "up" || direction === "down" ) {
    event.preventDefault(); //stops arrow keys from changing number
  }
  var slotName = this.name;
  var $slot = $( this );
  var row = parseInt(slotName[0], 10);
  var column = parseInt(slotName[2], 10);
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

function focusAndSelect( delay = false ) {

  var el = this;
  var $el = $( el );

  if ( delay ) {
    $el.attr( "readonly", "readonly" );
  }

  setTimeout(function() {$el.focus().select(); }, 0 );

  if ( delay ) {
    setTimeout(function() {
      $el.removeAttr( "readonly" ).select();
    }, 50 );
  }
}

$(document).ready(function() {

  $("table").on(
    {
      "input": processInput,
      "keydown": moveSlotFocus,
      // "click": focusAndSelect
    }, 
    "td input"
  );

  $("button[type='reset']").click(clearSlots);

});  


// To fix
  // on master branch, make sure to include fix on preventing multiple inputs to field