var soCot = 16;
var soDong = 9;
var game = document.getElementById("game");

var tongDong = soDong + 2;
var tongCot = soCot + 2;

var icons = ["", "⚡", "🐲", "🐢", "🦊", "🦉", "🐸", "🐼", "🦄", "🐵", "🐶", "🐱", "🐥"];

var banCo = [];
var r1 = -1, c1 = -1;
var r2 = -1, c2 = -1;
var remain = soCot * soDong;
var level = 1;

var latR1 = -1, latC1 = -1;
var latR2 = -1, latC2 = -1;
var isLock = 0;
var hintCount = 3;//3 trợ giup
var shuffleCount = 3;
var hintR1 = -1, hintC1 = -1;
var hintR2 = -1, hintC2 = -1;

initBoard(level);
initUI();
render();

function doiManChoi(man) {
    level = parseInt(man);
    choiLai();
}

function choiLai() {
    r1 = -1; c1 = -1;
    r2 = -1; c2 = -1;
    latR1 = -1; latC1 = -1;
    latR2 = -1; latC2 = -1;
    isLock = 0;
    hintCount = 3;
    shuffleCount = 3;
    hintR1 = -1;
    hintC1 = -1;
    hintR2 = -1;
    hintC2 = -1;
    document.getElementById("hintCount").innerText = hintCount;
    document.getElementById("shuffleCount").innerText = shuffleCount;
    remain = soCot * soDong;
    document.getElementById("remain").innerText = remain;
    if (level === 4 || level === 5) {
        game.innerHTML = "";
        return;
    }
    initBoard(level);
    initUI();
    render();
}

function initBoard(man) {
    for (var i = 0; i < tongDong; i++) {
        banCo[i] = [];
        for (var j = 0; j < tongCot; j++) {
            banCo[i][j] = 0;
        }
    }

    var temp = [];
    var soLoai = icons.length - 1;
    var tong = soCot * soDong;

    for (var i = 0; i < tong; i++) {
        temp[i] = (i % soLoai) + 1;
    }

    for (var i = 0; i < tong; i++) {
        var vt = Math.floor(Math.random() * tong);
        var t = temp[i];
        temp[i] = temp[vt];
        temp[vt] = t;
    }

    var k = 0;
    for (var i = 1; i <= soDong; i++) {
        for (var j = 1; j <= soCot; j++) {
            banCo[i][j] = temp[k];
            k++;
        }
    }
}

function initUI() {
    game.innerHTML = "";
    for (var i = 1; i <= soDong; i++) {
        var tr = document.createElement("tr");
        for (var j = 1; j <= soCot; j++) {
            var td = document.createElement("td");
            td.id = "cell_" + i + "_" + j;
            td.className = "cell";
            td.setAttribute("onclick", "clickCell(" + i + "," + j + ")");
            tr.appendChild(td);
        }
        game.appendChild(tr);
    }
}

function clickCell(d, c) {
    if (banCo[d][c] === 0 || isLock === 1) return;

    if (r1 === -1 && c1 === -1) {
        r1 = d;
        c1 = c;
        if (level === 3) {
            latR1 = d;
            latC1 = c;
        }
    } else {
        if (r1 === d && c1 === c) {
            r1 = -1; c1 = -1;
            latR1 = -1; latC1 = -1;
        } else {
            r2 = d;
            c2 = c;
            if (level === 3) {
                latR2 = d;
                latC2 = c;
            }

            if (banCo[r1][c1] === banCo[r2][c2] && checkPath(r1, c1, r2, c2)) {
                banCo[r1][c1] = 0;
                banCo[r2][c2] = 0;

                r1 = -1; c1 = -1;
                r2 = -1; c2 = -1;
                latR1 = -1; latC1 = -1;
                latR2 = -1; latC2 = -1;

                remain = remain - 2;
                document.getElementById("remain").innerText = remain;

                if (level === 2) shiftDown();

                if (remain === 0) alert("Ban da thang game!");
            } else {
                if (level === 3) {
                    render();
                    isLock = 1;
                    setTimeout(function() {
                        r1 = -1; c1 = -1;
                        r2 = -1; c2 = -1;
                        latR1 = -1; latC1 = -1;
                        latR2 = -1; latC2 = -1;
                        isLock = 0;
                        render();
                    }, 600);
                    return;
                } else {
                    r1 = d;
                    c1 = c;
                    r2 = -1; c2 = -1;
                }
            }
        }
    }
    render();
}

function render() {
    for (var i = 1; i <= soDong; i++) {
        for (var j = 1; j <= soCot; j++) {
            var cell = document.getElementById("cell_" + i + "_" + j);
            if (cell === null) continue;
            var val = banCo[i][j];

            if (val === 0) {
                cell.innerHTML = "";
                cell.className = "cell empty";
                cell.style.backgroundColor = "";
            } else {
                cell.className = "cell";
                cell.style.backgroundColor = "";

                if (level === 3) {
                    if ((i === latR1 && j === latC1) ||
                        (i === latR2 && j === latC2)) {
                        cell.innerHTML = icons[val];
                        cell.classList.add("flipped");
                    } else {
                        cell.innerHTML = "?";
                        cell.classList.add("covered");
                    }
                } else {
                    cell.innerHTML = icons[val];

                    if (i === r1 && j === c1) {
                        cell.classList.add("selected");
                    }
                }

                if ((i === hintR1 && j === hintC1) ||
                    (i === hintR2 && j === hintC2)) {
                    cell.style.backgroundColor = "lightgreen";
                }
            }
        }
    }
}

function checkLine(d1, c1, d2, c2) {
    if (d1 !== d2 && c1 !== c2) return false;
    if (d1 === d2) {
        var minC = Math.min(c1, c2);
        var maxC = Math.max(c1, c2);
        for (var c = minC + 1; c < maxC; c++) {
            if (banCo[d1][c] !== 0) return false;
        }
        return true;
    }
    if (c1 === c2) {
        var minD = Math.min(d1, d2);
        var maxD = Math.max(d1, d2);
        for (var d = minD + 1; d < maxD; d++) {
            if (banCo[d][c1] !== 0) return false;
        }
        return true;
    }
    return false;
}

function checkL(d1, c1, d2, c2) {
    if (banCo[d1][c2] === 0 && checkLine(d1, c1, d1, c2) && checkLine(d1, c2, d2, c2)) return true;
    if (banCo[d2][c1] === 0 && checkLine(d1, c1, d2, c1) && checkLine(d2, c1, d2, c2)) return true;
    return false;
}

function checkPath(d1, c1, d2, c2) {
    if (checkLine(d1, c1, d2, c2)) return true;
    if (checkL(d1, c1, d2, c2)) return true;

    for (var c = 0; c < tongCot; c++) {
        if ((c === c1 || banCo[d1][c] === 0) && (c === c2 || banCo[d2][c] === 0)) {
            if (checkLine(d1, c1, d1, c) && checkLine(d1, c, d2, c) && checkLine(d2, c, d2, c2)) {
                return true;
            }
        }
    }

    for (var d = 0; d < tongDong; d++) {
        if ((d === d1 || banCo[d][c1] === 0) && (d === d2 || banCo[d][c2] === 0)) {
            if (checkLine(d1, c1, d, c1) && checkLine(d, c1, d, c2) && checkLine(d, c2, d2, c2)) {
                return true;
            }
        }
    }
    return false;
}

function shiftDown() {
    for (var j = 1; j <= soCot; j++) {
        for (var i = soDong; i >= 1; i--) {
            if (banCo[i][j] === 0) {
                for (var k = i - 1; k >= 1; k--) {
                    if (banCo[k][j] !== 0) {
                        banCo[i][j] = banCo[k][j];
                        banCo[k][j] = 0;
                        break;
                    }
                }
            }
        }
    }
}
function goiY() {
    if (hintCount <= 0 || isLock === 1) return;

    for (var i = 1; i <= soDong; i++) {
        for (var j = 1; j <= soCot; j++) {
            if (banCo[i][j] !== 0) {
                for (var d = 1; d <= soDong; d++) {
                    for (var c = 1; c <= soCot; c++) {
                        if (banCo[d][c] !== 0 && (i !== d || j !== c)) {
                            if (banCo[i][j] === banCo[d][c] &&
                                checkPath(i, j, d, c)) {

                                hintR1 = i;
                                hintC1 = j;
                                hintR2 = d;
                                hintC2 = c;

                                hintCount--;
                                document.getElementById("hintCount").innerText = hintCount;

                                render();

                                setTimeout(function() {
                                    hintR1 = -1;
                                    hintC1 = -1;
                                    hintR2 = -1;
                                    hintC2 = -1;
                                    render();
                                }, 1000);

                                return;
                            }
                        }
                    }
                }
            }
        }
    }

    alert("Khong tim thay cap o hop le!");
}
function xaoTron() {
    if (shuffleCount <= 0 || isLock === 1) return;

    var temp = [];

    for (var i = 1; i <= soDong; i++) {
        for (var j = 1; j <= soCot; j++) {
            if (banCo[i][j] !== 0) {
                temp.push(banCo[i][j]);
            }
        }
    }

    if (temp.length === 0) return;

    for (var i = 0; i < temp.length; i++) {
        var vt = Math.floor(Math.random() * temp.length);

        var t = temp[i];
        temp[i] = temp[vt];
        temp[vt] = t;
    }

    var k = 0;

    for (var i = 1; i <= soDong; i++) {
        for (var j = 1; j <= soCot; j++) {
            if (banCo[i][j] !== 0) {
                banCo[i][j] = temp[k];
                k++;
            }
        }
    }

    shuffleCount--;

    document.getElementById("shuffleCount").innerText = shuffleCount;

    r1 = -1;
    c1 = -1;
    r2 = -1;
    c2 = -1;

    hintR1 = -1;
    hintC1 = -1;
    hintR2 = -1;
    hintC2 = -1;

    render();
}
