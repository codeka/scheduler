//
// Library for fitting text to a given width and height.
//
// Essentially, this library takes an element, and tries various font sizes until it finds one that
// fits within the width and height of the element, without overflowing either dimension.
//
// Some requirements to make the library a little simper:
//  - The element must have a fixed width and height (i.e. it's not responsive, if the window
//    resizes, that's a different matter, but the library won't recalculate the font size
//    unless you explicitly call it again).
//  - The element should not have custom padding or a border.
//

// Modify the font size of the text in given element to fit within the dimensions of the element.
// The font will be sized so that it's as big as possible without exceeding the width or height of 
// the element.
export function fitTextToBox(el: HTMLElement): void {
  // Set a flag so we don't run this function on the same element twice
//  if (el.hasAttribute("data-text-fitted")) {
//    return;
//  }
//  el.setAttribute("data-text-fitted", "true");

  const originalHtml = el.innerHTML;
  const boxWidth = el.clientWidth;
  const boxHeight = el.clientHeight;

  console.log(`Fitting text to box with width ${boxWidth} and height ${boxHeight}`);

  // Make sure there is an inner span that we'll use to do all our calculations, etc. on.
  let innerSpan = el.querySelector("span.text-fitting") as HTMLElement;
  if (!innerSpan) {
    innerSpan = document.createElement("span");
    innerSpan.classList.add("text-fitting");
    innerSpan.style.display = "inline-block";
    innerSpan.style.maxWidth = `${boxWidth}px`;
    // Use a consistent line height so measurements are predictable when sizing the font.
    innerSpan.innerHTML = originalHtml;
    el.innerHTML = "";
    el.appendChild(innerSpan);
  }

  // Perform a binary search of font sizes to find the largest font size that fits within the box.
   // TODO: make these configurable?
  var low = 10;
  var high = 1000;
  var size = low;

  while (low <= high) {
    // Try the midpoint of the current range.
    const mid = Math.floor((low + high) / 2);
    innerSpan.style.fontSize = `${mid}px`;
    console.log(`Trying font size ${mid}px`);

    var rect = innerSpan.getBoundingClientRect();
    console.log(`Text size is now ${rect.width}x${rect.height}`);
    if (rect.width <= boxWidth && rect.height <= boxHeight) {
      // Fits, this is a good candidate.
      size = mid;
      low = mid + 1;
    } else {
      // Too big, try a smaller font size.
      high = mid - 1;
    }
  }

  // Found! Make sure we update it to the final value.
  innerSpan.style.fontSize = `${size}px`;
}