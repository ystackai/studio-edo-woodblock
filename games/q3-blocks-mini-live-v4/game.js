(function () {
  'use strict';
  var COLS = 10, ROWS = 20, SZ = 24;
  var canvas = document.getElementById('gc'), ctx = canvas.getContext('2d');
  canvas.width = COLS * SZ; canvas.height = ROWS * SZ;
  var grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  var SHAPES = [
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]],
    [[1,1,0],[0,1,1]],
    [[0,1,1],[1,1,0]]
  ];
  var PALETTE = ['#e74c3c','#f1c40f','#9b59b6','#3498db','#e67e22','#2ecc71','#1abc9c'];
  var piece = null, px = 0, py = 0, color = 0;
  var score = 0, dropTimer = 0, gameOver = false;
  function spawn() {
    var i = Math.floor(Math.random() * SHAPES.length);
    piece = SHAPES[i].map(r => [...r]); color = i; px = (COLS - piece[0].length) / 2 | 0; py = 0;
    if (collides(piece, px, py)) { gameOver = true; }
  }
  function collides(p, cx, cy) {
    for (var r = 0; r < p.length; r++)
      for (var c = 0; c < p[r].length; c++)
        if (p[r][c] && (cx+c < 0 || cx+c >= COLS || cy+r >= ROWS || (cy+r >= 0 && grid[cy+r][cx+c])))
          return true;
    return false;
  }
  function merge() {
    for (var r = 0; r < piece.length; r++)
      for (var c = 0; c < piece[r].length; c++)
        if (piece[r][c] && py+r >= 0) grid[py+r][px+c] = color+1;
  }
  function clearRows() {
    var n = 0;
    for (var r = ROWS-1; r >= 0; r--) {
      if (grid[r].every(v => v)) { grid.splice(r,1); grid.unshift(Array(COLS).fill(0)); n++; r++; }
    }
    score += n * 100 * n;
  }
  function rotate(p) {
    var rows = p.length, cols = p[0].length, np = [];
    for (var c = 0; c < cols; c++) { var row = []; for (var r = rows-1; r >= 0; r--) row.push(p[r][c]); np.push(row); }
    return np;
  }
  function drop() {
    dropTimer += FoundryLoop.STEP;
    if (dropTimer >= 0.2) { dropTimer = 0; if (!collides(piece, px, py+1)) py++; else { merge(); clearRows(); spawn(); } }
  }
  spawn();
  FoundryInput.install(canvas, {
    actions: { left:['ArrowLeft','KeyA'], right:['ArrowRight','KeyD'],
               rotate:['ArrowUp','KeyW'], drop:['Space'] }
  });
  FoundryLoop.start({
    update: function(dt) {
      if (gameOver) return;
      if (FoundryInput.held('left') && !collides(piece,px-1,py)) px--;
      if (FoundryInput.held('right') && !collides(piece,px+1,py)) px++;
      if (FoundryInput.consume('rotate')) { var r=rotate(piece); if(!collides(r,px,py)) piece=r; }
      if (FoundryInput.consume('drop')) { while(!collides(piece,px,py+1)) py++; merge(); clearRows(); spawn(); }
      drop(); FoundryInput.update(dt);
    },
    render: function() {
      ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,canvas.width,canvas.height);
      for (var r=0;r<ROWS;r++) for(var c=0;c<COLS;c++) {
        if (grid[r][c]) { ctx.fillStyle=PALETTE[grid[r][c]-1]; ctx.fillRect(c*SZ,r*SZ,SZ-1,SZ-1); }
        else { ctx.strokeStyle='#2a2a3e'; ctx.strokeRect(c*SZ,r*SZ,SZ,SZ); }
      }
      if (piece && !gameOver) {
        ctx.fillStyle = PALETTE[color];
        for (var r=0;r<piece.length;r++) for(var c=0;c<piece[r].length;c++)
          if(piece[r][c]) ctx.fillRect((px+c)*SZ,(py+r)*SZ,SZ-1,SZ-1);
      }
      ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif';
      ctx.fillText('Score: '+score,4,canvas.height-6);
      if (gameOver) { ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='#e74c3c'; ctx.font='bold 24px sans-serif'; ctx.fillText('GAME OVER',canvas.width/2-65,canvas.height/2-8);
        ctx.fillStyle='#fff'; ctx.font='16px sans-serif'; ctx.fillText('Score: '+score,canvas.width/2-35,canvas.height/2+16); }
    }
  });
})();
