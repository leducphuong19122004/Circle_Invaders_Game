const canvas = document.getElementById("canvas");
const start_header = document.querySelector('.start-header');
const finish_header = document.querySelector('.finish-header');
const score_html = document.querySelector('.score');
const hp = document.querySelector('.hp');
const row_header = document.querySelector('.row-header');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 70;

const ctx = canvas.getContext("2d");

var colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'];
let player;
let bullets = [];
let bullets_enemy = [];
let enemies = [];
let sparks = [];
let score = 0;
let loss = false;
let pause = false;

let score_interval;
let initEnemies_interval;


let Game = {
    start: function () {
        canvas.style.display = "block";
        start_header.style.display = "none";
        player = new Player(canvas.width / 2, canvas.height, 40, "white", 100);
        player.displayPlayer();
        score_interval = setInterval(() => {
            score++;
            score_html.textContent = score;
        }, 1000)

        initEnemies_interval = setInterval(() => {
            initEnemies();
        }, 1500);
        animation();
    },
    clear: function () {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        player.displayPlayer();
    },
    changeRow: function () {
        if (score == 0) {
            canvas.style.display = "none";
            row_header.textContent = "Row 1";
            row_header.style.display = "block";
        }
        if (score == 100) {
            canvas.style.display = "none";
            row_header.textContent = "Row 2";
            row_header.style.display = "block";
        }
        if (score == 200) {
            canvas.style.display = "none";
            row_header.textContent = "Row 3";
            row_header.style.display = "block";
        }
        if (score == 300) {
            canvas.style.display = "none";
            row_header.textContent = "Row 4";
            row_header.style.display = "block";
        } if (score == 400) {
            canvas.style.display = "none";
            row_header.textContent = "Row 5";
            row_header.style.display = "block";
        }
        const row = setTimeout(() => {
            canvas.style.display = "block";
            row_header.style.display = "none";
            clearTimeout(row);
        }, 2000);
    },
    pause: function () {
        if (pause == false) {
            pause = true;
            clearInterval(score_interval);
            clearInterval(initEnemies_interval);
        } else {
            pause = false;
            score_interval = setInterval(() => {
                score++;
                score_html.textContent = score;
            }, 1000)

            initEnemies_interval = setInterval(() => {
                initEnemies();
            }, 1500);

            animation();
        }
    },
    finish: function () {
        clearInterval(score_interval);
        clearInterval(initEnemies_interval);
        canvas.style.display = "none";
        finish_header.style.display = "block";
    }
}

class Player {
    constructor(x, y, size, color, hp) {
        this.color = color;
        this.x = Math.floor(x);
        this.y = Math.floor(y) - 50;
        this.size = size;
        this.hp = hp;
    }
    shoot(goalX, goalY) {
        var bullet = new Bullet(this.x, this.y, goalX, goalY, 5, "red", 10);
        bullets.push(bullet);
    }
    displayPlayer() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animation() {
    if (!loss && !pause) {
        requestAnimationFrame(animation);
        Game.clear();
        bullets.forEach((bullet) => {
            enemies.forEach((enemy) => {
                const distance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);
                if (distance > enemy.size) {
                    bullet.update();
                } else {
                    var hp_of_enemy = enemy.hp - bullet.dam;
                    if (hp_of_enemy <= 20) {
                        for (var i = 0; i < enemy.size * 2; i++) {
                            sparks.push(new Spark(enemy.x, enemy.y, Math.random() * 3, enemy.color, {
                                vx: (Math.random() - 0.5) * (Math.random() * 5),
                                vy: (Math.random() - 0.5) * (Math.random() * 5)
                            }))
                        }
                        bullets.splice(bullets.indexOf(bullet), 1);
                        enemies.splice(enemies.indexOf(enemy), 1);
                    } else {
                        for (var i = 0; i < 8; i++) {
                            sparks.push(new Spark(enemy.x, enemy.y, Math.random() * 3, enemy.color, {
                                vx: (Math.random() - 0.5) * (Math.random() * 5),
                                vy: (Math.random() - 0.5) * (Math.random() * 5)
                            }))
                        }
                        enemy.hp = hp_of_enemy;
                        enemy.size = hp_of_enemy;
                        bullets.splice(bullets.indexOf(bullet), 1);
                    }

                }
            });

        });
        sparks.forEach((spark, index) => {
            if (spark.alpha <= 0) {
                sparks.splice(index, 1);
            } else {
                spark.update();
            }
        })
        bullets_enemy.forEach((bullet) => {
            const distance = Math.sqrt((bullet.x - player.x) ** 2 + (bullet.y - player.y) ** 2);
            if (distance <= player.size) {
                var hp_of_player = player.hp - bullet.dam;
                if (hp_of_player <= 0) {
                    hp.textContent = 0;
                    loss = true;
                } else {
                    player.hp = hp_of_player;
                    hp.textContent = Math.floor(player.hp);
                    bullets_enemy.splice(bullets_enemy.indexOf(bullet), 1);
                }
            }
            if (bullet.x >= 0 && bullet.x <= canvas.width && bullet.y >= 0 && bullet.y <= canvas.height) {
                bullet.update();
            } else {
                bullets_enemy.splice(bullets_enemy.indexOf(bullet), 1);
            }
        })
        enemies.forEach((enemy) => {
            const distance = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
            if ((Math.floor(distance) - Math.floor(Math.abs(enemy.size + player.size))) < 10) {
                var hp_of_player = player.hp - enemy.hp;
                if (hp_of_player <= 0) {
                    hp.textContent = 0;
                    loss = true;
                } else {
                    player.hp = hp_of_player;
                    hp.textContent = Math.floor(player.hp);
                    enemies.splice(enemies.indexOf(enemy), 1);
                }
            } else {
                if (enemy.y <= canvas.height) {
                    enemy.update();
                } else {
                    enemies.splice(enemies.indexOf(enemy), 1);
                }
            }
        });

    } else if (loss) {
        Game.finish();
    }
}

class Bullet {
    constructor(x, y, goalX, goalY, velocity, color, size) {
        this.originX = Math.floor(x);
        this.originY = Math.floor(y);
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.goalX = Math.floor(goalX);
        this.goalY = Math.floor(goalY);
        this.velocity = velocity;
        this.color = color;
        this.size = size;
        this.dam = size;
    }
    displayBullet() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        const bulletDirection = getBulletDirection(this.originX, this.originY, this.goalX, this.goalY, this.velocity);
        this.x += bulletDirection.vx;
        this.y += bulletDirection.vy;
        this.displayBullet();
    }

}

function getBulletDirection(x0, y0, x1, y1, velocity) {
    const distance = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
    const time = distance / velocity;

    const vx = (x1 - x0) / time;
    const vy = (y1 - y0) / time;

    return { vx, vy };
}

class Enemy {
    constructor(x, y, size, color, hp) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.hp = size;
    }
    displayEnemy() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        if (this.y <= canvas.height) {
            this.y += 1;
            this.displayEnemy();
        }
    }
    shoot(goalX, goalY) {
        var bullet = new Bullet(this.x, this.y, goalX, goalY, 5, "green", 10);
        bullets_enemy.push(bullet);
    }
}

function initEnemies() {
    const size = Math.random() * 41 + 20; // 0 -> 60;
    const x = Math.random() * (canvas.width - size) + size;
    const y = 0;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const newEnemy = new Enemy(x, y, size, color);
    newEnemy.shoot(player.x, player.y);
    enemies.push(newEnemy);
}

class Spark {
    constructor(x, y, size, color, velocity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.vx = velocity.vx;
        this.vy = velocity.vy;
        this.color = color;
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha; // this globalAlpha have scope is all things painted in canvas so to set globalAlpha is only affected to specific object, we need to save this globalAlpha value in state of that object and retore original value for other objects !
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.draw();
        this.alpha -= 0.005;
        this.x += this.vx;
        this.y += this.vy;
    }
}

window.addEventListener('mousedown', (event) => {
    player.shoot(event.clientX, event.clientY);
})


window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 50;
})

window.addEventListener('keydown', (event) => {
    let keyCode = event.code;
    if (keyCode == "KeyA") {
        if (player.x > 0) {
            player.x -= 7;
            Game.clear();
        }
    }
    if (keyCode == "KeyD") {
        if (player.x < canvas.width) {
            player.x += 7;
            Game.clear();
        }
    };
    if (keyCode == "KeyW") {
        if (player.y > 0) {
            player.y -= 7;
            Game.clear();
        }
    };
    if (keyCode == "KeyS") {
        if (player.y < canvas.height) {
            player.y += 7;
            Game.clear();
        }
    };
    if (keyCode && start_header.style.display !== "none") {
        Game.start();
    }
    if (keyCode == "KeyP") {
        Game.pause();
    }
    if (keyCode == "KeyR") {
        if (confirm("Are you sure you want to restart the game ?")) {
            window.location.href = "/";
        }
    }
})



