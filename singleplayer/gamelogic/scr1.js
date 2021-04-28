window.onload = document.getElementsByClassName("popup")[0].classList.add("active");

document.getElementById("dismiss-popup-btn").addEventListener("click", function () {
    document.getElementsByClassName("popup")[0].classList.remove("active");
});
let ele
let val = JSON.parse(sessionStorage.getItem('m'))
console.log(val)
document.getElementById("dismiss-popup-btn").addEventListener("click", function () {
    ele = parseInt(document.querySelector('input[name="grid"]:checked').value)
    switch (ele) {
        case 5:
            let color = {
                first: "#ffafbd",
                second: "#ffc3a0",
            }
            sessionStorage.setItem("colorCode", JSON.stringify(color))
            break
        case 6:
            let color1 = {
                first: "#f5efef",
                second: "#feada6",
            }
            sessionStorage.setItem("colorCode", JSON.stringify(color1))
            break
        case 7:
            let color2 = {
                first: "#7b4397",
                second: "#dc2430"
            }
            sessionStorage.setItem("colorCode", JSON.stringify(color2))
            break
        default:
            let colordef = {
                first: "#fdfbfb",
                second: "#ebedee"
            }
            sessionStorage.setItem("colorCode", JSON.stringify(colordef))
    }
    if (val == 1) location.replace("../../multiplayer/public/index.html")
    if (val == 0) location.replace("main/home.html")
})