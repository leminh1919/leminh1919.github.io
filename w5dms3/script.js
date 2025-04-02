///////// Feedback

let meterText = document.getElementById("meterOutputText");

let meterCheckInterval = 100;

let currentVolume = null;

setInterval(() => {
  /* meter defined in toneSetup */
  currentVolume = meter.getValue();
  let newValue = clamp(currentVolume, -48, 0);
  let newValueInt = parseInt(newValue);
  let newRemappedValue = remapRange(newValueInt, -48, -6, 0, 100);
  if (newRemappedValue < 1) {
    meterText.innerHTML = "😃";
  } else if (newRemappedValue < 60) {
    meterText.innerHTML = "😟";
  }
  meterText.innerHTML = newRemappedValue + "%";

  let newColour = `color-mix(in hs1, red, blue ${newRemappedValue}%)`;
  console.log(newColour);

  document.getElementById("playbackToggle").style.backgroundColor = "red";

  // meterText.innerHTML = currentVolume;
}, meterCheckInterval);
