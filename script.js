let uploadedImage;
let checkboxCounter = 7;
let checkboxMarkedPath, checkboxBlankPath;

// Predefined default reasons
const defaultReasons = [
  "我被媒體帶風向了",
  "我沒有真的看比賽",
  "我只看賽後數據",
  "我不懂棒球",
  "我嫉妒他賺很多錢",
  "我忽略他連三年澤村賞"
];

// Initialize the checkbox paths using the SVG path data you provided
function preloadCheckboxIcons() {
  checkboxMarkedPath = createPathFromSVG('M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z');
  checkboxBlankPath = createPathFromSVG('M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z');
  injectDefaultReasons();
  updatePreview();
  initSortable();
}

// Create Path2D from SVG data
function createPathFromSVG(svgPath) {
  return new Path2D(svgPath);
}

// Function to add drag-and-drop sorting with Sortable.js
function initSortable() {
  const container = document.getElementById('checkboxContainer');
  Sortable.create(container, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: updatePreview // Trigger preview update after sorting
  });
}

// Inject default reasons dynamically
function injectDefaultReasons() {
  const container = document.getElementById('checkboxContainer');
  defaultReasons.forEach((reason, index) => {
    addCheckbox(container, reason, `reason${index + 1}`);
  });
}

// Add checkbox dynamically
function addCheckbox(container, labelText = '新選項', id = `reason${checkboxCounter}`) {
  const newCheckbox = document.createElement('div');
  newCheckbox.classList.add('form-check', 'd-flex', 'align-items-center');
  newCheckbox.innerHTML = `
    <span class="drag-handle">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M7 17h2v-2H7v2zm0-4h2v-2H7v2zm0-4h2V7H7v2zm4 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V7h-2v2zm4 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V7h-2v2z"/>
      </svg>
    </span>
    <input class="form-check-input mx-2" type="checkbox" id="${id}">
    <input type="text" class="form-check-label custom-input" value="${labelText}">
    <i class="fas fa-trash-alt ms-2 delete-checkbox" onclick="removeCheckbox(this)"></i>
  `;
  container.appendChild(newCheckbox);
  checkboxCounter++;

  // Update preview when checkbox changes
  newCheckbox.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updatePreview);
  });

  updatePreview();
}

// Remove checkbox dynamically
function removeCheckbox(element) {
  const container = document.getElementById('checkboxContainer');
  container.removeChild(element.parentElement);
  updatePreview(); // Update preview when checkbox is removed
}

// Handle image upload
document.getElementById('uploadPhoto').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      uploadedImage = new Image();
      uploadedImage.src = e.target.result;
      uploadedImage.onload = updatePreview;
    };
    reader.readAsDataURL(file);
  }
});

// Add new checkbox
document.getElementById('addCheckbox').addEventListener('click', function () {
  const container = document.getElementById('checkboxContainer');
  addCheckbox(container);
  initSortable(); // Re-initialize sortable for new checkbox
});

// Add event listeners for input updates
['playerName', 'apologizer', 'apologyDate', 'promise'].forEach(id => {
  document.getElementById(id).addEventListener('input', updatePreview);
});

// Adjust canvas height based on the number of checkboxes
function adjustCanvasSize(reasonsCount) {
  const baseHeight = 640;
  const extraHeightPerRow = 50; // Additional height for each extra row
  const baseRows = 3; // Default for 6 checkboxes
  const rows = Math.ceil(reasonsCount / 2); // 2-column layout
  const extraRows = rows - baseRows;
  return baseHeight + (extraRows > 0 ? extraRows * extraHeightPerRow : 0);
}

// Update preview on canvas
function updatePreview() {
  const canvas = document.getElementById('memeCanvas');
  const ctx = canvas.getContext('2d');

  const reasons = document.querySelectorAll('#checkboxContainer .form-check');
  const canvasHeight = adjustCanvasSize(reasons.length);

  canvas.width = 640;
  canvas.height = canvasHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw uploaded image
  const imageX = 36;
  const imageY = 15;
  const imageWidth = 150;
  const imageHeight = 230;
  if (uploadedImage) {
    const imgAspectRatio = uploadedImage.width / uploadedImage.height;
    const frameAspectRatio = imageWidth / imageHeight;

    let drawWidth, drawHeight;
    if (imgAspectRatio > frameAspectRatio) {
      drawWidth = imageWidth;
      drawHeight = imageWidth / imgAspectRatio;
    } else {
      drawHeight = imageHeight;
      drawWidth = imageHeight * imgAspectRatio;
    }
    const offsetX = imageX + (imageWidth - drawWidth) / 2;
    const offsetY = imageY + (imageHeight - drawHeight) / 2;
    ctx.drawImage(uploadedImage, offsetX, offsetY, drawWidth, drawHeight);
  } else {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);
  }

  // Draw player name and "道歉表"
  const playerName = document.getElementById('playerName').value || '選手名字';
  ctx.font = '42px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000';
  const titleX = 420, titleY = 100;
  ctx.fillText(playerName, titleX, titleY);
  ctx.fillText('道歉表', titleX, titleY + 60);

  // Draw apologizer and date
  const apologizer = document.getElementById('apologizer').value;
  const apologizerX = 45;
  const apologizerY = imageY + imageHeight + 60;
  ctx.font = '30px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`道歉人：${apologizer}`, apologizerX, apologizerY);

  const apologyDate = document.getElementById('apologyDate').value;
  const apologyDateX = canvas.width / 2 + 20;
  const apologyDateY = apologizerY;
  ctx.fillText(`日期：${apologyDate}`, apologyDateX, apologyDateY);

  // Draw apology reasons
  const apologyReasonX = apologizerX;
  const apologyReasonY = apologizerY + 60;
  ctx.fillText('道歉原因：', apologyReasonX, apologyReasonY);

  ctx.font = '20px Arial';
  const reasonBaseY = apologyReasonY + 50;
  const reasonMargin = 50, iconSize = 20;

  reasons.forEach((reason, index) => {
    const checkboxElement = reason.querySelector('input[type="checkbox"]');
    const labelText = reason.querySelector('input[type="text"]').value;

    const x = index % 2 === 0 ? 45 : canvas.width / 2 + 10;
    const y = reasonBaseY + Math.floor(index / 2) * reasonMargin;

    const iconY = y - iconSize / 2 - 9;
    ctx.save();
    ctx.translate(x, iconY);
    ctx.scale(2.0, 2.0);

    if (checkboxElement.checked) {
      ctx.fill(checkboxMarkedPath);
    } else {
      ctx.fill(checkboxBlankPath);
    }
    ctx.restore();
    ctx.fillText(`${labelText}`, x + 50, y + 12);
  });

  // Draw declaration
  const declarationY = reasonBaseY + Math.ceil(reasons.length / 2) * reasonMargin + 25;
  const promise = document.getElementById('promise').value;

  const apologizerUnderline = apologizer || '　　　';
  const apologizerWidth = ctx.measureText(apologizerUnderline).width;
  const playerNameWidth = ctx.measureText(playerName).width;
  const staticTextWidth = ctx.measureText("本人 在此向 道歉").width;
  const totalWidth = staticTextWidth + apologizerWidth + playerNameWidth;

  const startX = (canvas.width - totalWidth) / 2 + ctx.measureText("本人 ").width - 7;
  const endX = startX + apologizerWidth + 3;

  ctx.font = '20px Arial';
  ctx.textAlign = 'center';

  ctx.beginPath();
  ctx.moveTo(startX, declarationY + 5);
  ctx.lineTo(endX, declarationY + 5);
  ctx.strokeStyle = '#000';
  ctx.stroke();

  ctx.fillText(`本人 ${apologizerUnderline} 在此向 ${playerName} 道歉`, canvas.width / 2, declarationY);
  ctx.fillText(`並保證${promise}`, canvas.width / 2, declarationY + 30);
}

// Download the canvas image
document.getElementById('downloadMeme').addEventListener('click', function () {
  const canvas = document.getElementById('memeCanvas');
  const link = document.createElement('a');
  const playerName = document.getElementById('playerName').value || '選手';
  link.download = `${playerName}道歉表.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();

  // GA4 custom event tracking
  gtag('event', 'download_image', {
    event_category: 'engagement',
    event_label: 'Download Image Button',
    value: 1
  });
});

// Custom GA event tracking
document.getElementById('noteLink').addEventListener('click', function () {
  gtag('event', 'click', {
    event_category: 'Footer',
    event_label: 'Note'
  });
});

document.getElementById('demoLink').addEventListener('click', function () {
  gtag('event', 'click', {
    event_category: 'Footer',
    event_label: 'Demo'
  });
});

document.getElementById('codeLink').addEventListener('click', function () {
  gtag('event', 'click', {
    event_category: 'Footer',
    event_label: 'Code'
  });
});

document.getElementById('githubNoteLink').addEventListener('click', function () {
  gtag('event', 'click', {
    event_category: 'Note',
    event_label: 'GitHub Repo'
  });
});

document.getElementById('pttNoteLink').addEventListener('click', function () {
  gtag('event', 'click', {
    event_category: 'Note',
    event_label: 'PTT Article'
  });
});

// Initialize everything
preloadCheckboxIcons();