// TXI Interactive Universe - app.js
// Plain JS implementation: starfield canvas, interactive planets, and overlay carousel.

/* ========= Data (placeholder) ========= */
const PROJECTS = [
  {
    id:0,
    title: 'Project Aurora',
    summary: 'A modern platform for creative collaboration and discovery.',
    why: 'Built to connect creators and surface outstanding community work.',
    impact: 'Increased community engagement by 72% (placeholder).',
    team: [
      {name:'Alex Rivers', role:'PM'},
      {name:'Sam Lee', role:'Lead Dev'},
      {name:'Priya K', role:'Designer'}
    ]
  },
  {
    id:1,
    title: 'Project Polaris',
    summary: 'A data-driven insights dashboard for internal stakeholders.',
    why: 'Centralize analytics and make decisions visible.',
    impact: 'Reduced reporting time by 40% (placeholder).',
    team: [
      {name:'J. Carter', role:'Data Eng'},
      {name:'M. Zhao', role:'Frontend'},
      {name:'L. Ortiz', role:'Design'}
    ]
  },
  {
    id:2,
    title: 'Project Solstice',
    summary: 'A scalable publishing pipeline for content releases.',
    why: 'To streamline publication and QA.',
    impact: 'Cut time-to-publish by 62% (placeholder).',
    team: [
      {name:'R. Stone', role:'Infra'},
      {name:'C. Vega', role:'Engineering'},
      {name:'N. Patel', role:'PM'}
    ]
  }
];

/* ========= Starfield Canvas ========= */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let stars = [];

function resizeCanvas(){
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.scale(dpr,dpr);
  createStars();
}

function createStars(){
  stars = [];
  const count = Math.max(120, Math.floor((innerWidth*innerHeight)/6000));
  for(let i=0;i<count;i++){
    stars.push({
      x: Math.random()*innerWidth,
      y: Math.random()*innerHeight,
      r: Math.random()*1.6 + 0.2,
      alpha: Math.random()*0.9 + 0.1,
      twinkle: Math.random()*0.02 + 0.005
    });
  }
}

function drawStars(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  // subtle nebula glow
  const g = ctx.createLinearGradient(0,0,innerWidth,innerHeight);
  g.addColorStop(0,'rgba(7,16,33,0.2)');
  g.addColorStop(1,'rgba(2,6,16,0.2)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,innerWidth,innerHeight);

  // draw stars
  for(const s of stars){
    s.alpha += (Math.random()*2-1)*s.twinkle;
    s.alpha = Math.max(0.05, Math.min(1, s.alpha));
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,'+s.alpha+')';
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fill();
  }

  // draw faint constellations (connect a few random stars)
  ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(155,124,255,0.06)';
  for(let i=0;i<8;i++){
    const a = stars[Math.floor(Math.random()*stars.length)];
    const b = stars[Math.floor(Math.random()*stars.length)];
    if(!a||!b) continue;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  }
}

function animate(){
  drawStars();
  requestAnimationFrame(animate);
}

window.addEventListener('resize', ()=>{ resizeCanvas(); });
resizeCanvas();
requestAnimationFrame(animate);

/* ========= Interaction: Planets & Overlay ========= */
const planets = document.querySelectorAll('.project-planet');
const overlay = document.getElementById('project-overlay');
const overlayClose = document.getElementById('overlay-close');
const projectTitle = document.getElementById('project-title');
const carousel = document.getElementById('carousel');
const prevBtn = document.getElementById('prev-screen');
const nextBtn = document.getElementById('next-screen');
const backBtn = document.getElementById('back-to-universe');

let activeProject = null;
let screenIndex = 0;

function buildScreens(project){
  // create carousel wrapper and three screens
  const inner = document.createElement('div');
  inner.className = 'carousel-inner';

  // Screen 1: Visual / motion-driven explanation
  const s1 = document.createElement('section'); s1.className='screen visual';
  s1.innerHTML = `
    <div class="project-animation" aria-hidden="false">
      <!-- Simple SVG motion placeholder to be replaced by project-specific visuals -->
      <svg viewBox="0 0 200 200" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stop-color="#6be3ff"/>
            <stop offset="1" stop-color="#6b48ff"/>
          </linearGradient>
        </defs>
        <g>
          <circle cx="100" cy="100" r="34" fill="url(#g1)"></circle>
          <g id="orbits">
            <circle cx="100" cy="100" r="58" fill="none" stroke="rgba(255,255,255,0.03)"></circle>
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(107,227,255,0.02)"></circle>
          </g>
          <circle id="probe" cx="100" cy="42" r="6" fill="#fff">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    </div>
  `;

  // Screen 2: Meet the Team
  const s2 = document.createElement('section'); s2.className='screen team';
  const membersHtml = project.team.map(t=>`<div class="member"><div class="avatar"></div><div class="name">${t.name}</div><div class="role">${t.role}</div></div>`).join('');
  s2.innerHTML = `<div class="team-grid">${membersHtml}</div>`;

  // Screen 3: Project info
  const s3 = document.createElement('section'); s3.className='screen info';
  s3.innerHTML = `<div class="project-info"><h3>${project.title}</h3><p><strong>What:</strong> ${project.summary}</p><p><strong>Why:</strong> ${project.why}</p><p><strong>Impact:</strong> ${project.impact}</p></div>`;

  inner.appendChild(s1); inner.appendChild(s2); inner.appendChild(s3);
  carousel.innerHTML='';
  carousel.appendChild(inner);
}

function openProject(id, planetEl){
  const project = PROJECTS[id];
  if(!project) return;
  activeProject = project;
  projectTitle.textContent = project.title;
  buildScreens(project);
  screenIndex = 0; updateCarousel();

  // animate planet activation
  if(planetEl){
    planetEl.classList.add('activate');
    setTimeout(()=>{ planetEl.classList.remove('activate'); }, 900);
  }

  overlay.setAttribute('aria-hidden','false');
}

function closeOverlay(){
  overlay.setAttribute('aria-hidden','true');
  activeProject = null;
}

function updateCarousel(){
  const inner = carousel.querySelector('.carousel-inner');
  if(!inner) return;
  inner.style.transform = `translateX(${ -screenIndex * 100 }%)`;
}

planets.forEach(p=>{
  p.addEventListener('click', (e)=>{
    const id = parseInt(p.dataset.projectId,10);
    openProject(id, p);
  });
});

overlayClose.addEventListener('click', closeOverlay);
backBtn.addEventListener('click', closeOverlay);
prevBtn.addEventListener('click', ()=>{ screenIndex = (screenIndex+3-1)%3; updateCarousel(); });
nextBtn.addEventListener('click', ()=>{ screenIndex = (screenIndex+1)%3; updateCarousel(); });

document.addEventListener('keydown', (e)=>{
  if(overlay.getAttribute('aria-hidden')==='false'){
    if(e.key === 'Escape') closeOverlay();
    if(e.key === 'ArrowRight') { screenIndex=(screenIndex+1)%3; updateCarousel(); }
    if(e.key === 'ArrowLeft') { screenIndex=(screenIndex+3-1)%3; updateCarousel(); }
  }
});

/* Optional: gentle parallax for motifs and planets on mousemove */
document.addEventListener('mousemove', (e)=>{
  const cx = innerWidth/2, cy = innerHeight/2;
  const dx = (e.clientX-cx)/cx; const dy = (e.clientY-cy)/cy;
  document.querySelectorAll('.motif').forEach((m,i)=>{ m.style.transform = `translate(${dx*6*(i+1)}px,${dy*4*(i+1)}px) scale(${1})`; });
  // planets subtle tilt
  document.querySelectorAll('.project-planet').forEach((pl)=>{ pl.style.transform = `translate(-50%,-50%) rotateY(${dx*6}deg) rotateX(${ -dy*4 }deg)`; });
});

/* Accessibility: trap focus inside overlay when open (basic) */
overlay.addEventListener('keydown', (e)=>{
  if(e.key !== 'Tab') return;
  const focusables = overlay.querySelectorAll('button,a,[tabindex]:not([tabindex="-1"])');
  if(focusables.length===0) return;
  const first = focusables[0], last = focusables[focusables.length-1];
  if(e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
  else if(!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
});

/* Hint: replace placeholder PROJECTS array with real data or fetch it externally. */
