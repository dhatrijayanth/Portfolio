//Ripple is a pond that rains words, and clicking the ones you like makes it give you more of them, closer and closer together, until one word falls in one place and there is nothing left to find. I built it because I wanted to see the moment a system stops being able to surprise me, and because I can no longer tell the difference between what I chose and what I was shown often enough to choose. Halfway through, the pond stops listening to me and starts listening to the weather over Austin, where words appear that were never in its list, because a system closed inside its own logic can only rearrange what it already holds. Randomness is only truly random when outside sources are introduced to closed system and closed turns into an open system.
//


let bgImage;

  
let ripples = [];
let words = ["drift", "fade", "rain", "flow", "dissolve", "echo"];
let weights = [1, 1, 1, 1, 1, 1];
let tapCounts = [0, 0, 0, 0, 0, 0];

let newWords = ["rift", "drain", "flood", "drown", "dust", "overflow"];
let rainMode = false;
let favX, favY;
let taps = 0;

let hint = 255;
let hintText = "click the ripples you like";
let subHint = "it learns from what you click, the way a feed does";

let base = 16;

let weather = null;
let dropInterval = 40;
let lastFetch = 0;

let seenInRain = [];
let rainStart = 0;
let cardAlpha = 0;


function preload() {
 
  bgImage = loadImage(
    'ripple-bg.jpg',
    () => {}, // success: nothing extra needed
    (err) => {
      console.error(
        "ripple-bg.jpg failed to load. Check that it's spelled/cased " +
        "exactly right and sits next to sketch.js (or in /data), and that " +
        "you're running this through a local server, not double-clicking " +
        "the html file.",
        err
      );
    }
  );
}

function setup() {
  createCanvas(800, 600);
  favX = width / 2;
  favY = height / 2;
}

function draw() {
  if (bgImage) {
    image(bgImage, 0, 0, bgImage.width / 2.3, bgImage.height / 2.3);
  } else {
  
    background(20, 26, 31);
  }

  let gap = rainMode ? dropInterval : 25;
  if (frameCount % gap == 0) {
    if (rainMode) {
      addRipple(random(width), random(height), random(words.concat(newWords)));
    } else {
      let p = personalization();
      let x = lerp(random(width), favX, p);
      let y = lerp(random(height), favY, p);
      addRipple(x, y, pickWord());
    }
  }

  if (rainMode && frameCount - lastFetch > 3600) {
    getWeather();
  }

  for (let i = 0; i < ripples.length; i++) {
    let r = ripples[i];
    drawRipple(r);
    r.size = r.size + 2;
    r.opacity = r.opacity - 2;
  }

  for (let i = ripples.length - 1; i >= 0; i--) {
    if (ripples[i].opacity <= 0) {
      ripples.splice(i, 1);
    }
  }

  drawHint();
  drawFeedTag();
  drawTransition();
  drawCard();
  drawHUD();
}

function drawHint() {
  if (rainMode) return;

  noStroke();
  textAlign(CENTER, CENTER);

  if (taps === 0) {
    hint = max(hint - 0.4, 90);
    textSize(base * 1.4);
    fill(255, hint);
    text(hintText, width / 2, height / 2);

    textSize(base * 0.75);
    fill(255, hint * 0.75);
    text(subHint, width / 2, height / 2 + base * 1.7);
  } else if (hint > 0) {
    hint = hint - 6;
    textSize(base * 1.4);
    fill(255, hint);
    text(hintText, width / 2, height / 2);
  }

  textSize(base);
  noFill();
}


function drawFeedTag() {
  if (rainMode) return;
  let p = personalization();
  if (p <= 0.6) return;

  let a = ((p - 0.6) / 0.4) * 160;
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(base * 0.7);
  fill(255, a);
  text("recommended for you", favX, favY + 34);

  textSize(base);
  noFill();
}


function drawTransition() {
  if (!rainMode) return;
  let age = frameCount - rainStart;
  if (age > 300) return;

  let a = age < 150 ? map(age, 0, 150, 0, 220) : map(age, 150, 300, 220, 0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(base * 1.1);
  fill(255, a);
  text("the feed stops listening to you.\nit starts listening to the sky.", width / 2, height / 2 - 70);

  textSize(base);
  noFill();
}

function drawRipple(r) {
  wobblyRing(r.x, r.y, r.size,        r.opacity * 0.9, r.seed);
  wobblyRing(r.x, r.y, r.size * 0.94, r.opacity * 0.4, r.seed + 5);
  wobblyRing(r.x, r.y, r.size * 1.05, r.opacity * 0.2, r.seed + 9);

  noStroke();
  textAlign(CENTER, CENTER);
  textSize(base);
  fill(255, r.opacity);
  text(r.word, r.x, r.y);
  noFill();
}

function addRipple(x, y, w) {
  if (rainMode && !seenInRain.includes(w)) {
    seenInRain.push(w);
  }
  ripples.push({ x: x, y: y, size: 0, opacity: 255, word: w, seed: random(100) });
}

function wobblyRing(x, y, d, a, seed) {
  stroke(255, a);
  strokeWeight(1.2);
  noFill();
  beginShape();
  for (let ang = 0; ang < TWO_PI; ang += 0.15) {
    let n = noise(cos(ang) + 1 + seed, sin(ang) + 1 + seed);
    let r = (d / 2) * (0.92 + n * 0.16);
    vertex(x + cos(ang) * r, y + sin(ang) * r);
  }
  endShape(CLOSE);
}

function pickWord() {
  let total = 0;
  for (let i = 0; i < weights.length; i++) {
    total = total + weights[i];
  }
  let pick = random(total);
  let running = 0;
  for (let i = 0; i < words.length; i++) {
    running = running + weights[i];
    if (pick < running) {
      return words[i];
    }
  }
  return words[0];
}

function personalization() {
  return constrain(taps / 7, 0, 1);
}

function topTap() {
  let best = 0;
  for (let i = 1; i < tapCounts.length; i++) {
    if (tapCounts[i] > tapCounts[best]) {
      best = i;
    }
  }
  return { word: words[best], count: tapCounts[best] };
}


function drawCard() {
  if (!rainMode) return;
  if (frameCount - rainStart < 480) return;

  let t = topTap();
  if (t.count === 0) return;

  let age = frameCount - rainStart - 480;   //
  if (age < 1800) {
    cardAlpha = min(cardAlpha + 2.5, 200);   //
  } else {
    cardAlpha = max(cardAlpha - 1, 0);       // fade out over ~3 seconds
  }
  if (cardAlpha <= 0) return;

  let fresh = 0;
  for (let i = 0; i < seenInRain.length; i++) {
    if (newWords.includes(seenInRain[i])) {
      fresh = fresh + 1;
    }
  }

  noStroke();
  textAlign(CENTER, CENTER);


  textSize(base * 0.9);
  fill(255, cardAlpha * 0.7);
  text(t.word + ", " + t.count + " times: a feed fed only by you.",
       width / 2, height / 2 - 44);

  text(fresh + " of " + seenInRain.length + " new words didn't come from your taste. they came from the weather.",
       width / 2, height / 2 - 10);

  textSize(base * 1.05);
  fill(255, cardAlpha);
  text("a system that only reflects its user converges on itself.\ntrue randomness requires an external source.",
       width / 2, height / 2 + 48);

  textSize(base);
  noFill();
}

function drawHUD() {

  noStroke();
  fill(0, 90);
  rect(0, height - 46, width, 46);

  fill(220);
  textAlign(LEFT, CENTER);
  textSize(13);

  if (rainMode) {
    if (weather) {
      text("austin, now  ·  wind " + weather.wind_speed_10m + " km/h  ·  " +
           weather.surface_pressure + " hPa", 24, height - 24);
    } else {
      text("asking the sky…", 24, height - 24);
    }
  } else {
    let p = personalization();
    text("feed tuned to you " + round(p * 100) + "%   ·   clicks " + taps, 24, height - 24);

    if (p > 0.9) {

      let pulse = 170 + 70 * sin(frameCount * 0.05);
      textAlign(CENTER, CENTER);
      textSize(base * 1.3);
      fill(255, pulse);
      text("press R to let it rain", width / 2, height * 0.84);
      textSize(13);
    }
  }

  textAlign(CENTER, CENTER);
  textSize(base);
  noFill();
}

function mouseClicked() {
  let hit = -1;
  let closest = 50;

  for (let i = 0; i < ripples.length; i++) {
    let r = ripples[i];
    if (r.opacity < 40) continue;

    let d = dist(mouseX, mouseY, r.x, r.y);
    let toRing = abs(d - r.size / 2);        // the ring itself
    let toWord = d < 50 ? d : 9999;          // the word in the middle
    let near = min(toRing, toWord);

    if (near < closest) {
      closest = near;
      hit = i;
    }
  }

  if (hit >= 0 && !rainMode) {
    let index = words.indexOf(ripples[hit].word);
    if (index >= 0) {
      weights[index] = weights[index] + 10;
      tapCounts[index] = tapCounts[index] + 1;

      for (let i = 0; i < weights.length; i++) {
        if (i !== index) {
          weights[i] = max(weights[i] * 0.75, 0.15);
        }
      }
    }
    favX = lerp(favX, ripples[hit].x, 0.4);
    favY = lerp(favY, ripples[hit].y, 0.4);
    taps = taps + 1;

    // visible confirmation that the click landed
    ripples[hit].opacity = 255;
    ripples[hit].size = ripples[hit].size * 0.7;
  }

  addRipple(mouseX, mouseY, rainMode ? random(words.concat(newWords)) : pickWord());
}

function keyPressed() {
  if ((key === "r" || key === "R") && !rainMode) {
    rainMode = true;
    rainStart = frameCount;
    getWeather();
  }
}

function getWeather() {
  let url = "https://api.open-meteo.com/v1/forecast" +
            "?latitude=30.2672&longitude=-97.7431" +
            "&current=wind_speed_10m,surface_pressure,precipitation";
  loadJSON(url, gotWeather);
  lastFetch = frameCount;
}

function gotWeather(data) {
  weather = data.current;

  dropInterval = round(constrain(70 - weather.wind_speed_10m * 3, 12, 90));

  if (weather.precipitation > 0) {
    dropInterval = round(dropInterval / 3);
  }

  randomSeed(floor(weather.surface_pressure * 100) + floor(weather.wind_speed_10m * 1000));
}