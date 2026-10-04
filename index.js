// Kích cỡ bàn game
const colBoard = 16; // 16 cột
const rowBoard = 9;  // 9 hàng

// Viền bao quanh bàn cờ
const cols = colBoard + 2; // 18 cột
const rows = rowBoard + 2; // 11 hàng

// Cấu hình thông số mặc định
let grid = [];
let first_selected = null;
let score = 0;

// Lấy phần tử từ HTML vào js để render
const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const btnReset = document.getElementById("btnReset");
const levelSelect = document.getElementById("levelSelect");
let currentLevel = 1;

// Khởi tạo giá trị màu
const colors = [
    "#e74c3c", // Đỏ
    "#3498db", // Xanh dương
    "#2ecc71", // Xanh lá
    "#f1c40f", // Vàng
    "#9b59b6", // Tím
    "#e67e22", // Cam
    "#1abc9c", // Ngọc
    "#34495e", // Xám đậm
    "#fd79a8", // Hồng
    "#6c5ce7"  // Xanh tím
];

// Khởi tạo bàn cờ
function initGrid() {
    let totalPlayCells = colBoard * rowBoard; // 16 * 9 = 144 ô
    let numPairs = totalPlayCells / 2;        // 72 cặp

    let activeColors = [];
    let numColorsToUse = colors.length;

    if (currentLevel === 2) {
        numColorsToUse = colors.length;
    } else if (currentLevel === 3) {
        numColorsToUse = colors.length;
    }

    for (let i = 0; i < numColorsToUse; i++) {
        activeColors.push(colors[i]);
    }

    let pool = [];
    for (let i = 0; i < numPairs; i++) {
        let color = activeColors[i % activeColors.length];
        pool.push(color);
        pool.push(color);
    }

    // Xáo trộn màu phần tử
    for (let i = pool.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        //tráo mảng
        let temp = pool[i];
        pool[i] = pool[j];
        pool[j] = temp;
    }

    // Gán vào ma trận thực tế
    grid = [];
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = 0;
        }
    }
    let poolIndex = 0;
    for (let r = 1; r <= rowBoard; r++) {
        for (let c = 1; c <= colBoard; c++) {
            grid[r][c] = pool[poolIndex];
            poolIndex++;
        }
    }
}

// Bắt sự kiện khi người dùng chọn đổi màn chơi
levelSelect.addEventListener("change", function() {
    currentLevel = parseInt(levelSelect.value);
    score = 0;
    scoreElement.textContent = score;
    first_selected = null;
    initGrid();
    renderBoard();
});

// Render giao diện
function renderBoard() {
    boardElement.innerHTML = "";
    for (let r = 1; r <= rowBoard; r++) {
        for (let c = 1; c <= colBoard; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.r = r;
            cell.dataset.c = c;

            if (grid[r][c] === 0) {
                cell.classList.add("empty");
            } else {
                cell.style.backgroundColor = grid[r][c];
                cell.addEventListener("click", () => handleCellClick(r, c, cell));
            }
            boardElement.appendChild(cell);
        }
    }
}

// Dồn ô tụt xuống dưới đáy (chỉ áp dụng cho Màn 2)
function applyGravity() {
    if (currentLevel !== 2) {
        return;
    }

    for (let c = 1; c <= colBoard; c++) {
        let colValues = [];
        for (let r = 1; r <= rowBoard; r++) {
            if (grid[r][c] !== 0) {
                colValues.push(grid[r][c]);
            }
        }

        let index = colValues.length - 1;
        for (let r = rowBoard; r >= 1; r--) {
            if (index >= 0) {
                grid[r][c] = colValues[index];
                index--;
            } else {
                grid[r][c] = 0;
            }
        }
    }
}

// Xử lý khi click chuột vào ô
function handleCellClick(r, c, cellElement) {
    if (grid[r][c] === 0) return;

    // Chưa chọn ô nào
    if (!first_selected) {
        first_selected = { r, c, el: cellElement };
        cellElement.classList.add("selected");
        return;
    }

    // Click lại = hủy chọn
    if (first_selected.r === r && first_selected.c === c) {
        first_selected.el.classList.remove("selected");
        first_selected = null;
        return;
    }

    const p1 = { r: first_selected.r, c: first_selected.c };
    const p2 = { r, c };

    // So sánh khớp màu và tìm đường nối hợp lệ
    if (grid[p1.r][p1.c] === grid[p2.r][p2.c] && canConnect(p1, p2)) {
        grid[p1.r][p1.c] = 0;
        grid[p2.r][p2.c] = 0;

        // Dồn ô nếu ở màn 2
        applyGravity();

        score += 10;
        scoreElement.textContent = score;

        first_selected = null;

        renderBoard();
        checkWin();
    } else {
        first_selected.el.classList.remove("selected");
        first_selected = { r, c, el: cellElement };
        cellElement.classList.add("selected");
    }
}

// Thuật toán tìm đường nối (tối đa 2 góc cua)
function checkLine(r1, c1, r2, c2) {
    if (r1 !== r2 && c1 !== c2) {
        return false;
    }

    // Nếu cùng hàng: kiểm tra các ô ở giữa theo cột
    if (r1 === r2) {
        let minC = c1 < c2 ? c1 : c2;
        let maxC = c1 > c2 ? c1 : c2;
        for (let c = minC + 1; c < maxC; c++) {
            if (grid[r1][c] !== 0) {
                return false;
            }
        }
        return true;
    }

    // Nếu cùng cột: kiểm tra các ô ở giữa theo hàng
    if (c1 === c2) {
        let minR = r1 < r2 ? r1 : r2;
        let maxR = r1 > r2 ? r1 : r2;
        for (let r = minR + 1; r < maxR; r++) {
            if (grid[r][c1] !== 0) {
                return false;
            }
        }
        return true;
    }

    return false;
}

// Kiểm tra đường gấp khúc 1 lần (chữ L)
function checkL(r1, c1, r2, c2) {
    if (grid[r1][c2] === 0) {
        if (checkLine(r1, c1, r1, c2) && checkLine(r1, c2, r2, c2)) {
            return true;
        }
    }

    if (grid[r2][c1] === 0) {
        if (checkLine(r1, c1, r2, c1) && checkLine(r2, c1, r2, c2)) {
            return true;
        }
    }

    return false;
}

// Kiểm tra đường gấp khúc quá đường => không ăn được
function checkZandU(r1, c1, r2, c2) {
    for (let c = 0; c < cols; c++) {
        if (c !== c1 && grid[r1][c] === 0) {
            if (checkLine(r1, c1, r1, c)) {
                if (checkLine(r1, c, r2, c2) || checkL(r1, c, r2, c2)) {
                    return true;
                }
            }
        }
    }
    for (let r = 0; r < rows; r++) {
        if (r !== r1 && grid[r][c1] === 0) {
            if (checkLine(r1, c1, r, c1)) {
                if (checkLine(r, c1, r2, c2) || checkL(r, c1, r2, c2)) {
                    return true;
                }
            }
        }
    }

    return false;
}

// Hàm gọi kiểm tra chính
function canConnect(start, end) {
    let r1 = start.r;
    let c1 = start.c;
    let r2 = end.r;
    let c2 = end.c;

    if (checkLine(r1, c1, r2, c2)) {
        return true;
    }
    if (checkL(r1, c1, r2, c2)) {
        return true;
    }
    if (checkZandU(r1, c1, r2, c2)) {
        return true;
    }

    return false;
}

// Kiểm tra thắng cuộc
function checkWin() {
    for (let r = 1; r <= rowBoard; r++) {
        for (let c = 1; c <= colBoard; c++) {
            if (grid[r][c] !== 0) {
                return;
            }
        }
    }
    setTimeout(function() {
        alert("Chiến thắng!");
    }, 100);
}

// Nút chơi lại
if (btnReset) {
    btnReset.addEventListener("click", () => {
        score = 0;
        scoreElement.textContent = score;
        first_selected = null;
        initGrid();
        renderBoard();
    });
}

// gọi 2 hàm này để render ra trình duyệt
initGrid();
renderBoard();