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

$(window).on("load", function () {
	$("body").addClass("loaded");
	getScrollDistance();
	outdatedBrowser({
		bgColor: "#f25648",
		color: "#ffffff",
		lowerThan: "transform",
	});
});

// detect a scroll
window.onscroll = function () {
	getScrollDistance();
};

// navigation toggle
const navigationToggle = document.getElementById("navigation-toggle");
if (navigationToggle !== null) {
	navigationToggle.addEventListener("click", event => {
		event.preventDefault();
		document.body.classList.toggle("menu-open");
	});
}
