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

let isMobile = /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent);

function preload() {
  for (let i = 0; i < 15; i++) {
    imgFiles[i] = loadImage((i + 1) + '.png');
  }
}

function setup() {
  let canvasW = 1270; 
  let canvasH = 2260;
  let canvas = createCanvas(canvasW, canvasH);
  canvas.style('display', 'block');
  canvas.style('margin', 'auto');
  canvas.style('width', '100%'); 
  canvas.style('height', 'auto');

  pixelDensity(isMobile ? 1 : min(pixelDensity(), 2));

  let spawnCount = isMobile ? 30 : 65; 
  for (let i = 0; i < spawnCount; i++) {
    let imgIndex = i % imgFiles.length; 
    stars.push(new Star(imgFiles[imgIndex], scientificNames[imgIndex]));
  }

  let initBubbles = isMobile ? 60 : 180;
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

  let bubbleInterval = isMobile ? 20 : 8;
  let maxBubbles = isMobile ? 100 : 300;
  if (frameCount % bubbleInterval === 0 && bubbles.length < maxBubbles) {
    bubbles.push(new Bubble(random(width), height + 20, false));
  }

  for (let s of stars) {
    s.update(stars);
    s.display();
  }
}

class Bubble {
  constructor(x, y, isInitial) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, random(-0.4, -1.2));
    this.size = random(2, 4.5); 
    this.wobbleAngle = random(TWO_PI);
    this.wobbleSpeed = random(0.02, 0.04);
    this.color = color(160, 230, 255, random(40, 100)); 
    this.isInitial = isInitial;
  }
  update() {
    this.pos.add(this.vel);
    this.wobbleAngle += this.wobbleSpeed;
    this.pos.x += sin(this.wobbleAngle) * 0.2;
    this.isInitial = false;
  }
  display() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
  isDead() {
    return this.pos.y < -20 && !this.isInitial;
  }
}

class Star {
  constructor(img, name) {
    this.img = img;
    this.name = name;
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-0.25, 0.25), random(-0.25, 0.25));
    
    this.size = random(120, 480); 
    this.originalSize = this.size;
    this.targetSize = this.size;
    this.angle = random(TWO_PI);
    this.rotSpeed = random(0.001, 0.003);
    this.alpha = 150; 
    this.glowValue = 0; 
    this.hoverTimer = 0; 
    this.isActivated = false; 
    this.labelAlpha = 0;
  }

  update(allStars) {
    let inputX = (isMobile && touches.length > 0) ? touches[0].x : mouseX;
    let inputY = (isMobile && touches.length > 0) ? touches[0].y : mouseY;
    let mouse = createVector(inputX, inputY);
    let dToMouse = p5.Vector.dist(this.pos, mouse);

    if (dToMouse < this.size * 0.5) {
      let pushForce = p5.Vector.sub(this.pos, mouse);
      pushForce.setMag(0.22);
      this.vel.add(pushForce);
      this.hoverTimer++;
      
      // ✅ 偵測幀數已改為 27
      if (this.hoverTimer > 27) this.isActivated = true; 
    } else {
      this.isActivated = false;
      this.hoverTimer = 0; 
    }

    let wallMargin = 60;
    if (this.pos.x < wallMargin) this.vel.x += 0.1;
    if (this.pos.x > width - wallMargin) this.vel.x -= 0.1;
    if (this.pos.y < wallMargin) this.vel.y += 0.1;
    if (this.pos.y > height - wallMargin) this.vel.y -= 0.1;

    if (this.isActivated) {
      this.alpha = lerp(this.alpha, 255, 0.1);
      this.glowValue = lerp(this.glowValue, 25, 0.1); 
      this.targetSize = this.originalSize * 1.1;
      this.labelAlpha = lerp(this.labelAlpha, 255, 0.1);
      this.vel.mult(0.7); 

      let padding = this.size * 0.6;
      this.pos.x = constrain(this.pos.x, padding, width - padding);
      this.pos.y = constrain(this.pos.y, padding, height - padding);
      
    } else {
      this.alpha = lerp(this.alpha, 160, 0.05);
      this.glowValue = lerp(this.glowValue, 0, 0.1);
      this.targetSize = this.originalSize;
      this.labelAlpha = lerp(this.labelAlpha, 0, 0.1);
    }
    
    this.size = lerp(this.size, this.targetSize, 0.1);

    for (let other of allStars) {
      if (other !== this) {
        let d = p5.Vector.dist(this.pos, other.pos);
        let safeDistance = (this.size + other.size) * 0.42; 
        if (d < safeDistance) {
          let push = p5.Vector.sub(this.pos, other.pos);
          push.setMag(0.12); 
          this.vel.add(push);
        }
      }
    }

    this.vel.limit(this.isActivated ? 0.9 : 2.2); 
    this.pos.add(this.vel);
    this.vel.mult(0.97); 
    this.angle += this.rotSpeed;
  }

  display() {
    if (!this.img) return;
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);

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
    let mainSize = 18;
    let subSize = 14;
    textSize(mainSize); 
    textFont('sans-serif'); 
    let lines = this.name.split('\n');
    let tw = max(textWidth(lines[0]), textWidth(lines[1])) + 30;
    let th = 60; 
    
    let lx = this.pos.x + this.size * 0.35;
    let ly = this.pos.y - this.size * 0.35;
    
    lx = constrain(lx, 40, width - tw - 40);
    ly = constrain(ly, 40, height - th - 40);
    
    push();
    translate(lx, ly);
    stroke(255, this.labelAlpha * 0.8);
    strokeWeight(1);
    line(0, 0, 0, 60); line(0, 0, 15, 0);
    noStroke();
    fill(0, 20, 40, this.labelAlpha * 0.8);
    rect(6, 6, tw, th, 4);
    
    textAlign(LEFT, TOP);
    fill(180, 230, 255, this.labelAlpha);
    textSize(subSize); textStyle(ITALIC); 
    text(lines[0], 15, 12);
    
    fill(255, this.labelAlpha);
    textSize(mainSize); textStyle(BOLD); 
    text(lines[1], 15, 32);
    
    fill(255, this.labelAlpha);
    rect(6, 6, 4, 4);
    pop();
  }
}

function mousePressed() {
  for (let s of stars) {
    let mouse = createVector(mouseX, mouseY);
    let force = p5.Vector.sub(s.pos, mouse);
    if (force.mag() < 800) { 
      force.setMag(25);
      s.vel.add(force);
    }
  }
}

function touchStarted() {
  if (touches.length > 0) {
    for (let s of stars) {
      let touch = createVector(touches[0].x, touches[0].y);
      let force = p5.Vector.sub(s.pos, touch);
      if (force.mag() < 800) { 
        force.setMag(25);
        s.vel.add(force);
      }
    }
  }
  return false; 
}
