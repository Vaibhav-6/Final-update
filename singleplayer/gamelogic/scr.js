window.onload = document.getElementsByClassName("popup")[0].classList.add("active");

document.getElementById("dismiss-popup-btn").addEventListener("click", function () {
    document.getElementsByClassName("popup")[0].classList.remove("active");
});
let ele
let colordef = {
    first: "#f6d365",
    second: "#fda085"
}
sessionStorage.setItem("colorCode", JSON.stringify(colordef))
let val = JSON.parse(sessionStorage.getItem('m'))
console.log(val)
document.getElementById("dismiss-popup-btn").addEventListener("click", function () {
    ele = parseInt(document.querySelector('input[name="grid"]:checked').value)
    //console.log(ele)
    // let val = sessionStorage.getItem('m')
    // console.log(val)
    sessionStorage.setItem("gridsize", JSON.stringify(ele))
    if (val == 1) location.replace('../../multiplayer/public/index.html')
    if (val == 0) location.replace("main/home.html")
})