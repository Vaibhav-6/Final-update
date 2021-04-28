let ctx;
let localval = sessionStorage.getItem("gridsize")
let colorval = sessionStorage.getItem("colorCode")
let account_data = sessionStorage.getItem('info')
let color = JSON.parse(colorval)
let sizeofGrid = JSON.parse(localval)
let account_detail = JSON.parse(account_data)
let gridSize = sizeofGrid
let cellsize
let delay_comp = 0.5
const socket = io.connect("https://back-end-server-vaibhav.herokuapp.com/");

var squares, playersTurn, currentCells
let scoreComp, scorePlay, timeEnd, timeComp
let delay = 2
//let WIDTH=.innerWidth
const Side = {
        BOT: 0,
        LEFT: 1,
        RIGHT: 2,
        TOP: 3
    },
    FPS = 30
var local = document.documentElement
local.style.setProperty('--local-color1', color.first)
local.style.setProperty('--local-color2', color.second)
var PIXEL_RATIO = (function () {
    var ctx = document.getElementById("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1
    return dpr / bsr;
})();

createHiDPICanvas = function (ratio) {
    if (!ratio) {
        ratio = PIXEL_RATIO
    }
    let l = 400
    var can = document.getElementById("canvas")
    can.width = window.screen.width * ratio
    can.height = l * ratio
    can.style.width = window.screen.width + "px"
    can.style.height = l + "px"
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0)
    return can
}
let canvas = createHiDPICanvas(4)

ctx = canvas.getContext("2d")
ctx.textAlign = "center"
ctx.textBaseline = "middle"
//let h = window.screen.height
let height = 400
let width = window.innerWidth
//canvas.width=window.innerWidth

var canvRect = canvas.getBoundingClientRect();

cellsize = width / (gridSize + 1)
//console.log(cellsize) // 1 is added for margin as cellsize will deacrease as we add more numbers

newGame()
canvas.addEventListener("mousemove", highlightGrid);
canvas.addEventListener("click", click)
document.getElementById("dismiss-popup-btn").addEventListener("click", function () {
    document.getElementsByClassName("popup")[0].classList.remove("active");
    if (account_detail != null) {
        socket.emit('res', {
            scoreP: scorePlay,
            scoreC: scoreComp,
            data: account_detail,
            game: 'Single',
        })
    }
    location.reload()
});

function loop() {
    drawBoard()
    drawSquares()
    drawdots()
    drawScore()
    goComp()
}
setInterval(loop, 1000 / FPS)

function click( /** @type {MouseEvent} */ ev) {
    if (!playersTurn || timeEnd > 0) {
        return
    }
    selectSide()
}
var grd = ctx.createLinearGradient(170, 0, 170, 0)
grd.addColorStop(0, color.first)
grd.addColorStop(1, color.second)

function drawBoard() {
    ctx.fillStyle = grd //"rgb(41,41,41)"
    ctx.fillRect(0, 0, width, height)
}

function drawCircles(x, y) {
    ctx.beginPath()
    ctx.fillStyle = "cyan"
    ctx.arc(x, y, cellsize / 10, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()
}

function drawdots() {
    //console.log("i am here")
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            drawCircles(cellsize * (i + 1), cellsize * (j + 1)) //i+1 and j+1 is to avoid getting at intital positions
        }
    }
}

function drawScore() {
    document.getElementById("player-score").innerHTML = scorePlay
    document.getElementById("computer-score").innerHTML = scoreComp
    let colPlay = playersTurn ? "#09fa65" : "ivory"
    let colComp = playersTurn ? "ivory" : "#09fa65";
    let colswitchplay = document.querySelector(".heading1")
    let colswitchcomp = document.querySelector(".heading2")
    colswitchplay.style.setProperty("--play-val", colPlay)
    colswitchcomp.style.setProperty("--comp-val", colComp)
    if (timeEnd > 0) {
        timeEnd--;

        document.getElementsByClassName("popup")[0].classList.add("active");
        document.getElementById("Player").innerHTML = "PlayerScore: " + scorePlay
        document.getElementById("Computer").innerHTML = "ComputerScore: " + scoreComp
        if (scoreComp == scorePlay) {
            document.getElementById("result-mode").innerHTML = "Draw!"

        } else {
            let playerWins = scorePlay > scoreComp
            let text = playerWins ? "Player " : "Computer "
            document.getElementById("result-mode").innerHTML = text + "Wins!"
        }
    }
    /*
    let colPlay = playersTurn ? "rgb(0, 255, 115)" : "rgba(1,182,70,0.5)"
    let colComp = playersTurn ? "rgba(217, 176, 255,0.5)" : "rgb(217, 176, 255)";
    //rgb(132, 0, 255)
    drawText("Player", width * 0.25, margin * 0.35, colPlay, 38)
    drawText("Computer", width * 0.75, margin * 0.35, colComp, 35)
    drawText(scorePlay, width * 0.25, margin * 0.55, colPlay, 35)
    drawText(scoreComp, width * 0.75, margin * 0.55, colComp, 35)
    if (timeEnd > 0) {
        timeEnd--;
        if (scoreComp == scorePlay) {
            drawText("Draw", width * 0.5, margin * 0.75, "red", 35)
        } else {
            let playerWins = scorePlay > scoreComp
            let color = playerWins ? "red" : "blue"
            let text = playerWins ? "Player" : "Computer"
            drawText(text, width * 0.5, margin * 0.75, color, 35)
            drawText("WINS!", width * 0.5, margin * 0.95, color, 35)
        }
        if (timeEnd == 0) {
            newGame()
        }
    }*/
}

function refer() {
    location.replace("../popup2.html")
}

function home() {
    if (account_detail != null) {
        location.replace("../../main.html")
    } else {
        location.replace("../../guest.html")
    }
}

function restart() {
    location.reload()
}

function exit() {
    if (account_detail != null) {
        location.replace("../../main.html")
    } else {
        location.replace('../../guest.html')
    }
}

document.getElementById('dismiss-popup-btn2').addEventListener('click', (e) => {
    if (account_detail != null) {
        socket.emit('res', {
            scoreP: scorePlay,
            scoreC: scoreComp,
            data: account_detail,
            game: 'Single'
        })
    }
})

function highlightGrid( /** @type {MouseEvent} */ ev) {
    if (!playersTurn || timeEnd > 0) { //remove second player
        return
    }
    // get mouse position relative to the canvas
    let x = ev.clientX - canvRect.left;
    let y = ev.clientY - canvRect.top;

    // highlight the square's side
    highlightSide(x, y);
}

function highlightSide(x, y) {

    // clear previous highlighting
    for (let row of squares) {
        for (let square of row) {
            square.highlight = null;
        }
    }

    let rows = squares.length;
    let cols = squares[0].length;
    currentCells = []
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (squares[i][j].contains(x, y)) {
                let side = squares[i][j].highlightSide(x, y)
                if (side != null) {
                    currentCells.push({
                        row: i,
                        col: j
                    })
                }

                // determine neighbour
                let row = i,
                    col = j,
                    highlight, neighbour = true;
                if (side == Side.LEFT && j > 0) {
                    col = j - 1;
                    highlight = Side.RIGHT;
                } else if (side == Side.RIGHT && j < cols - 1) {
                    col = j + 1;
                    highlight = Side.LEFT;
                } else if (side == Side.TOP && i > 0) {
                    row = i - 1;
                    highlight = Side.BOT;
                } else if (side == Side.BOT && i < rows - 1) {
                    row = i + 1;
                    highlight = Side.TOP;
                } else {
                    neighbour = false;
                }

                // highlight neighbour
                if (neighbour) {
                    squares[row][col].highlight = highlight;
                    currentCells.push({
                        row: row,
                        col: col
                    });
                }

            }
        }
    }

}

function drawSquares() {
    for (let row of squares) {
        for (let square of row) {
            square.drawSides();
            square.drawFill();
        }
    }
}


function drawLine(x0, y0, x1, y1, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.lineWidth = cellsize / 10
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

function drawText(text, x, y, color, size) {
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = color
    ctx.font = size + "px ALGERIAN"
    ctx.fillText(text, x, y)
}

function getText(player, small) {
    if (player) {
        return small ? "Play" : "Player"
    } else {
        return small ? "Comp" : "Computer"
    }
}

function getColor(player, light) {
    if (player) {
        return light ? "rgb(0, 255, 115)" : "rgb(255, 0, 76)"; //player
    } else {
        return light ? "rgb(217, 176, 255)" : "rgb(132, 0, 255)"; //computer
    }
}

function getValidNeighbourSides(row, col) {
    let sides = []
    let square = squares[row][col]

    //check left
    if (!square.sideLeft.selected) {
        if (col == 0 || squares[row][col - 1].numSelected < 2) {
            sides.push(Side.LEFT)
        }
    }
    //check right
    if (!square.sideRight.selected) {
        if (col == squares[0].length - 1 || squares[row][col + 1].numSelected < 2) {
            sides.push(Side.RIGHT)
        }
    }
    //check top
    if (!square.sideTop.selected) {
        if (row == 0 || squares[row - 1][col].numSelected < 2) {
            sides.push(Side.TOP)
        }
    }
    //check bot
    if (!square.sideBot.selected) {
        if (row == squares.length - 1 || squares[row + 1][col].numSelected < 2) {
            sides.push(Side.BOT)
        }
    }
    return sides
}

function goComp() {
    if (playersTurn || timeEnd > 0) { //computer will chek playerturn
        return
    }

    if (timeComp > 0) {
        timeComp--;
        if (timeComp == 0) {
            selectSide()
            //playersTurn=!playersTurn
        }
        return
    }

    //setup option array
    let options = []
    options[0] = []
    options[1] = []
    options[2] = []

    //1)select that has three sides - first priority
    //2)slect if select a square that has 1 or 0 side completed -next priority
    //3)select that has 2 side cmpleted --worst priority

    for (let i = 0; i < squares.length; i++) {
        for (let j = 0; j < squares[0].length; j++) {
            switch (squares[i][j].numSelected) {
                case 3: //first priority
                    options[0].push({
                        square: squares[i][j],
                        sides: []
                    })
                    break
                case 0:
                case 1: //second priority
                    let sides = getValidNeighbourSides(i, j)
                    let prioriti = sides.length > 0 ? 1 : 2;
                    options[prioriti].push({
                        square: squares[i][j],
                        sides: sides
                    })
                    break
                case 2: //third priority
                    options[2].push({
                        square: squares[i][j],
                        sides: []
                    })
                    break
            }

        }
    }
    //random choose by priority
    let option1
    if (options[0].length > 0) {
        option1 = options[0][Math.floor(Math.random() * options[0].length)]
    } else if (options[1].length > 0) {
        option1 = options[1][Math.floor(Math.random() * options[1].length)]
    } else if (options[2].length > 0) {
        option1 = options[2][Math.floor(Math.random() * options[2].length)]
    }

    //randomly choose valid side
    let side = null
    if (option1.sides.length > 0) {
        side = option1.sides[Math.floor(Math.random() * option1.sides.length)]
    }

    //get the square coords
    let coords = option1.square.getFreeSideCoords(side)
    highlightSide(coords.x, coords.y)
    //delay for computer
    timeComp = Math.ceil(delay_comp * FPS)

}

function getSize(grid) {
    switch (grid) {
        case 3:
        case 4:
        case 5:
            return 17
        case 6:
            return 15
        case 7:
            return 13
        case 8:
            return 12
    }
}

function newGame() {
    timeEnd = 0
    currentCells = []
    playersTurn = Math.random() >= 0.5
    scoreComp = 0
    scorePlay = 0
    // set up the squares
    squares = [];
    for (let i = 0; i < gridSize - 1; i++) {
        squares[i] = [];
        for (let j = 0; j < gridSize - 1; j++) {
            squares[i][j] = new Square(cellsize * (j + 1), cellsize * (i + 1), cellsize, cellsize); //very important
        }
    }
}
//
function selectSide() {
    if (currentCells == null || currentCells.length == 0) {
        return
    }
    let filledSquare = false
    //select side of 
    for (let cell of currentCells) {
        if (squares[cell.row][cell.col].selectSide()) {
            filledSquare = true
        }
    }
    currentCells = []
    if (filledSquare) {
        // console.log(filledSquare)
        if (scorePlay + scoreComp == (gridSize - 1) * (gridSize - 1)) {
            timeEnd = Math.ceil(delay * FPS)
        }
    } else {
        //swittch players
        playersTurn = !playersTurn
    }
}
//document.onunload = (location.href = "../../home.html")


function Square(x, y, w, h) {
    this.w = w;
    this.h = h;
    this.bot = y + h;
    this.left = x;
    this.right = x + w;
    this.top = y;
    this.highlight = null;
    this.numSelected = 0;
    this.owner = null;
    this.sideBot = {
        owner: null,
        selected: false
    };
    this.sideLeft = {
        owner: null,
        selected: false
    };
    this.sideRight = {
        owner: null,
        selected: false
    };
    this.sideTop = {
        owner: null,
        selected: false
    };

    this.contains = function (x, y) {
        return x >= this.left && x < this.right && y >= this.top && y < this.bot;
    }
    this.drawFill = function () {
        if (this.owner == null) {
            return;
        }

        // light background
        ctx.fillStyle = getColor(this.owner, true)
        ctx.fillRect(
            this.left + cellsize / 10, this.top + cellsize / 10,
            this.w - (cellsize / 10) * 2, this.h - (cellsize / 10) * 2
        );
        drawText(getText(this.owner, true), this.left + this.w / 2, this.top + this.h / 2, getColor(this.owner, false), getSize(gridSize))

    }

    this.drawSide = function (side, color) {
        switch (side) {
            case Side.BOT:
                drawLine(this.left, this.bot, this.right, this.bot, color);
                break;
            case Side.LEFT:
                drawLine(this.left, this.top, this.left, this.bot, color);
                break;
            case Side.RIGHT:
                drawLine(this.right, this.top, this.right, this.bot, color);
                break;
            case Side.TOP:
                drawLine(this.left, this.top, this.right, this.top, color);
                break;
        }
    }
    this.drawSides = function () {
        //let highlight1
        // highlighting
        if (this.highlight != null) {
            this.drawSide(this.highlight, getColor(playersTurn, true));
        }

        if (this.sideBot.selected) {
            this.drawSide(Side.BOT, getColor(this.sideBot.owner, false))
        }
        if (this.sideLeft.selected) {
            this.drawSide(Side.LEFT, getColor(this.sideLeft.owner, false))
        }
        if (this.sideRight.selected) {
            this.drawSide(Side.RIGHT, getColor(this.sideRight.owner, false))
        }
        if (this.sideTop.selected) {
            this.drawSide(Side.TOP, getColor(this.sideTop.owner, false))
        }
    }
    //random free side coord
    this.getFreeSideCoords = function (side) {
        //valid coord of each side
        let coordsBot = {
            x: this.left + this.w / 2,
            y: this.bot - 1
        }
        let coordsLeft = {
            x: this.left,
            y: this.top + this.h / 2
        }
        let coordsRight = {
            x: this.right - 1,
            y: this.top + this.h / 2
        }
        let coordsTop = {
            x: this.left + this.w / 2,
            y: this.top
        }

        //get coord of given side
        let coords = null
        switch (side) {
            case Side.BOT:
                coords = coordsBot
                break
            case Side.LEFT:
                coords = coordsLeft
                break
            case Side.RIGHT:
                coords = coordsRight
                break
            case Side.TOP:
                coords = coordsTop
                break
        }
        //return requested side coords
        if (coords != null) {
            return coords
        }

        //random free side
        let freecoords = []
        if (!this.sideBot.selected) {
            freecoords.push(coordsBot)
        }
        if (!this.sideLeft.selected) {
            freecoords.push(coordsLeft)
        }
        if (!this.sideRight.selected) {
            freecoords.push(coordsRight)
        }
        if (!this.sideTop.selected) {
            freecoords.push(coordsTop)
        }
        return freecoords[Math.floor(Math.random() * freecoords.length)]
    }

    this.highlightSide = function (x, y) {

        // calculate the distances to each side
        let dBot = this.bot - y;
        let dLeft = x - this.left;
        let dRight = this.right - x;
        let dTop = y - this.top;

        // determine closest value
        let dClosest = Math.min(dBot, dLeft, dRight, dTop);

        // highlight the closest if not already selected
        if (dClosest == dBot && !this.sideBot.selected) {
            this.highlight = Side.BOT;
        } else if (dClosest == dLeft && !this.sideLeft.selected) {
            this.highlight = Side.LEFT;
        } else if (dClosest == dRight && !this.sideRight.selected) {
            this.highlight = Side.RIGHT;
        } else if (dClosest == dTop && !this.sideTop.selected) {
            this.highlight = Side.TOP;
        }
        return this.highlight;
    }
    this.selectSide = function () {
        if (this.highlight == null) {
            return
        }

        //slect highlitged side
        switch (this.highlight) {
            case Side.BOT:
                this.sideBot.owner = playersTurn
                this.sideBot.selected = true
                break
            case Side.LEFT:
                this.sideLeft.owner = playersTurn
                this.sideLeft.selected = true
                break
            case Side.RIGHT:
                this.sideRight.owner = playersTurn
                this.sideRight.selected = true
                break
            case Side.TOP:
                this.sideTop.owner = playersTurn
                this.sideTop.selected = true
                break
        }
        this.highlight = null
        this.numSelected++
        if (this.numSelected == 4) {
            this.owner = playersTurn
            if (playersTurn) {
                scorePlay++
            } else {
                scoreComp++
            }
            return true
        }
        return false
    }
}