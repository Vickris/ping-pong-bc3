//define an empty pon object
Pong = {

  Defaults: {
    width:        640,   // logical canvas width (browser will scale to physical canvas size - which is controlled by @media css queries)
    height:       480,   // logical canvas height (ditto)
    wallWidth:    12,
    paddleWidth:  12,
    paddleHeight: 60,
    paddleSpeed:  2,     // should be able to cross court vertically   in 2 seconds
    ballSpeed:    4,     // should be able to cross court horizontally in 4 seconds, at starting speed ...
    ballAccel:    8,     // ... but accelerate as time passes
    ballRadius:   5,
    stats:        true
  },

  Colors: {
    walls: 'white',
    ball:  'white',
    score: 'white'
  },

  Images: [
    "images/press1.png",
    "images/press2.png",
    "images/winner.png"
  ],
//Model reaction time - wait some period of time before making decisions
//Model accuracy - the computer knows exactly where the ball will land,
// add a random error factor to pretend that the computer is fallable.
  Levels: [
    {aiReaction: 0.2, aiError:  40}, // 0:  ai is losing by 8
    {aiReaction: 0.3, aiError:  50}, // 1:  ai is losing by 7
    {aiReaction: 0.4, aiError:  60}, // 2:  ai is losing by 6
    {aiReaction: 0.5, aiError:  70}, // 3:  ai is losing by 5
    {aiReaction: 0.6, aiError:  80}, // 4:  ai is losing by 4
    {aiReaction: 0.7, aiError:  90}, // 5:  ai is losing by 3
    {aiReaction: 0.8, aiError: 100}, // 6:  ai is losing by 2
    {aiReaction: 0.9, aiError: 110}, // 7:  ai is losing by 1
    {aiReaction: 1.0, aiError: 120}, // 8:  tie
    {aiReaction: 1.1, aiError: 130}, // 9:  ai is winning by 1
    {aiReaction: 1.2, aiError: 140}, // 10: ai is winning by 2
    {aiReaction: 1.3, aiError: 150}, // 11: ai is winning by 3
    {aiReaction: 1.4, aiError: 160}, // 12: ai is winning by 4
    {aiReaction: 1.5, aiError: 170}, // 13: ai is winning by 5
    {aiReaction: 1.6, aiError: 180}, // 14: ai is winning by 6
    {aiReaction: 1.7, aiError: 190}, // 15: ai is winning by 7
    {aiReaction: 1.8, aiError: 200}  // 16: ai is winning by 8
  ],

  //-----------------------------------------------------------------------------

  initialize: function(runner, cfg) {
    Game.loadImages(Pong.Images, function(images) {
      this.cfg         = cfg;
      this.runner      = runner;
      this.width       = runner.width;
      this.height      = runner.height;
      this.images      = images;
      this.playing     = false;
      this.scores      = [0, 0];
      this.menu        = Object.construct(Pong.Menu,   this);
      this.court       = Object.construct(Pong.Court,  this);
      this.leftPaddle  = Object.construct(Pong.Paddle, this);
      this.rightPaddle = Object.construct(Pong.Paddle, this, true);
      this.ball        = Object.construct(Pong.Ball,   this);
      this.runner.start();
    }.bind(this));
  },

  startDemo:         function() { this.start(0); },
  startSinglePlayer: function() { this.start(1); },
  startDoublePlayer: function() { this.start(2); },

// since we've already dedclared the keyboard inputs, starting and stopping a game is now possible
  start: function(numPlayers) {
    if (!this.playing) {
      this.scores = [0, 0];
      this.playing = true;
      this.ball.reset();
      this.runner.hideCursor();
    }
  },

  stop: function(ask) {
    if (this.playing) {
      if (!ask || this.runner.confirm('Abandon game in progress ?')) {
        this.playing = false;
        this.runner.showCursor();
      }
    }
  },
//While the game is in progress, the update() method needs 
//to detect when goals are scored and when to declare a winner and stop the game:
  update: function(dt) {
    this.leftPaddle.update(dt, this.ball);
    this.rightPaddle.update(dt, this.ball);
    if (this.playing) {
      var dx = this.ball.dx;
      var dy = this.ball.dy;
      this.ball.update(dt, this.leftPaddle, this.rightPaddle);

      if (this.ball.left > this.width)
        this.goal(0);
      else if (this.ball.right < 0)
        this.goal(1);
    }
  },

  goal: function(playerNo) {
    this.scores[playerNo] += 1;
    if (this.scores[playerNo] == 1) {
      this.menu.declareWinner(playerNo);
      this.stop();
    }
    else {
      this.ball.reset(playerNo);
    }
  },

  update: function(dt) {
    this.leftPaddle.update(dt, this.ball);
    this.rightPaddle.update(dt, this.ball);
    if (this.playing) {
      var dx = this.ball.dx;
      var dy = this.ball.dy;
      this.ball.update(dt, this.leftPaddle, this.rightPaddle);

      if (this.ball.left > this.width)
        this.goal(0);
      else if (this.ball.right < 0)
        this.goal(1);
    }
  },

  draw: function(ctx) {
    this.court.draw(ctx);
    this.ball.draw(ctx);
  },

//create switch statement for events called upon keypress
  onkeydown: function(keyCode) {
    switch(keyCode) {
      case Game.KEY.ZERO: this.startDemo();            break;
      case Game.KEY.ONE:  this.startSinglePlayer();    break;
      case Game.KEY.TWO:  this.startDoublePlayer();    break;
      case Game.KEY.ESC:  this.stop(true);             break;
      case Game.KEY.Q:    this.leftPaddle.moveUp();    break;
      case Game.KEY.A:    this.leftPaddle.moveDown();  break;
      case Game.KEY.P:    this.rightPaddle.moveUp();   break;
      case Game.KEY.L:    this.rightPaddle.moveDown(); break;
    }
  },

  onkeyup: function(keyCode) {
    switch(keyCode) {
      case Game.KEY.Q: this.leftPaddle.stopMovingUp();    break;
      case Game.KEY.A: this.leftPaddle.stopMovingDown();  break;
      case Game.KEY.P: this.rightPaddle.stopMovingUp();   break;
      case Game.KEY.L: this.rightPaddle.stopMovingDown(); break;
    }
  },
  // The game is stopped when a winner is declared, it can also be stopped in response to the user hitting the ESC key
  stop: function(ask) {
    if (this.playing) {
      if (!ask || this.runner.confirm('Abandon game in progress ?')) {
        this.playing = false;
        this.runner.showCursor();
      }
    }
  },

  //tell pong.court object how to draw walls
  Court: {
    initialize: function(pong) {
      var w  = pong.width;
      var h  = pong.height;
      var ww = pong.cfg.wallWidth;

      this.walls = [];
      this.walls.push({x: 0,    y: 0,      width: w,  height: ww});
      this.walls.push({x: 0,    y: h - ww, width: w,  height: ww});
      this.walls.push({x: 0,    y: 0,      width: ww, height:  h});
      this.walls.push({x: w-ww, y: 0,      width: ww, height:  h});    
  },

   //=============================================================================
  // PADDLE
  //=============================================================================

  Paddle: {   
    //If the ball is moving away then do nothing
    //Otherwise, predict where the ball will meet the paddle’s edge of the court.
    //If we have a prediction then move up or down to meet it.
    ai: function(dt, ball) {
      if (((ball.x < this.left) && (ball.dx < 0)) ||
          ((ball.x > this.right) && (ball.dx > 0))) {
        this.stopMovingUp();
        this.stopMovingDown();
        return;
      }

      this.predict(ball, dt);

      if (this.prediction) {
        if (this.prediction.y < (this.top + this.height/2 - 5)) {
          this.stopMovingDown();
          this.moveUp();
        }
        else if (this.prediction.y > (this.bottom - this.height/2 + 5)) {
          this.stopMovingUp();
          this.moveDown();
        }
        else {
          this.stopMovingUp();
          this.stopMovingDown();
        }
      }
    },

    predict: function(ball, dt) {
      // only re-predict if the ball changed direction, or its been some amount of time since last prediction
      if (this.prediction &&
          ((this.prediction.dx * ball.dx) > 0) &&
          ((this.prediction.dy * ball.dy) > 0) &&
          (this.prediction.since < this.level.aiReaction)) {
        this.prediction.since += dt;
        return;
      }

      var pt  = Pong.Helper.ballIntercept(ball, {left: this.left, right: this.right, top: -10000, bottom: 10000}, ball.dx * 10, ball.dy * 10);
      if (pt) {
        var t = this.minY + ball.radius;
        var b = this.maxY + this.height - ball.radius;

        while ((pt.y < t) || (pt.y > b)) {
          if (pt.y < t) {
            pt.y = t + (t - pt.y);
          }
          else if (pt.y > b) {
            pt.y = t + (b - t) - (pt.y - b);
          }
        }
        this.prediction = pt;
      }
      else {
        this.prediction = null;
      }

      if (this.prediction) {
        this.prediction.since = 0;
        this.prediction.dx = ball.dx;
        this.prediction.dy = ball.dy;
        this.prediction.radius = ball.radius;
        this.prediction.exactX = this.prediction.x;
        this.prediction.exactY = this.prediction.y;
        var closeness = (ball.dx < 0 ? ball.x - this.right : this.left - ball.x) / this.pong.width;
        var error = this.level.aiError * closeness;
        this.prediction.y = this.prediction.y + Game.random(-error, error);
      }
    },

    draw: function(ctx) {
      ctx.fillStyle = Pong.Colors.walls;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      if (this.prediction && this.pong.cfg.predictions) {
        ctx.strokeStyle = Pong.Colors.predictionExact;
        ctx.strokeRect(this.prediction.x - this.prediction.radius, this.prediction.exactY - this.prediction.radius, this.prediction.radius*2, this.prediction.radius*2);
        ctx.strokeStyle = Pong.Colors.predictionGuess;
        ctx.strokeRect(this.prediction.x - this.prediction.radius, this.prediction.y - this.prediction.radius, this.prediction.radius*2, this.prediction.radius*2);
      }
    },

    moveUp:         function() { this.up   = 1; },
    moveDown:       function() { this.down = 1; },
    stopMovingUp:   function() { this.up   = 0; },
    stopMovingDown: function() { this.down = 0; }

  },
  //Tell ball how to move and how it should be drawn
  Ball: {
    initialize: function(pong) {
      this.pong    = pong;
      this.radius  = pong.cfg.ballRadius;
      this.minX    = pong.cfg.wallWidth + this.radius;
      this.minY    = pong.cfg.wallWidth + this.radius;
      this.maxX    = pong.width  - pong.cfg.wallWidth - this.radius;
      this.maxY    = pong.height - pong.cfg.wallWidth - this.radius;
      this.x       = Game.random(this.minX, this.maxX);
      this.y       = Game.random(this.minY, this.maxY);
      this.dx      = (this.maxX - this.minX) / (Game.random(1, 10) * Game.randomChoice(1, -1));
      this.dy      = (this.maxY - this.minY) / (Game.random(1, 10) * Game.randomChoice(1, -1));
    },

    
    //this will keep on updating depending on the acceleration of the ball

    update: function(dt, leftPaddle, rightPaddle) {

      pos = Pong.Helper.accelerate(this.x, this.y, this.dx, this.dy, this.accel, dt);

      if ((pos.dy > 0) && (pos.y > this.maxY)) {
        pos.y = this.maxY;
        pos.dy = -pos.dy;
      }
      else if ((pos.dy < 0) && (pos.y < this.minY)) {
        pos.y = this.minY;
        pos.dy = -pos.dy;
      }

      var paddle = (pos.dx < 0) ? leftPaddle : rightPaddle;
      var pt     = Pong.Helper.ballIntercept(this, paddle, pos.nx, pos.ny);

      if (pt) {
        switch(pt.d) {
          case 'left':
          case 'right':
            pos.x = pt.x;
            pos.dx = -pos.dx;
            break;
          case 'top':
          case 'bottom':
            pos.y = pt.y;
            pos.dy = -pos.dy;
            break;
        }

        // add/remove spin based on paddle direction
        if (paddle.up)
          pos.dy = pos.dy * (pos.dy < 0 ? 0.5 : 1.5);
        else if (paddle.down)
          pos.dy = pos.dy * (pos.dy > 0 ? 0.5 : 1.5);
      }

      this.setpos(pos.x,  pos.y);
      this.setdir(pos.dx, pos.dy);
    },

    draw: function(ctx) {
      var w = h = this.radius * 2;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
      ctx.fill();
      ctx.closePath();
    }
    
  }

/* Helper method for acceleration which will
-calculate the new position and speed of the ball.
-detect if it bounced off the top or bottom wall (simple bounds check)
-detect if it bounced off a paddle (see next section)
-tweak the y speed to simulate spin if the ball hit a moving paddle
*/
  Helper: {
//This the update method should 
    accelerate: function(x, y, dx, dy, accel, dt) {
      var x2  = x + (dt * dx) + (accel * dt * dt * 0.5);
      var y2  = y + (dt * dy) + (accel * dt * dt * 0.5);
      var dx2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
      var dy2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
      return { nx: (x2-x), ny: (y2-y), x: x2, y: y2, dx: dx2, dy: dy2 };
    },
// line intersection
    intercept: function(x1, y1, x2, y2, x3, y3, x4, y4, d) {
      var denom = ((y4-y3) * (x2-x1)) - ((x4-x3) * (y2-y1));
      if (denom != 0) {
        var ua = (((x4-x3) * (y1-y3)) - ((y4-y3) * (x1-x3))) / denom;
        if ((ua >= 0) && (ua <= 1)) {
          var ub = (((x2-x1) * (y1-y3)) - ((y2-y1) * (x1-x3))) / denom;
          if ((ub >= 0) && (ub <= 1)) {
            var x = x1 + (ua * (x2-x1));
            var y = y1 + (ua * (y2-y1));
            return { x: x, y: y, d: d};
          }
        }
      }
      return null;
    },
//Ball and paddle intersection
    ballIntercept: function(ball, rect, nx, ny) {
      var pt;
      if (nx < 0) {
        pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                                   rect.right  + ball.radius, 
                                   rect.top    - ball.radius, 
                                   rect.right  + ball.radius, 
                                   rect.bottom + ball.radius, 
                                   "right");
      }
      else if (nx > 0) {
        pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                                   rect.left   - ball.radius, 
                                   rect.top    - ball.radius, 
                                   rect.left   - ball.radius, 
                                   rect.bottom + ball.radius,
                                   "left");
      }
      if (!pt) {
        if (ny < 0) {
          pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                                     rect.left   - ball.radius, 
                                     rect.bottom + ball.radius, 
                                     rect.right  + ball.radius, 
                                     rect.bottom + ball.radius,
                                     "bottom");
        }
        else if (ny > 0) {
          pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                                     rect.left   - ball.radius, 
                                     rect.top    - ball.radius, 
                                     rect.right  + ball.radius, 
                                     rect.top    - ball.radius,
                                     "top");
        }
      }
      return pt;
    }

  }