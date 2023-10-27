// scroll listener init
var scrollObject = {};

function getScrollDistance() {
	scrollObject = {
		x: window.pageXOffset,
		y: window.pageYOffset,
	};

	if (scrollObject.y > 0) {
		document.body.classList.add("scrolled");
	} else {
		document.body.classList.remove("scrolled");
	}
}

// detect a scroll
window.onscroll = function () {
	getScrollDistance();
};

// detect loaded and scroll position
window.onload = function () {
	document.body.classList.add("loaded");
	getScrollDistance();
};
