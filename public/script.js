function clearSlots() {
  var slots = $(".slot")
  slots.attr("value", "");
  slots.removeClass("highlight");
}

function getDirectionKey(event) {
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
  elem.value = elem.value.replace(/[^1-9]/g, "");
  elem.value = elem.value[0]; //prevent multiple numbers being sneaked in on mobile
  $(elem).toggleClass("highlight", elem.value !== "");
  if ( elem.value !== "" ) {
    moveSlotFocus.call( this, event, "forward" );
  }
}

function moveSlotFocus(event, direction) {
  direction = direction || getDirectionKey(event);
  if (!direction) return;
  if (direction === "up" || direction === "down" ) {
    event.preventDefault(); //stops arrow keys from changing number
  }
  var slotName = this.name;
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
      column += 1;
      break;
    case "back":
      if ( this.value !== "" ) {
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
  var newSlot = $newSlot[0];

  focusAndSelect.call( newSlot, direction === "back" );
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
      "click": focusAndSelect
    }, 
    "td input"
  );

  $("button[type='reset']").click(clearSlots);

});  