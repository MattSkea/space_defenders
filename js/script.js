var stage;
/*GAME TEXT*/
var startText;
var preloadText;
var scoreTracker;
var levelTracker;
var lifeTracker;
var dNote;
/*GAME STATS*/
var score = 0;
var level = 1;
var lives = 10;
/*GAME CHARACTERS*/
var mainChar;
var enemies = [];
var bullets = [];
var enemySpeed = 0.7;
var speedUpEnemies;
/*ANIMATION*/
var mainCharSpriteSheet;
var expl;


var queue;

var keys = {
    rkd: false,
    lkd: false,
    ukd: false,
    dkd: false,
    skd: false
};


function preload() {
    // SETUP CANVAS
    var canvas = document.getElementById("easel");
    stage = new createjs.Stage(canvas);
    createPreloadText();
    // SETUP STAGE
    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on('progress', progress);
    queue.on('complete', init);

    queue.loadManifest([
        "img/background.png",
        "img/hero.png",
        "img/enemy.png",
        "img/enemyHealer.png",
        {id: "mainCharSS", src: "js/animation/mChar.json"},
        "img/sprites/sprites.png",
        {id: "intro", src: "audio/intro.mp3"},
        {id: "explosion", src: "audio/explosion.wav"},
        {id: "hit", src: "audio/hit.mp3"},
//        {id: "enemySpawn", src: "audio/spawn.mp3"},
        {id: "shoot", src: "audio/shot.wav"}
    ]);
}
function progress(evt) {
    console.log(evt.progress);

    //Update preload text
    preloadText.text = Math.floor(evt.progress * 100) + "%";

    stage.update();

}
function init() {
    //Remove preload text
    stage.removeChild(preloadText);
    // SETUP SHAPE
    createPreloadText();
    createEnv();
    createMainChar();
    createEnemies();
    createScoreText();
    createLevelText();
    createLifeText();
//    splashStartText();

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", updateCanvas);

    window.addEventListener("keydown", keyPressed);
    window.addEventListener("keyup", keyLifted);
}
function updateCanvas(e) { //    console.log("Tick triggered");
    if (lives > 0) {
        checkShipsHitWall();

        moveMainChar();
        checkBulletHitEnemies();
        moveBullets();
        moveEnemies();
        stage.update(e);
    } else {
        deathNote();
    }
}

function keyPressed(e) {
    if (e.keyCode === 32) {

    }
//    console.log(e.keyCode); // KEY CODE LOGGIN!
    if (e.keyCode === 37 || e.keyCode === 65) {
        keys.lkd = true;
//        console.log("Left key pressed");
    }
    if (e.keyCode === 39 || e.keyCode === 68) {
        keys.rkd = true;
//        console.log("Right key pressed");

    }
    if (e.keyCode === 38 || e.keyCode === 87) {
        keys.ukd = true;
//        console.log("Up key pressed");
    }
    if (e.keyCode === 40 || e.keyCode === 83) {
        keys.dkd = true;
//        console.log("Down key pressed");
    }
}
function keyLifted(e) {
    if (e.keyCode === 32) {
        keys.skd = false;
        keys.skd = true;
        createBullets();
//        console.log("FIre");
    }
//    console.log(e.keyCode); // KEY CODE LOGGIN!
    if (e.keyCode === 37 || e.keyCode === 65) {
        keys.lkd = false;
//        mainChar.gotoAndStop('left');

        mainChar.gotoAndStop('notMoving');
//        console.log("Left key lifted");
    }
    if (e.keyCode === 39 || e.keyCode === 68) {
        keys.rkd = false;
        mainChar.gotoAndStop('notMoving');
//        console.log("Right key lifted");

    }
    if (e.keyCode === 38 || e.keyCode === 87) {
        keys.ukd = false;
//        console.log("Up key lifted");
    }
    if (e.keyCode === 40 || e.keyCode === 83) {
        keys.dkd = false;
//        console.log("Down key lifted");
    }

}

function createEnv() {
    var bgImg = queue.getResult("img/background.png");
    var bg1 = new createjs.Bitmap(bgImg);
    bg1.width = 600;
    bg1.height = 400;

    stage.addChild(bg1);
}
function createMainChar() {
    mainCharSpriteSheet = new createjs.SpriteSheet(queue.getResult("js/animation/mChar.json"));
    console.log(mainCharSpriteSheet);

    mainChar = new createjs.Sprite(mainCharSpriteSheet, "notMoving");
//    var charImg = queue.getResult("img/hero.png");

//    mainChar = new createjs.Bitmap(charImg);
//    mainChar.graphics.beginFill("#fff");
//    mainChar.graphics.drawRect(0, 0, 20, 60);
    //WIDTH AND HEIGHT ARE CREATED FOR HIT DETECTION
    mainChar.width = 123;
    mainChar.height = 103;
    mainChar.x = stage.canvas.width / 2 - (mainChar.width / 2);
    mainChar.y = stage.canvas.height - mainChar.height - 40;
    mainChar.speed = 4;
    stage.addChild(mainChar);
}
function createEnemies() {
    for (var i = 0; i < level; i++) {
        var enImg = queue.getResult("img/enemy.png");
        var enemy = new createjs.Bitmap(enImg);
        enemy.width = 123;
        enemy.height = 103;
        enemy.y = -200;
        enemy.x = Math.floor(Math.random() * (stage.canvas.width - enemy.width));
        enemy.speed = enemySpeed;
        enemy.healer = false;
        stage.addChild(enemy);


//        }
        enemies.push(enemy);
    }
}
function createEnemyHeal() {
    var healerSpawnTrigger = 2;
//        for (var j; j < enemies.length - 1; j++) {
//        console.log("Hey");
    if (level % healerSpawnTrigger) {
        var enHImg = queue.getResult("img/enemyHealer.png");
        var enemyH = new createjs.Bitmap(enHImg);
        enemyH.width = 123;
        enemyH.height = 103;
        enemyH.y = -200;
        enemyH.x = Math.floor(Math.random() * (stage.canvas.width - enemyH.width));
        enemyH.speed = enemySpeed;
        enemyH.healer = true;
        stage.addChild(enemyH);
        enemies.push(enemyH);
//                console.log("Spawn");
    }
}
function createBullets() {
    //Create a new object (graphics/shapes)
    var shot = new createjs.Shape();
    shot.graphics.beginFill("#fff").drawCircle(0, 0, 3);
    //Position near hero
    shot.x = mainChar.x + (mainChar.width / 2);
    shot.y = mainChar.y;
    //Add width/height for hitdetection
    shot.width = shot.height = 10;

    var s = createjs.Sound.play('shoot');
    s.setVolume(0.3);

    //Add to stage
    stage.addChild(shot);
    //Push to array
    bullets.push(shot);
}
function createExplosion() {
    var explosion = new createjs.SpriteSheet(queue.getResult("js/animation/mChar.json"));
    console.log(explosion);

    expl = new createjs.Sprite(mainCharSpriteSheet, "explode");
    expl.width = 123;
    expl.height = 103;
//    expl.x = stage.canvas.width / 2 - (expl.width / 2);
//    expl.y = stage.canvas.height - expl.height - 40;
//    mainChar.speed = 4;
    expl.x = 0;
    expl.y = 0;
    stage.addChild(expl);

}
function removeExplosion() {
    setTimeout(function () {
        stage.removeChild(expl);
    }, 500);
}
function moveMainChar() {

    if (mainChar.x > stage.canvas.height + (mainChar.width) - 50) {

    } else if (keys.rkd) {
        mainChar.x += mainChar.speed;
        if (mainChar.currentAnimation !== "right") {
//            mainChar.gotoAndPlay("right");
            mainChar.gotoAndStop("right");
        }
    }
//        console.log(hero.x);
    if (mainChar.x < 10) {

    } else if (keys.lkd) {
        mainChar.x -= mainChar.speed;

        if (mainChar.currentAnimation !== "left") {
//            mainChar.gotoAndPlay("left");
            mainChar.gotoAndStop("left");
        }
//        console.log(hero.x);
    }
//    if (keys.skd) {
//        fire();
//        console.log("FIre");
//    }
//    if (keys.ukd) {
//        mainChar.y -= mainChar.speed;
////        console.log(hero.y);
//    }
//    if (keys.dkd) {
//        mainChar.y += mainChar.speed;
////        console.log(hero.y);
//    }
}
function moveBullets() {
    var i;
    var length = bullets.length - 1;
    for (i = length; i >= 0; i--) {
        bullets[i].y -= 4;

        //When bullets goes out of screen, delete bullet from array
        if (bullets[i].y < 0) {
            //Remove child before you delete it from the array
            stage.removeChild(bullets[i]);
            bullets.splice(i, 1);
        }
    }
}
function moveEnemies() {
    var i;
    var length = enemies.length - 1;
    for (i = length; i >= 0; i--) {

//        if (score % 5 === true) {
//            enemySpeed += 0.5;
//            console.log("Speed increase" + enemies[i].y);
//            console.log(enemySpeed);
//        }

//        if (i === 0) {
        enemies[i].y += enemySpeed;
//        console.log(enemySpeed);
//        } 


        //When enemies go out of the screen, put the enemy at the top of the screen
        if (enemies[i].y > stage.canvas.height) {
            enemies[i].y = -200;
            enemies[i].x = Math.floor(Math.random() * (stage.canvas.width - enemies[i].width));
            lives--;
            updateLives();
        }
//            console.log(enemies[i].x);
    }
}

function checkShipsHitWall() {
    if (mainChar.y > stage.canvas.height || mainChar.y < 0) {
    }
    if (mainChar.x > stage.canvas.height || mainChar.x < 0) {
    }
}
function checkBulletHitEnemies() {
    /*KILL ENEMIES*/
    var enemy;
    var bullet;
    var amountEnemies = enemies.length - 1;
    var amountBullets = bullets.length - 1;

    for (enemy = amountEnemies; enemy >= 0; enemy--) {
        for (bullet = amountBullets; bullet >= 0; bullet--) {
            if (hitTest(enemies[enemy], bullets[bullet])) {
                createExplosion();
                expl.x = enemies[enemy].x;
                expl.y = enemies[enemy].y;

                expl.gotoAndPlay("explosion");
                removeExplosion();

                if (enemies[enemy].healer) {
                    lives++;
                    updateLives();
                }
                //Hit detected
//                console.log("hit detected");
                //remove the enemies
//                setTimeout(function () {
                stage.removeChild(bullets[bullet], enemies[enemy]);
                bullets.splice(bullet, 1);
                enemies.splice(enemy, 1);
//                }, 200);



                var s = createjs.Sound.play('explosion');
                s.setVolume(0.3);

                //Update score
                score++;
                updateScore();

                levelUp();
//                break;
            }
        }
//        break;
    }
}
function spaceEnemiesApart() {
    for (var i = 0; i < enemies.lenght - 1; i++) {

        if (enemies[i].y > stage.canvas.height || enemies[i].y < 0) {
//            enemies[i].y = enemies[i].yDirection * -1;
        }
        if (enemies[i].x > stage.canvas.height || enemies[i].x < 0) {
//            enemies[i].xDirection = enemies[i].xDirection * -1;
        }
    }
}
function hitTest(rect1, rect2) {
    if (rect1.x >= rect2.x + rect2.width
            || rect1.x + rect1.width <= rect2.x
            || rect1.y >= rect2.y + rect2.height
            || rect1.y + rect1.height <= rect2.y)
    {
        return false;
    }
    return true;
}
function levelUp() {
    if (enemies.length === 0) {
        level++;
        createEnemies();
        updateLevel();
        createEnemyHeal();
    }
}

function splashStartText() {
    startText = new createjs.Text("UFO Invaders!", "40px Verdana", "#fff");
    startText.textAlign = "center";
    startText.x = stage.canvas.width / 2;
    startText.y = stage.canvas.height / 2 - 20;
    stage.addChild(startText);

    splashIntroAn();
}
function splashIntroAn() {
    var ufo = new createjs.Bitmap("img/ufo.png");
    stage.addChild(ufo);
    createjs.Tween.get(ufo).to({
        x: 440,
        y: 240,
        alpha: 0.5
    }, 5000, createjs.Ease.bounceIn);
}
function deathNote() {
    dNote = new createjs.Text("You have died", "40px Verdana", "#fff");
    dNote.textAlign = "center";
    dNote.x = stage.canvas.width / 2;
    dNote.y = stage.canvas.height / 2 - 20;
    stage.addChild(dNote);
}
function createPreloadText() {
    preloadText = new createjs.Text("0%", "30px Sans-Serif", "#fff");
    preloadText.textAlign = "center";
    preloadText.x = stage.canvas.width / 2;
    preloadText.y = stage.canvas.height / 2;
    stage.addChild(preloadText);
}
function createScoreText() {
    scoreTracker = new createjs.Text("Score: 0", "30px Sans-Serif", "#fff");
    scoreTracker.x = 40;
    scoreTracker.y = 20;
    stage.addChild(scoreTracker);
}
function createLevelText() {
    levelTracker = new createjs.Text("Level: 0", "30px Sans-Serif", "#fff");
//    scoreTracker.textAlign = "center";
    levelTracker.x = 40;
    levelTracker.y = 50;
    stage.addChild(levelTracker);
}
function createLifeText() {
    lifeTracker = new createjs.Text("Lives: 10", "30px Sans-Serif", "#fff");
//    scoreTracker.textAlign = "center";
    lifeTracker.x = 640;
    lifeTracker.y = 20;
    stage.addChild(lifeTracker);
}

function updateScore() {
    scoreTracker.text = "Score: " + score;
}
function updateLevel() {
    levelTracker.text = "Level: " + level;
}
function updateLives() {
    lifeTracker.text = "Lives: " + lives;

    if (lives <= 3) {
        lifeTracker.scaleX = 1.2;
        lifeTracker.scaleY = 1.2;
        lifeTracker.color = "#FF0E05";
        createjs.Tween.get(lifeTracker, {loop: true})
                .to({y: 30}, 2000, createjs.Ease.sineIn)
                .to({y: 20}, 2000, createjs.Ease.sineout);
    } else {
        lifeTracker.color = "#FFF";
        createjs.Tween.get(lifeTracker, {loop: false});
    }
}


