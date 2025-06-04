//I want to create a window that pop up fullscreen but not jumping to another pages
//When reload page always go to the top
window.onload = function () {
  window.scrollTo(0, 0);
};
//Pop up when click on a character : read data for each character
function showPopup(el) {
  const popup = document.getElementById("popup");
  document.getElementById("popup-image").src = el.dataset.image;
  document.getElementById("popup-title").textContent = el.dataset.name;
  document.getElementById("popup-description").textContent =
    el.dataset.description;
  document.getElementById("popup-weapon-img").src = el.dataset.weaponimg;

  popup.classList.remove("good-popup", "bad-popup");

  //Seperate style for each side
  if (el.dataset.side === "bad") {
    popup.classList.add("bad-popup");
  } else if (el.dataset.side === "good") {
    popup.classList.add("good-popup");
  }

  popup.classList.remove("hidden");
  document.body.classList.add("noscroll");
}
//Close popup window
function closePopup() {
  document.getElementById("popup").classList.add("hidden");
  document.body.classList.remove("noscroll");
}
