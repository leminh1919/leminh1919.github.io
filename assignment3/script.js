function showPopup(el) {
  document.getElementById("popup-image").src = el.dataset.image;
  document.getElementById("popup-description").textContent =
    el.dataset.description;
  document.getElementById("popup-weapon-img").src = el.dataset.weaponimg;
  document.getElementById("character-popup").classList.remove("hidden");
}

function closePopup() {
  document.getElementById("character-popup").classList.add("hidden");
}
