const {remote} = require('electron')


// Top bar button functions------------------------------
document.querySelector('#close').onclick = () => {
	remote.getCurrentWindow().close();
}


document.querySelector('#reload').onclick = () => {
	window.location.reload();
}

// Code for game-----------------------------------------

// Global variables--------------------------------------
let player
let enemies = []
let point
let scoreManager
const spawnDelay = 100
const spawnOffset = 150
const leaseScore = 10
const pointScore = 100
const scoreDelay = 1000

const game = {
	canvas : document.createElement('canvas'),
	init() {
		this.context = this.canvas.getContext('2d')
		this.canvas.height = 600
		this.canvas.width = 900
		document.body.appendChild(this.canvas)
		this.updateInterval = setInterval(Update, 20)
		this.spawnInterval = setInterval(spawnEnemies, spawnDelay)
		this.scoreInterval = setInterval(() => {scoreManager.update(leaseScore)}, scoreDelay)
		window.addEventListener('keydown', event => {
			game.keys = (game.keys || [])
			game.keys[event.keyCode] = true
		})
		window.addEventListener('keyup', event => {
			game.keys[event.keyCode] = false
		})
	},
	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
	},
	over() {
		clearInterval(this.updateInterval)
		clearInterval(this.spawnInterval)
		clearInterval(this.scoreInterval)
	}
}

// Classes-----------------------------------------------
class Enemy{
	constructor(spawnX, spawnY){
		this.x = spawnX
		this.y = spawnY
		this.moveSpeed = 3
		this.speedX = Math.random() * this.moveSpeed * ((Math.floor(Math.random() * 2)) ? 1 : -1)
		this.speedY = Math.random() * this.moveSpeed * ((Math.floor(Math.random() * 2)) ? 1 : -1)
		this.color = 'lightblue'
		this.size = 10
	}
	update(){
		this.x += this.speedX
		this.y += this.speedY
		game.context.fillStyle = this.color
		game.context.fillRect(this.x, this.y, this.size, this.size)
		if(player.hasCollidedWith(this))
			game.over()
	}
	outOfCanvas(){
		if(this.x < 0 || (this.x + this.size) > game.canvas.width || this.y < 0 || (this.y + this.size) > game.canvas.height)
			return true
		return false
	}
}

class Point{
	constructor(){
		this.relocate()
		this.color = 'yellow'
		this.size = 10
	}
	update(){
		game.context.fillStyle = this.color
		game.context.fillRect(this.x, this.y, this.size, this.size)

		if(player.hasCollidedWith(this)){
			scoreManager.update(pointScore)
			this.relocate()
		}
	}
	relocate(){
		this.x = Math.random() * game.canvas.width
		this.y = Math.random() * game.canvas.height
	}
}

class ScoreManager{
	constructor(){
		this.score = 0
		this.scoreBoard = document.querySelector('#scoreBoard')
	}
	update(increment){
		this.score += increment
		this.scoreBoard.innerText = `Score : ${this.score}`
	}
}

// Spawn Functions---------------------------------------
function spawnEnemies(){
	let spawnX, spawnY
	do{
		spawnX = Math.random() * game.canvas.width
		spawnY = Math.random() * game.canvas.height
		distance = Math.sqrt(Math.pow(player.x - spawnX, 2) + Math.pow(player.y - spawnY, 2))
	}while(distance < spawnOffset)
	let enemy = new Enemy(spawnX, spawnY)
	enemies.push(enemy)
}

// Game handler Start and Update functions----------------
const Start = () => {
	game.init()
	player = {
		size: 25,
		x: (game.canvas.width / 2),
		y: (game.canvas.height / 2),
		moveSpeed: 4,
		speedX: 0,
		speedY: 0,
		color: '#4CAF50',
		update(){
			this.speedX = 0
			this.speedY = 0
			if (game.keys && game.keys[37] && this.x > 0) this.speedX = -this.moveSpeed
  			if (game.keys && game.keys[39] && (this.x + this.size) < game.canvas.width) this.speedX = this.moveSpeed
  			if (game.keys && game.keys[38] && this.y > 0) this.speedY = -this.moveSpeed
  			if (game.keys && game.keys[40] && (this.y + this.size) < game.canvas.height) this.speedY = this.moveSpeed
			this.x += this.speedX
			this.y += this.speedY
			game.context.fillStyle = this.color
			game.context.fillRect(this.x, this.y, this.size, this.size)
		},
		hasCollidedWith(that){
			let thisLeft = this.x
			let thisRight = this.x + this.size
			let thisTop = this.y
			let thisBottom = this.y + this.size
		
			let thatLeft = that.x
			let thatRight = that.x + that.size
			let thatTop = that.y
			let thatBottom = that.y + that.size
			if ((thisBottom <= thatTop) || (thisTop >= thatBottom) || (thisRight <= thatLeft) || (thisLeft >= thatRight)) {
				return false
			}
			return true
		
		}
	}
	point = new Point()
	scoreManager = new ScoreManager()
}

const Update  = () => {
	game.clear()
	player.update()
	for(enemy of enemies){
		enemy.update()
		if(enemy.outOfCanvas())
			enemy = null
	}
	enemies = enemies.filter(enemy => !enemy.outOfCanvas())
	point.update()
}
