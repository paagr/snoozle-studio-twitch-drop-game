/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load('particles-js', 'particlesjs-config.json', function() {
  console.log('callback - particles.js config loaded');
});

const target = document.querySelector('.target');
const leaderBoard = document.querySelector('.leader-board');

let drops = [];
const currentUsers = {};
let highScores = [];

// create drop element
function createDropElement(url, isAvatar = false){
  // create a div
  const div = document.createElement('div');
  // add a class
  div.className = 'drop';
  // insert html and pass the attributes
  div.innerHTML = `
  <img class="ufo" src="images/ufo.png" alt="ufo">
  <div class="user-image">
    <img class="${isAvatar ? 'avatar' : ''}" src="${url}">
  </div>`;
  return div;
}



function doDrop( { username, url, isAvatar = false }) {
  currentUsers[username] = true;
  
  // create the element
  const element = createDropElement(url, isAvatar);

  const drop = {
    username,
    element,
    location: {
      x: window.innerWidth * Math.random(),
      y: -200,
    },
    velocity: {
      x: 1 + Math.random() * (Math.random() > 0.5 ? -1 : 1) / 2,
      y: 2 + Math.random() * 3
    }
  };

  // put into array
  drops.push(drop);
  document.body.appendChild(element);
  updateDropPosition(drop);
}

function updateDropPosition(drop) {
  if(drop.landed) return;

  drop.element.style.top = drop.location.y + 'px';
  drop.element.style.left = (drop.location.x - (drop.element.clientWidth / 2)) + 'px';
}

function update() {
  const targetHalfWidth = target.clientWidth / 2;
  drops.forEach(drop => {
    if(drop.landed) return;

    drop.location.x += drop.velocity.x;
    drop.location.y += drop.velocity.y;
    const halfWidth = drop.element.clientWidth / 2;

    if(drop.location.x + halfWidth >= window.innerWidth) {
      drop.velocity.x = -Math.abs(drop.velocity.x);
    } else if (drop.location.x - halfWidth < 0) {
      drop.velocity.x = Math.abs(drop.velocity.x);
    }

    if(drop.location.y + drop.element.clientHeight >= window.innerHeight) {
      drop.velocity.y = 0;
      drop.velocity.x = 0;
      drop.location.y = window.innerHeight - drop.location.y;
      drop.landed = true;
      drop.element.classList.add('landed');
      const { x } = drop.location;
      const score = Math.abs(window.innerWidth / 2 - x);

      if(score <= targetHalfWidth) {
        const finalScore = (1 - (score / targetHalfWidth)) * 100;
        leaderBoard.style.display = 'block';
        highScores.push({
          username: drop.username,
          score: finalScore.toFixed(2)
        });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 5);
        renderLeaderBoard();
      }

      drops = drops.filter(d => d != drop);
      setTimeout(() => {
        currentUsers[drop.username] = false;
        document.body.removeChild(drop.element);
      }, 90000);
    }
  });
}

function renderLeaderBoard() {
  const scores = leaderBoard.querySelector('.scores');
  scores.innerHTML = highScores.reduceRight((html, {score, username}) => {
    return html + `<p>${score} ${username}</p>`;
  }, '');
}

function draw() {
  drops.forEach(updateDropPosition);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();


// eslint-disable-next-line no-undef
const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true
  },
	channels: [ 'snoozlestudio' ]
});

client.connect();

client.on('message', (channel, { emotes, username }, message) => {
	
  if(message.startsWith('!ufo')){

    if(currentUsers[username]) return;

    const args = message.split(' ');
    args.shift();
    const url = args.length ? args[0].trim() : '';
    if(emotes) {
      const emoteIds =  Object.keys(emotes);
      const emote = emoteIds[Math.floor(Math.random() * emoteIds.length)];
      doDrop({
        url: `https://static-cdn.jtvnw.net/emoticons/v2/${emote}/default/dark/2.0`,
        username
      });
    } else {
      console.log(username, url);
    }
  }
});