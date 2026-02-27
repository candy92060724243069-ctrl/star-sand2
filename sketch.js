let imgFiles = [];
let stars = [];
let bubbles = [];

let scientificNames = [
  "Calcarina spengleri\n斯氏卡爾有孔蟲", 
  "Baculogypsina sphaerulata\n圓球桿有孔蟲", 
  "Amphistegina radiate\n輻射雙蓋有孔蟲",      
  "Peneroplis planatus\n扁平盤蜷有孔蟲", 
  "Planorbulina mediterranensis\n地中海扁圓蟲", 
  "Elphidium crispum\n皺紋艾爾排蟲 / 卷轉蟲",    
  "Ammobaculites agglutinans\n膠結有孔蟲", 
  "Textularia agglutinans\n黏結雙列蟲", 
  "Globigerina bulloides\n結節狀球房蟲",        
  "Calcarina defrancei\n德氏卡爾有孔蟲", 
  "Operculina\n蓋蟲屬", 
  "Lagena striata\n帶紋瓶蟲",       
  "Archaias angulatus\n角狀阿爾凱蟲", 
  "Spiroloculina depressa\n凹陷螺旋蟲", 
  "Orbulina universa\n宇宙球蟲"          
];

// ✅ 偵測是否為行動裝置
let isMobile = /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent);

function preload() {
  for (let i = 0; i < 15; i++) {
    imgFiles[i] = loadImage((i + 1) + '.png');
  }
}

function setup() {
  let canvasW = 608; 
  let canvasH = 869;
  let canvas = createCanvas(canvasW, canvasH);
  canvas.style('display', 'block');
  canvas.style('margin', 'auto');

  // ✅ 限制 pixel ratio，避免 Retina 手機渲染超大畫面
  pixelDensity(isMobile ? 1 : min(pixelDensity(), 2));

  // ✅ 手機減少星砂數量（45→20）
  let spawnCount = isMobile ? 20 : 45;
  for (let i = 0; i < spawnCount; i++) {
    let imgIndex = i % imgFiles.length; 
    stars.push(new Star(imgFiles[imgIndex], scientificNames[imgIndex]));
  }

  // ✅ 手機減少初始氣泡（100→30）
  let initBubbles = isMobile ? 30 : 100;
  for (let i = 0; i < initBubbles; i++) {
    bubbles.push(new Bubble(random(width), random(height), true));
  }
}

function draw() {
  background(5, 8, 18);

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isDead()) bubbles.splice(i, 1);
  }

  // ✅ 手機降低氣泡生成頻率（12幀→30幀）且限制總數量
  let bubbleInterval = isMobile ? 30 : 12;
  let maxBubbles = isMobile ? 50 : 150;
  if (frameCount % bubbleInterval === 0 && bubbles.length < maxBubbles) {
    bubbles.push(new Bubble(random(width), height + 10, false));
  }

  for (let s of stars) {
    s.update(stars);
    s.display();
  }
}

class Bubble {
  constructor(x, y, isInitial) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, random(-0.3, -0.7));
    this.size = random(1.5, 3.5);
    this.wobbleAngle = random(TWO_PI);
    this.wobbleSpeed = random(0.02, 0.04);
    this.color = color(160, 230, 255, random(40, 100)); 
    this.isInitial = isInitial;
  }
  update() {
    this.pos.add(this.vel);
    this.wobbleAngle += this.wobbleSpeed;
    this.pos.x += sin(this.wobbleAngle) * 0.15;
    this.isInitial = false;
  }
  display() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
  isDead() {
    return this.pos.y < -10 && !this.isInitial;
  }
}

class Star {
  constructor(img, name) {
    this.img = img;
    this.name = name;
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-0.15, 0.15), random(-0.15, 0.15));
    this.size = random(80, 220); 
    this.originalSize = this.size;
    this.targetSize = this.size;
    this.angle = random(TWO_PI);
    this.rotSpeed = random(0.002, 0.005);
    this.alpha = 150; 
    this.glowValue = 0; 
    this.hoverTimer = 0; 
    this.isActivated = false; 
    this.labelAlpha = 0;
    // ✅ 手機改用 touch 追蹤
    this.touchActive = false;
  }

  update(allStars) {
    // ✅ 手機支援 touch，電腦用 mouse
    let inputX = (isMobile && touches.length > 0) ? touches[0].x : mouseX;
    let inputY = (isMobile && touches.length > 0) ? touches[0].y : mouseY;
    let mouse = createVector(inputX, inputY);
    let dToMouse = p5.Vector.dist(this.pos, mouse);

    if (dToMouse < this.size * 0.6) {
      let pushForce = p5.Vector.sub(this.pos, mouse);
      pushForce.setMag(0.18);
      this.vel.add(pushForce);
      this.hoverTimer++;
      if (this.hoverTimer > 55) this.isActivated = true; 
    } else {
      this.isActivated = false;
      this.hoverTimer = 0; 
    }

    let wallMargin = 40;
    if (this.pos.x < wallMargin) this.vel.x += 0.05;
    if (this.pos.x > width - wallMargin) this.vel.x -= 0.05;
    if (this.pos.y < wallMargin) this.vel.y += 0.05;
    if (this.pos.y > height - wallMargin) this.vel.y -= 0.05;

    if (this.isActivated) {
      this.alpha = lerp(this.alpha, 255, 0.1);
      this.glowValue = lerp(this.glowValue, 25, 0.1); 
      this.targetSize = this.originalSize * 1.08;
      this.labelAlpha = lerp(this.labelAlpha, 255, 0.1);
      this.vel.mult(0.6); 
      this.pos.x = constrain(this.pos.x, this.size/2, width-this.size/2);
      this.pos.y = constrain(this.pos.y, this.size/2, height-this.size/2);
    } else {
      this.alpha = lerp(this.alpha, 150, 0.05);
      this.glowValue = lerp(this.glowValue, 0, 0.1);
      this.targetSize = this.originalSize;
      this.labelAlpha = lerp(this.labelAlpha, 0, 0.1);
    }
    
    this.size = lerp(this.size, this.targetSize, 0.1);

    for (let other of allStars) {
      if (other !== this) {
        let d = p5.Vector.dist(this.pos, other.pos);
        let safeDistance = (this.size + other.size) * 0.45; 
        if (d < safeDistance) {
          let push = p5.Vector.sub(this.pos, other.pos);
          push.setMag(0.1); 
          this.vel.add(push);
        }
      }
    }

    this.vel.limit(this.isActivated ? 0.4 : 1.3); 
    this.pos.add(this.vel);
    this.vel.mult(0.96); 
    this.angle += this.rotSpeed;
  }

  display() {
    if (!this.img) return;
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);

    // ✅ 手機完全跳過 shadowBlur（最大效能殺手）
    if (!isMobile && this.glowValue > 0.5) {
      drawingContext.shadowBlur = this.glowValue;
      drawingContext.shadowColor = color(100, 200, 255, this.alpha);
    }

    tint(230, 245, 255, this.alpha);
    imageMode(CENTER);
    image(this.img, 0, 0, this.size, this.size);
    drawingContext.shadowBlur = 0;
    pop();

    if (this.labelAlpha > 1) this.drawSpecimenLabel();
  }

  drawSpecimenLabel() {
    textSize(13);
    textFont('sans-serif'); 
    let lines = this.name.split('\n');
    let tw = max(textWidth(lines[0]), textWidth(lines[1])) + 25;
    let th = 45; 
    let lx = this.pos.x + this.size * 0.35;
    let ly = this.pos.y - this.size * 0.35;
    if (lx + tw > width) lx = this.pos.x - this.size * 0.35 - tw;
    if (ly - 10 < 0) ly = this.pos.y + this.size * 0.35 + th;
    lx = constrain(lx, 10, width - tw - 10);
    ly = constrain(ly, 20, height - th - 20);
    push();
    translate(lx, ly);
    stroke(255, this.labelAlpha * 0.8);
    strokeWeight(1);
    line(0, 0, 0, 50); line(0, 0, 15, 0);
    noStroke();
    fill(0, 20, 40, this.labelAlpha * 0.8);
    rect(5, 5, tw, th, 4);
    textAlign(LEFT, TOP);
    fill(180, 230, 255, this.labelAlpha);
    textSize(11); textStyle(ITALIC);
    text(lines[0], 12, 10);
    fill(255, this.labelAlpha);
    textSize(13); textStyle(BOLD);
    text(lines[1], 12, 26);
    fill(255, this.labelAlpha);
    rect(5, 5, 3, 3);
    pop();
  }
}

function mousePressed() {
  for (let s of stars) {
    let mouse = createVector(mouseX, mouseY);
    let force = p5.Vector.sub(s.pos, mouse);
    if (force.mag() < 500) { 
      force.setMag(15);
      s.vel.add(force);
    }
  }
}

// ✅ 新增：手機 touch 點擊也能觸發星砂飛散
function touchStarted() {
  for (let s of stars) {
    let touch = createVector(touches[0].x, touches[0].y);
    let force = p5.Vector.sub(s.pos, touch);
    if (force.mag() < 500) { 
      force.setMag(15);
      s.vel.add(force);
    }
  }
  return false; // 防止頁面滾動
}