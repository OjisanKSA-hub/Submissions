// Populate team code from URL query string (e.g., ?team=1234)
document.addEventListener('DOMContentLoaded', function() {
  console.log('JS loaded');
  const urlParams = new URLSearchParams(window.location.search);
  const teamCode = urlParams.get('team') || '';
  document.getElementById('teamCode').value = teamCode;

  // Show/hide upload fields based on checkbox
  for (let i = 1; i <= 10; i++) {
    const enableBox = document.getElementById(`enable${i}`);
    const uploadFields = document.querySelector(`#upload-row-${i} .upload-fields`);
    if (!enableBox || !uploadFields) continue;
    enableBox.addEventListener('change', function() {
      if (enableBox.checked) {
        uploadFields.classList.add('show');
      } else {
        uploadFields.classList.remove('show');
        // Clear file and comment if unchecked
        document.getElementById(`image${i}`).value = '';
        document.getElementsByName(`comment${i}`)[0].value = '';
      }
      updatePrice();
    });
  }

  // Show/hide comment fields for additions
  function setupAdditionComment(checkboxId, commentId) {
    const checkbox = document.getElementById(checkboxId);
    const comment = document.getElementById(commentId);
    if (checkbox && comment) {
      checkbox.addEventListener('change', function() {
        comment.style.display = checkbox.checked ? '' : 'none';
      });
    }
  }
  setupAdditionComment('freeAdd2', 'freeAdd2Comment');
  setupAdditionComment('paidAdd1', 'paidAdd1Comment');
  // Show/hide paidAdd1 image field as well
  const paidAdd1Checkbox = document.getElementById('paidAdd1');
  const paidAdd1Image = document.getElementById('paidAdd1Image');
  if (paidAdd1Checkbox && paidAdd1Image) {
    paidAdd1Checkbox.addEventListener('change', function() {
      paidAdd1Image.style.display = paidAdd1Checkbox.checked ? '' : 'none';
    });
  }
  setupAdditionComment('paidAdd2', 'paidAdd2Comment');

  // Price calculation
  const priceSpan = document.getElementById('price');
  function updatePrice() {
    let price = 255;
    // Designs that are free
    const freeDesigns = [3, 7];
    // Designs that are 20 SAR
    const twentySarDesigns = [6, 10];
    for (let i = 1; i <= 10; i++) {
      const enableBox = document.getElementById(`enable${i}`);
      if (enableBox && enableBox.checked && !freeDesigns.includes(i)) {
        if (twentySarDesigns.includes(i)) {
          price += 20;
        } else {
          price += 10;
        }
      }
    }
    // Paid additions
    const paidAdditions = [
      { id: 'paidAdd1', amount: 35 },
      { id: 'paidAdd3', amount: 35 },
      { id: 'paidAdd4', amount: 50 }
    ];
    paidAdditions.forEach(add => {
      const checkbox = document.getElementById(add.id);
      if (checkbox && checkbox.checked) {
        price += add.amount;
      }
    });
    priceSpan.textContent = price;
  }

  // Add event listeners for paid additions to update price
  ['paidAdd1','paidAdd2','paidAdd3','paidAdd4','freeAdd1','freeAdd2','freeAdd3','freeAdd4'].forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.addEventListener('change', updatePrice);
    }
  });
  updatePrice();

  // Color selection logic for radio buttons
  function setupColorSelection(radioName) {
    const radios = document.getElementsByName(radioName);
    if (radios.length > 0) {
      // Add visual feedback for selected colors
      radios.forEach(radio => {
        radio.addEventListener('change', function() {
          // Remove selected class from all swatches in this group
          const allSwatches = document.querySelectorAll(`input[name="${radioName}"]`);
          allSwatches.forEach(swatch => {
            swatch.closest('.color-swatch').classList.remove('selected');
          });
          // Add selected class to the checked one
          if (this.checked) {
            this.closest('.color-swatch').classList.add('selected');
          }
        });
      });
    }
  }
  setupColorSelection('jacketColor');
  setupColorSelection('sleeveColor');

  // Sleeve rubber color preview logic (simple, like OjiOrder)
  const sleeveRubberSelect = document.getElementById('sleeveRubberColorSelect');
  const sleeveRubberPreview = document.getElementById('sleeveRubberColorPreview');
  const sleeveRubberImg = document.getElementById('sleeveRubberColorImg');
  const sleeveRubberLabel = document.getElementById('sleeveRubberColorLabel');

  if (sleeveRubberSelect) {
    sleeveRubberSelect.addEventListener('change', function() {
      const selectedOption = sleeveRubberSelect.options[sleeveRubberSelect.selectedIndex];
      if (sleeveRubberSelect.value) {
        // Use the data-image attribute for the preview image
        const imagePath = selectedOption.getAttribute('data-image');
        if (imagePath) {
          sleeveRubberImg.src = imagePath;
        }
        sleeveRubberLabel.textContent = selectedOption.text;
        sleeveRubberPreview.style.display = 'flex';
      } else {
        sleeveRubberPreview.style.display = 'none';
      }
    });
  }

  // Form submission: send as FormData to n8n webhook
  document.getElementById('jacketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    const getValue = id => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };
    const getRadioValue = name => {
      const radios = document.getElementsByName(name);
      for (let radio of radios) {
        if (radio.checked) {
          return radio.value;
        }
      }
      return '';
    };
    formData.append('teamCode', getValue('teamCode'));
    formData.append('name', getValue('name'));
    formData.append('phoneCountry', getValue('phoneCountry'));
    formData.append('phone', getValue('phone'));
    formData.append('jacketName', getValue('jacketName'));
    formData.append('size', getValue('size'));
    formData.append('sleeveType', getValue('sleeveType'));
    formData.append('jacketColor', getRadioValue('jacketColor'));
    formData.append('sleeveColor', getRadioValue('sleeveColor'));
    formData.append('sleeveRubberColor', getValue('sleeveRubberColorSelect'));
    // Send selected designs
    for (let i = 1; i <= 10; i++) {
      if (document.getElementById(`enable${i}`) && document.getElementById(`enable${i}`).checked) {
        const fileInput = document.getElementById(`image${i}`);
        const commentInput = document.getElementsByName(`comment${i}`)[0];
        const comment = commentInput ? commentInput.value : '';
        if (fileInput && fileInput.files.length > 0) {
          formData.append(`image${i}`, fileInput.files[0]);
        }
        formData.append(`comment${i}`, comment);
      }
    }
    // Send free additions
    for (let i = 1; i <= 2; i++) {
      const checkbox = document.getElementById(`freeAdd${i}`);
      if (checkbox && checkbox.checked) {
        const label = document.querySelector(`label[for='freeAdd${i}']`);
        formData.append(`freeAdd${i}`, label ? label.textContent.trim() : '');
        if (i === 2) {
          const commentInput = document.getElementById('freeAdd2Comment');
          formData.append('freeAdd2Comment', commentInput ? commentInput.value : '');
        }
      }
    }
    // Send paid additions
    [1, 3, 4].forEach(i => {
      const checkbox = document.getElementById(`paidAdd${i}`);
      if (checkbox && checkbox.checked) {
        const label = document.querySelector(`label[for='paidAdd${i}']`);
        formData.append(`paidAdd${i}`, label ? label.textContent.trim() : '');
        if (i === 1) {
          const commentInput = document.getElementById('paidAdd1Comment');
          formData.append('paidAdd1Comment', commentInput ? commentInput.value : '');
          const imageInput = document.getElementById('paidAdd1Image');
          if (imageInput && imageInput.files.length > 0) {
            formData.append('paidAdd1Image', imageInput.files[0]);
          }
        }
      }
    });
    // Send final price
    formData.append('finalPrice', document.getElementById('price').textContent);
    fetch('https://n8n.srv886746.hstgr.cloud/webhook/3634ec6c-6ed9-4c34-99f7-62b26495266d', {
      method: 'POST',
      body: formData
    })
    .then(res => {
      if (res.ok) {
        window.location.href = 'success.html';
      } else {
        alert('حدث خطأ أثناء الإرسال.');
      }
    });
  });
}); 
