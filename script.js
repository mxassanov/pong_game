// Canvas
const { body } = document
const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')
const width = 500
const height = 700
const screenWidth = window.screen.width
const canvasPosition = screenWidth / 2 - width / 2
const isMobile = window.matchMedia('(max-width: 600px)')
const gameOverEl = document.createElement('div')

// Весло
const paddleHeight = 10
const paddleWidth = 50
const paddleDiff = 25
let paddleBottomX = 225
let paddleTopX = 225
let playerMoved = false
let paddleContact = false

// Мяч
let ballX = 250
let ballY = 350
const ballRadius = 5

// Скорость
let speedY
let speedX
let trajectoryX
let computerSpeed

// Меняем настройки на смартфонах
if (isMobile.matches) {
  speedY = -2
  speedX = speedY
  computerSpeed = 4
} else {
  speedY = -1
  speedX = speedY
  computerSpeed = 3
}

// Счёт
let playerScore = 0
let computerScore = 0
const winningScore = 5
let isGameOver = true
let isNewGame = true

// Рисуем всё на холсте
function renderCanvas() {
  // Фон Canvas
  context.fillStyle = 'black'
  context.fillRect(0, 0, width, height)
  // Цвет вёсел
  context.fillStyle = 'white'
  // Весло игрока (Снизу)
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight)
  // Весло компьютера (Вверху)
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight)
  // Пунктирная линия посередине
  context.beginPath()
  context.setLineDash([4])
  context.moveTo(0, 350)
  context.lineTo(500, 350)
  context.strokeStyle = 'grey'
  context.stroke()
  // Мяч
  context.beginPath()
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false)
  context.fillStyle = 'white'
  context.fill()
  // Счёт
  context.font = '32px Courier New'
  context.fillText(playerScore, 20, canvas.height / 2 + 50)
  context.fillText(computerScore, 20, canvas.height / 2 - 30)
}

// Создаём элемент Canvas
function createCanvas() {
  canvas.width = width
  canvas.height = height
  body.appendChild(canvas)
  renderCanvas()
}

// Возвращаем мяч в центр
function ballReset() {
  ballX = width / 2
  ballY = height / 2
  speedY = -3
  paddleContact = false
}

// Регулируем движение мяча
function ballMove() {
  // Вертикальная скорость
  ballY += -speedY
  // Горизонтальная скорость
  if (playerMoved && paddleContact) {
    ballX += speedX
  }
}

// Определяем отскок мяча, набор очков, сброс значений
function ballBoundaries() {
  // Отскок от левой стены
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX
  }
  // Отскок от правой стены
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Отскок от весла игрока (снизу)
  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true
      // Добавляем скорость отскока
      if (playerMoved) {
        speedY -= 1
        // Макс скорость
        if (speedY < -5) {
          speedY = -5
          computerSpeed = 6
        }
      }
      speedY = -speedY
      trajectoryX = ballX - (paddleBottomX + paddleDiff)
      speedX = trajectoryX * 0.3
    } else if (ballY > height) {
      // Сброс значений мяча, добавляем очки компьютеру
      ballReset()
      computerScore++
    }
  }
  // Отскок от весла компьютера (сверху)
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      // Добавляем скорость отскока
      if (playerMoved) {
        speedY += 1
        // Макс скорость
        if (speedY > 5) {
          speedY = 5
        }
      }
      speedY = -speedY
    } else if (ballY < 0) {
      // Сброс значений мяча, добавляем очки игроку
      ballReset()
      playerScore++
    }
  }
}

// Движение компьютера
function computerAI() {
  if (playerMoved) {
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed
    } else {
      paddleTopX -= computerSpeed
    }
  }
}

function showGameOverEl(winner) {
  // Прячем Canvas
  canvas.hidden = true
  // Контейнер итогового счёта
  gameOverEl.textContent = ''
  gameOverEl.classList.add('game-over-container')
  
  const title = document.createElement('h1')
  title.textContent = `${winner} Победил!`
  
  const playAgainBtn = document.createElement('button')
  playAgainBtn.setAttribute('onclick', 'startGame()')
  playAgainBtn.textContent = 'Сыграть снова'
  
  gameOverEl.append(title, playAgainBtn)
  body.appendChild(gameOverEl)
}

// Проверяем счёт и заканчиваем игру
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true
    // Устанавливаем победителя
    const winner = playerScore === winningScore ? 'Игрок' : 'Компьютер'
    showGameOverEl(winner)
  }
}

// Вызываем в каждом кадре
function animate() {
  renderCanvas()
  ballMove()
  ballBoundaries()
  computerAI()
  gameOver()
  // Запускаем анимацию на скорости 60 кадров в секунду
  if (!isGameOver) window.requestAnimationFrame(animate)
}

// Старт игры, сброс всего
function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl)
    canvas.hidden = false
  }
  isGameOver = false
  isNewGame = false
  playerScore = 0;
  computerScore = 0
  ballReset()
  createCanvas()
  animate()
  canvas.addEventListener('mousemove', e => {
    playerMoved = true
    // Компенсируем центрирование холста для получения координат мыши
    paddleBottomX = e.clientX - canvasPosition - paddleDiff
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth
    }
    // Прячем курсор
    canvas.style.cursor = 'none'
  })
}


startGame()