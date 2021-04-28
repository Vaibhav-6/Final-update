window.onload = document.getElementsByClassName("popup")[0].classList.add("active");

document.getElementById("newGameButton").addEventListener("click", function () {
    document.getElementsByClassName("popup")[0].classList.remove("active");
    document.getElementById('code').style.display = 'block'
    document.getElementById('h1').style.display = "block"
    document.getElementById('h2').style.display = "block"
    document.getElementById('code1').classList.add('fs')
});
document.getElementById("joinGameButton").addEventListener("click", function () {
    document.getElementById('code').style.display = 'block'
    document.getElementsByClassName("popup")[0].classList.remove("active");
    document.getElementById("h2").style.display = 'block'
    document.getElementById("h1").style.display = 'block'
    document.getElementById('code1').classList.add('fs')

});
let canvas, ctx;
const socket = io('https://back-end-server-vaibhav.herokuapp.com/');

socket.on('init', handleinit)
socket.on('gameCode', handleGameCode)
socket.on('unknowngame', handleunkowngame)
socket.on('toomany', handletoomany)
socket.on('fire', handleFire)
socket.on("name", handleName)
socket.on('gameCodeforJoin', handle)

//let sizeOfgrid = prompt("Enter Size Of Dots")
let n = prompt("Enter Your Name")
let localval = sessionStorage.getItem("gridsize")
let account_data = sessionStorage.getItem('info')
let account_detail = JSON.parse(account_data)
let sizeofGrid = JSON.parse(localval)
let maincode
let gridSize = sizeofGrid || 5
let cellsize
let margin = null
var squares, playersTurn, currentCells
var gamestart = false
let scoreComp, scorePlay, timeEnd
let delay = 2
let playerNum
let gameMode = ""
let ready = false
let enemyReady = false
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodedisplay = document.getElementById('gameCodeDisplay');
document.getElementById('code').style.display = 'none'
document.getElementById('h1').style.display = 'none'
document.getElementById('h2').style.display = 'none'

document.querySelector(".heading1").innerHTML = n

//code = gameCodeInput.value
//const multi = document.getElementById("multi").addEventListener('click', multiplayer)

//let WIDTH=window.innerWidth
const Side = {
        BOT: 0,
        LEFT: 1,
        RIGHT: 2,
        TOP: 3
    },
    FPS = 30

//const COLOR_BOARD = "cornsilk";
//const COLOR_BORDER = "wheat";
//const COLOR_COMP = "crimson";
//const COLOR_COMP_LIT = "lightpink";
const COLOR_DOT = "sienna";
const COLOR_PLAY = "royalblue";
const COLOR_PLAY_LIT = "lightsteelblue";
const COLOR_TIE = "black";

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
    let l = 360
    var can = document.getElementById("canvas")
    can.width = window.screen.width * ratio
    can.height = l * ratio
    can.style.width = window.screen.width + "px"
    can.style.height = l + "px"
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0)
    return can
}

canvas = createHiDPICanvas(4)
//recovering canvas Id
//canvas = document.getElementById("canvas")
//console.log(canvas)
ctx = canvas.getContext("2d")
ctx.textAlign = "center"
ctx.textBaseline = "middle"

let width = window.screen.width > 360 ? 360 : window.screen.width
let height = 360
//width=window.innerWidth
//height=window.innerHeight
var canvRect = canvas.getBoundingClientRect();

cellsize = width / (gridSize + 1)
canvas.addEventListener("mousemove", highlightGrid);
canvas.addEventListener("click", click)

newGameBtn.addEventListener('click', create);
joinGameBtn.addEventListener('click', join);

//console.log(cellsize) // 1 is added for margin as cellsize will deacrease as we add more numbers
//adding mouse event 

document.getElementById("dismiss-popup-btn1").addEventListener("click", function () {
    document.getElementsByClassName("popup1")[0].classList.remove("active");
    if (account_detail != null) {
        socket.emit('res', {
            scoreP: scorePlay,
            scoreC: scoreComp,
            data: account_detail,
            game: 'Multi'
        })
    }
    location.reload()
});

//newGame()


function loop() {
    drawBoard()
    drawSquares()
    drawdots()
    drawScore()
}

function handleinit(number) {
    playerNum = number
    if (playerNum == 1) playersTurn = false
    console.log(playerNum)
    if (playerNum == 2) {
        playersTurn = false
        alert('You are Player2')
    }
}

function handleGameCode(gameCode) {
    gameCodedisplay.innerHTML = gameCode
    maincode = gameCode
    // document.querySelector(".heading2").innerHTML = gameCode.n
}

function handle(gameCode) {
    gameCodedisplay.innerText = gameCode.room
    maincode = gameCode.room
    gamestart = true
    console.log('haha')
    document.querySelector(".heading2").innerHTML = gameCode.n
    document.getElementById('code').style.display = 'none'
    document.getElementById('gameCodeDisplay').style.width = '100%'
    document.getElementById('gameCodeDisplay').style.color = 'white'
    document.getElementById('gameCodeDisplay').style.marginLeft = '20px'
    document.getElementById('gameCodeDisplay').style.borderRadius = '20px'
    gameCodedisplay.style.fontSize = '30px'
    gameCodedisplay.style.fontWeight = '900'

    // gameCodedisplay.innerHTML = playersTurn == true ? "YourTurn" : "EnemyTurn"
}

function restart() {
    location.reload()
}

function exit() {
    if (account_detail != null) {
        location.replace("../../singleplayer/main.html")
    } else {
        location.replace('../../singleplayer/guest.html')
    }
}


function handleunkowngame() {
    alert('unknown game code')
    location.reload()
}

function handletoomany() {
    alert("already going")
    location.reload()
}


function handleFire(id) {
    highlightSide(id.x1, id.y1)
    selectSide()
}



function join() {
    const code = gameCodeInput.value
    let secplayer = {
        player: n,
        room: code
    }

    socket.emit('joingame', secplayer)
    newGame()
    setInterval(loop, 1000 / FPS)
}

function create() {
    socket.emit('newgame', n)
    newGame()
    setInterval(loop, 1000 / FPS)
}

function handleName(n4) {
    if (maincode == n4.room) {
        console.log(n4)
        document.querySelector(".heading2").innerHTML = n4.player
        alert("Player '" + n4.player + "' has joined the room")
        playersTurn = true
        gamestart = true
        //document.getElementById('gameCodeDisplay').style.color = 'black'
        document.getElementById('code').style.display = 'none'
        document.getElementById('gameCodeDisplay').style.width = '100%'
        document.getElementById('gameCodeDisplay').style.color = 'white'
        gameCodedisplay.style.fontSize = '30px'
        gameCodedisplay.style.fontWeight = '900'
        document.getElementById('gameCodeDisplay').style.marginLeft = '20px'
        document.getElementById('gameCodeDisplay').style.borderRadius = '20px'
        //gameCodedisplay.innerHTML = playersTurn == true ? "YourTurn" : "EnemyTurn"
    }
}

var grd = ctx.createLinearGradient(170, 0, 170, 0)
grd.addColorStop(0, "#f6d365")
grd.addColorStop(1, "#fda085")

function drawBoard() {
    ctx.fillStyle = grd
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
            drawCircles(cellsize * (i + 1), margin + cellsize * (j + 1)) //i+1 and j+1 is to avoid getting at intital positions
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
    if (gamestart == true) {
        document.getElementById('gameCodeDisplay').innerHTML = playersTurn ? "Your Turn" : "Enemy's Turn"
    }
    colswitchplay.style.setProperty("--play-val", colPlay)
    colswitchcomp.style.setProperty("--comp-val", colComp)
    if (timeEnd > 0) {
        timeEnd--;
        document.getElementsByClassName("popup1")[0].classList.add("active");
        document.getElementById("Player").innerHTML = "PlayerScore: " + scorePlay
        document.getElementById("Computer").innerHTML = "EnemyScore: " + scoreComp
        if (scoreComp == scorePlay) {
            document.getElementById("result-mode").innerHTML = "Draw!"
        } else {
            let playerWins = scorePlay > scoreComp
            let text = playerWins ? n : "Enemy"
            document.getElementById("result-mode").innerHTML = text + " Wins!"
        }
    }

    /*
    let colPlay = playersTurn ? "crimson" : "lightpink"
    let colComp = playersTurn ? "lightsteelblue" : "royalblue"

    drawText("Player", width * 0.25, margin * 0.35, colPlay, 25)
    drawText("Computer", width * 0.75, margin * 0.35, colComp, 25)
    drawText(scorePlay, width * 0.25, margin * 0.55, colPlay, 30)
    drawText(scoreComp, width * 0.75, margin * 0.55, colComp, 30)
    if (timeEnd > 0) {
        //console.log(timeEnd)
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
document.getElementById('dismiss-popup-btn2').addEventListener('click', (e) => {
    if (account_detail != null) {
        socket.emit('res', {
            scoreP: scorePlay,
            scoreC: scoreComp,
            data: account_detail,
            game: 'Multi'
        })
        location.replace("../../singleplayer/main.html")
    } else {
        location.replace('../../singleplayer/guest.html')
    }

})

function highlightGrid( /** @type {MouseEvent} */ ev) {
    if (timeEnd > 0) {
        return
    }
    // get mouse position relative to the canvas
    let x = ev.clientX - canvRect.left;
    let y = ev.clientY - canvRect.top;

    // highlight the square's side
    //highlightSide(x, y);
}

function click( /** @type {MouseEvent} */ ev) {
    if (timeEnd > 0) {
        return
    }
    let x = ev.clientX - canvRect.left;
    let y = ev.clientY - canvRect.top;
    //console.log(x, y)
    let id = {
        x1: x,
        y1: y,
        room: maincode,
        playnum: playerNum,
    }

    if (playersTurn == true) {
        document.getElementById('code').style.color = 'black'
        //document.getElementById('gameCodeDisplay').style.color = 'white'
        // gameCodedisplay.innerHTML = "EnemyTurn"
        highlightSide(id.x1, id.y1)
        selectSide()
        socket.emit('fire', id)
    }
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
    ctx.font = size + "px dejavu sans mono"
    ctx.fillText(text, x, y)
}

function getText(player, small) {
    if (player) {
        return small ? "P" : "Player"
    } else {
        return small ? "E" : "Computer"
    }
}
//console.log(playersTurn)

function getColor(player, light) {
    if (player) {
        return light ? "rgb(0, 255, 115)" : "rgb(255, 0, 76)"; //player
    } else {
        return light ? "rgb(217, 176, 255)" : "rgb(132, 0, 255)"; //computer
    }
}


function newGame() {
    timeEnd = 0
    currentCells = []
    playersTurn = true
    //console.log(playersTurn)
    scoreComp = 0
    scorePlay = 0
    // set up the squares
    squares = [];
    for (let i = 0; i < gridSize - 1; i++) {
        squares[i] = [];
        for (let j = 0; j < gridSize - 1; j++) {
            squares[i][j] = new Square(cellsize * (j + 1), margin + cellsize * (i + 1), cellsize, cellsize); //very important
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
        //console.log(playersTurn)
    }
}

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
        drawText(getText(this.owner, true), this.left + this.w / 2, this.top + this.h / 2, getColor(this.owner, false), 20)

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