// Calculate the center of the viewport
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;

// Track the interval ID
let intervalId;

// Function to simulate scrolling
function dispatchScrollEvent() {
    const wheelEvent = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        clientX: centerX, // Horizontal position
        clientY: centerY, // Vertical position
        deltaY: 800, // Strong scroll effect
    });

    // Dispatch the event on the element under the center of the page
    document.elementFromPoint(centerX, centerY).dispatchEvent(wheelEvent);
    const length = document.querySelectorAll('.sc-eDPEul').length;
    console.log(length);
}
