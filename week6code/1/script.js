const topHeading = document.querySelector("h1");
console.log(topHeading);
console.log(topHeading.textContent);
topHeading.textContent = "i am ironman";
topHeading.style.color = "yellow";

const allParas = document.querySelectorAll(".blue-color");
console.log(allParas);
for (let i = 0; i < allParas.length; i++) {
  console.log(allParas[i].textContent);
  allParas[i].style.border = "2px solid green";
}

const myButton = document.querySelector("#my-button");
console.log(myButton);
myButton.addEventListener("click", handleClick);
const myCat = document.querySelector("#my-cat");
console.log(myCat);

function handleClick() {
  console.log("hi");
  myCat.classList.toggle("round");
}
