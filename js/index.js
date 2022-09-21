const levelSelector = document.querySelector('#game-level select')

// dom
const mineSweeper = document.querySelector('#minesweeper-box')
const field = document.querySelector('#field tbody')
const gameTime = document.querySelector('#game-time input')
const remainingMines = document.querySelector('#mine-counter input')
const restart = document.querySelector('#reset')

// 游戏数据
let level = 'elementary'
let fieldWidth = 9 // 雷区宽度
let fieldHeight = 9 // 雷区高度
let mineCount = 10 // 地雷数量

let timer = null
let startTime
let endTime
let openedCount = 0
let markedCount = 0

// 重置时间和地雷数量
function resetControl() {
  gameTime.value = '0'
  remainingMines.value = mineCount
}

// 初始化雷区
function initField() {
  // 创建雷区
  const { className, classList } = mineSweeper
  if (className.includes('fail')) classList.remove('fail')
  if (className.includes('over')) classList.remove('over')
  field.innerHTML = ''
  for (let y = 0; y < fieldHeight; y++) {
    let rowHtml = `<tr>`
    for (let x = 0; x < fieldWidth; x++) {
      rowHtml += `<td class="square row-${y} col-${x}" data-x="${x}" 
      data-y="${y}"></td>`
    }
    field.innerHTML += rowHtml + '</tr>'
  }
  // 生成地雷
  initMine()
  resetControl()
}

/**
 * 获取方块相邻坐标
 * @param {number} x 当前方块x坐标
 * @param {number} y 当前方块y坐标
 * @returns {Array} 相邻坐标
 */
function getNeighbor(x, y) {
  const neighbors = []
  for (let y1 = y - 1; y1 <= y + 1; y1++) {
    if (y1 < 0 || y1 >= fieldHeight) continue
    for (let x1 = x - 1; x1 <= x + 1; x1++) {
      if (x1 < 0 || x1 >= fieldWidth) continue
      if (x1 === x && y1 === y) continue
      neighbors.push([x1, y1])
    }
  }
  return neighbors
}

// 生成地雷
function initMine() {
  let count = mineCount
  while (count > 0) {
    const x = Math.floor(Math.random() * fieldWidth)
    const y = Math.floor(Math.random() * fieldHeight)
    // 重复判断
    const mine = document.querySelector(`.square.row-${y}.col-${x}`)
    if (!mine.className.includes('mine')) {
      mine.classList.add('mine')
      mine.innerText = ''
      const { x, y } = mine.dataset
      const neighbors = getNeighbor(Number(x), Number(y))
      neighbors.forEach(([x1, y1]) => {
        const neighbor = field.querySelector(`.square.row-${y1}.col-${x1}`)
        neighbor.innerText = Number(neighbor.innerText) + 1
      })
      count--
    }
  }
}

// 切换游戏难度
function changeLevel(e) {
  level = e.target.value
  gameOver()
  if (level !== 'customize') {
    switch (level) {
      case 'advanced':
        fieldWidth = 30
        fieldHeight = 16
        mineCount = 99
        break
      case 'intermediate':
        fieldWidth = 16
        fieldHeight = 16
        mineCount = 40
        break
      default:
        fieldWidth = 9
        fieldHeight = 9
        mineCount = 10
        break
    }
    initField()
    return
  }
  // 自定义难度
  dialog.openDialog().then(res => {
    const { width, height, mine } = res
    fieldWidth = width
    fieldHeight = height
    mineCount = mine
    initField()
  })
}

/**
 * 打开方块
 * @param {Element} square
 * @returns
 */
function openSquare(square) {
  const className = square.className
  if (className.includes('opened') || className.includes('marked')) return
  if (className.includes('mine')) {
    // Game Over
    mineSweeper.classList.add('fail')
    // field.classList.add('fail')
    square.classList.add('stepon')
    gameOver()
    setTimeout(() => alert('你踩雷了！！！'), 100)
    return
  }
  // 打开方块
  square.classList.add('opened')
  openedCount++
  // 递归打开
  if (square.innerText === '') {
    const { x, y } = square.dataset
    const neighbors = getNeighbor(Number(x), Number(y))
    neighbors.forEach(([x, y]) => {
      const neighbor = field.querySelector(`.square.col-${x}.row-${y}`)
      const className = neighbor.className
      if (className.includes('marked') || className.includes('opened')) return
      openSquare(neighbor)
    })
  }
}

/**
 * 标记地雷
 * @param {Element} mine
 */
function markMine(mine) {
  if (mine.className.includes('opened')) return
  mine.classList.toggle('marked')
  if (mine.className.includes('marked')) {
    markedCount++
    remainingMines.value = Number(remainingMines.value) - 1
    return
  }
  markedCount--
  remainingMines.value = Number(remainingMines.value) + 1
}

/**
 * 双击操作
 * @param {Element} square 方块
 */
function doubleClick(square) {
  const { x, y } = square.dataset
  const neighbors = getNeighbor(Number(x), Number(y))
  let neighborMarked = 0
  const neighborEles = []
  // 标记的数量
  neighbors.forEach(([x1, y1]) => {
    const neighbor = field.querySelector(`.square.col-${x1}.row-${y1}`)
    const isMarked = neighbor.className.includes('marked')
    if (!isMarked && !neighbor.className.includes('opened')) {
      neighborEles.push(neighbor)
    } else if (isMarked) {
      neighborMarked++
    }
  })
  if (neighborMarked === Number(square.innerText)) {
    neighborEles.forEach(neighbor => {
      openSquare(neighbor)
    })
  }
}

/**
 * 游戏结束
 */
function gameOver() {
  clearInterval(timer)
  timer = null
  openedCount = 0
  markedCount = 0
}

window.onload = function () {
  initField()

  // 切换难度
  levelSelector.oninput = changeLevel

  // 重新开始
  restart.addEventListener('click', function () {
    clearInterval(timer)
    timer = null
    initField()
  })

  // 游戏操作
  field.addEventListener('mousedown', function (e) {
    const isFail = mineSweeper.className.includes('fail')
    const isOver = mineSweeper.className.includes('over')
    if (isFail || isOver) return

    const target = e.target
    if (target.nodeName.toLowerCase() != 'td') return
    if (timer === null) {
      startTime = new Date().getTime()
      timer = setInterval(() => {
        const currentTime = new Date().getTime()
        gameTime.value = Math.floor((currentTime - startTime) / 1000)
      }, 1000)
    }
    // 判断操作
    if (e.button === 0) {
      if (!target.className.includes('opened')) {
        openSquare(target)
      } else {
        doubleClick(target)
      }
    } else if (e.button === 2) {
      markMine(target)
    }
    // 游戏是否通关
    const squareCount = fieldHeight * fieldWidth
    if (openedCount + markedCount === squareCount) {
      endTime = Date.now()
      const timeLen = endTime - startTime
      const min = Math.floor(timeLen / 60000)
      const sec = Math.floor((timeLen % 60000) / 1000)
      gameOver()
      mineSweeper.classList.add('over')
      // 游戏时间
      setTimeout(
        () => alert(`游戏结束，用时${min ? min + '分' : ''}${sec}秒`),
        100
      )
    }
  })
  // 禁用右键菜单
  field.addEventListener('contextmenu', function (e) {
    e.preventDefault()
  })
}
