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

// gọi 2 hàm này để render ra trình duyệt
initGrid();
renderBoard();