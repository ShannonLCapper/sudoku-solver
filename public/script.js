function clearSlots() {
  var slots = $(".slot")
  slots.attr("value", "");
  slots.removeClass("highlight");
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

function moveSlotFocus(event) {
  var direction = getArrowKey(event);
  if (!direction) return;
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
    default:
      break;
  }
  var newSlotName = row + "-" + column;
  var $newSlot = $("input[name=" + newSlotName + "]");
  if ($newSlot.length) {
    $newSlot.focusAtEnd();
  }
}

$(document).ready(function() {

  $("table").on(
    {
      "input": function(event) {
        var elem = this;
        elem.value = elem.value.replace(/[^1-9]/g, "");
        $(elem).toggleClass("highlight", elem.value !== "");
      },
      "keydown": moveSlotFocus
    }, 
    "td input"
  );


  $("button[type='reset']").click(clearSlots);

});       