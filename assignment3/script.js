function showPopup(el) {
  const popup = document.getElementById("popup");

  // Set content
  document.getElementById("popup-image").src = el.dataset.image;
  document.getElementById("popup-title").textContent = el.dataset.name;
  document.getElementById("popup-description").textContent =
    el.dataset.description;
  document.getElementById("popup-weapon-img").src = el.dataset.weaponimg;

  // Remove any previous side classes
  popup.classList.remove("good-popup", "bad-popup");

  // Add correct side class
  if (el.dataset.side === "bad") {
    popup.classList.add("bad-popup");
  } else if (el.dataset.side === "good") {
    popup.classList.add("good-popup");
  }

  // Show popup
  popup.classList.remove("hidden");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}
