const target = document.querySelector('.target');
console.log(target);

// particles
/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load('particles-js', 'particlesjs-config.json', function() {
  console.log('callback - particles.js config loaded');
});

const drops = [];

function createDropElement(url, isAvatar = false){
  const div = document.createElement('div');
  div.className = 'drop';
  div.innerHTML = `
  <img class="bomb" src="images/bomb.png" alt="Bomb">
  <div class="user-image">
    <img class="${isAvatar ? 'avatar' : ''}" src="${url}">
  </div>`;
  return div;
}



function doDrop(url, isAvatar = false) {
  const element = createDropElement(url, isAvatar);
  const drop = {
    id: Date.now() + Math.random(),
    element,
    location: {
      x: window.innerWidth * Math.random(),
      y: -200,
    },
    velocity: {
      x: Math.random() * (Math.random() > 0.5 ? -1 : 1) * 3,  
      y: 2 + Math.random() * 3
    }
  };

  drops.push(drop);
  document.body.appendChild(element);
  updateDropPosition(drop);
}

function updateDropPosition(drop) {
  
  if(drop.landed) return;

  drop.element.style.top = drop.location.y + 'px';
  drop.element.style.left = (drop.location.x - (drop.element.clientWidth / 2)) + 'px';
}

function update(){
  const targetHalfWidth = target.clientWidth / 2;
  drops.forEach(drop => {

    if(drop.landed) return;

    drop.location.x += drop.velocity.x;
    drop.location.y += drop.velocity.y;

    const halfWidth = ( drop.element.clientWidth / 2);
    if(drop.location.x + halfWidth >= window.innerWidth) {
      drop.velocity.x = -Math.abs(drop.velocity.x);
    } else if (drop.location.x - halfWidth < 0) {
      drop.velocity.x = Math.abs(drop.velocity.x);
    }

    if(drop.location.y + (drop.element.clientHeight - 7) >= window.innerHeight) {
      drop.velocity.y = 0;
      drop.velocity.x = 0;
      drop.location.y = window.innerHeight - drop.element.clientHeight;
      drop.landed = true;
      drop.element.classList.add('landed');
      const {x} = drop.location; 
      // const score = ((1-Math.abs(window.innerWidth/2-x))/window.innerWidth/2)*100;
      const score = Math.abs((window.innerWidth / 10 * 3) - x );

      if(score <= targetHalfWidth) {
        console.log('Target hitted by:', drop);
        const finalScore = (1-(score/targetHalfWidth)) * 100;
        console.log(finalScore);
      }
    }
  });
}

function draw(){
  drops.forEach(updateDropPosition);
}

// https://static-cdn.jtvnw.net/jtv_user_pictures/2535a3b0-3f79-405b-b9f9-ac51563eda7a-profile_image-70x70.png

const emotes = [
  'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0',
  'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0',
  'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0',
  'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0',
  'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0',
];

emotes.forEach((el) => {
  doDrop(el, false);
});

doDrop('https://static-cdn.jtvnw.net/jtv_user_pictures/2535a3b0-3f79-405b-b9f9-ac51563eda7a-profile_image-70x70.png', true);

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();