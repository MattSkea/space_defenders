function init() {
    // SETUP CANVAS
    var canvas = document.getElementById("easel");
    
    // SETUP SHAPE
    var shape = new createjs.Shape();

    // SETUP STAGE
    var stage = new createjs.Stage(canvas);
    // PAINT CANVAS
    stage.addChild(shape);
    // UPDATE CANVAS
    stage.update();
}
;
