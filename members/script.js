// Populate team code from URL query string (e.g., ?team=1234)
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const teamCode = urlParams.get('team') || '';
  document.getElementById('teamCode').value = teamCode;

  // Show/hide upload fields based on checkbox
  for (let i = 1; i <= 11; i++) {
    const enableBox = document.getElementById(`enable${i}`);
    const uploadFields = document.querySelector(`#upload-row-${i} .upload-fields`);
    enableBox.addEventListener('change', function() {
      if (enableBox.checked) {
        uploadFields.style.display = '';
      } else {
        uploadFields.style.display = 'none';
        // Clear file and comment if unchecked
        document.getElementById(`image${i}`).value = '';
        document.getElementsByName(`comment${i}`)[0].value = '';
      }
      updatePrice();
    });
  }

  // Price calculation
  const priceSpan = document.getElementById('price');
  function updatePrice() {
    let count = 0;
    for (let i = 1; i <= 11; i++) {
      const enableBox = document.getElementById(`enable${i}`);
      if (enableBox && enableBox.checked) count++;
    }
    // Base price 100 SAR, first 3 images free, from 4th image each adds 25 SAR
    let price = 255;
    if (count > 3) {
      price += (count - 3) * 10;
    }
    priceSpan.textContent = price;
  }
  updatePrice();

  // Color swatch selection logic
  function setupColorSwatches(swatchContainerId, inputId) {
    const container = document.getElementById(swatchContainerId);
    if (!container) return;
    const input = document.getElementById(inputId);
    const swatches = container.querySelectorAll('.color-swatch');
    function selectSwatch(color) {
      input.value = color;
      swatches.forEach(btn => {
        if (btn.getAttribute('data-color') === color) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });
    }
    swatches.forEach(btn => {
      btn.addEventListener('click', function() {
        selectSwatch(btn.getAttribute('data-color'));
      });
    });
    // Set initial selection
    selectSwatch(input.value);
  }
  setupColorSwatches('jacketColorSwatches', 'jacketColor');
  setupColorSwatches('sleeveColorSwatches', 'sleeveColor');

  // Show checkpoint when color is selected
  function setupColorCheckpoint(radioName, checkpointId) {
    const radios = document.getElementsByName(radioName);
    const checkpoint = document.getElementById(checkpointId);
    function updateCheckpoint() {
      let checked = false;
      radios.forEach ? radios.forEach(r => { if (r.checked) checked = true; }) : Array.from(radios).forEach(r => { if (r.checked) checked = true; });
      checkpoint.style.display = checked ? '' : 'none';
    }
    radios.forEach ? radios.forEach(r => r.addEventListener('change', updateCheckpoint)) : Array.from(radios).forEach(r => r.addEventListener('change', updateCheckpoint));
    updateCheckpoint();
  }
  setupColorCheckpoint('jacketColor', 'jacketColorCheckpoint');
  setupColorCheckpoint('sleeveColor', 'sleeveColorCheckpoint');

  // Sleeve rubber color preview logic (rebuilt)
  const sleeveRubberSelect = document.getElementById('sleeveRubberColorSelect');
  const sleeveRubberPreview = document.getElementById('sleeveRubberColorPreview');
  const sleeveRubberImg = document.getElementById('sleeveRubberColorImg');
  const sleeveRubberLabel = document.getElementById('sleeveRubberColorLabel');
  if (sleeveRubberSelect) {
    sleeveRubberSelect.addEventListener('change', function() {
      const selected = sleeveRubberSelect.options[sleeveRubberSelect.selectedIndex];
      if (sleeveRubberSelect.value) {
        sleeveRubberImg.src = sleeveRubberSelect.value;
        sleeveRubberLabel.textContent = selected.text;
        sleeveRubberPreview.style.display = 'flex';
      } else {
        sleeveRubberPreview.style.display = 'none';
        sleeveRubberImg.src = '';
        sleeveRubberLabel.textContent = '';
      }
    });
    // Show preview if already selected (e.g. after reload)
    if (sleeveRubberSelect.value) {
      const selected = sleeveRubberSelect.options[sleeveRubberSelect.selectedIndex];
      sleeveRubberImg.src = sleeveRubberSelect.value;
      sleeveRubberLabel.textContent = selected.text;
      sleeveRubberPreview.style.display = 'flex';
    }
  }

  // Form submission: send as FormData to n8n webhook
  document.getElementById('jacketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('teamCode', document.getElementById('teamCode').value);
    formData.append('name', document.getElementById('name').value);
    formData.append('phoneCountry', document.getElementById('phoneCountry').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('jacketName', document.getElementById('jacketName').value);
    formData.append('size', document.getElementById('size').value);
    formData.append('jacketColor', document.getElementById('jacketColor').value);
    formData.append('sleeveColor', document.getElementById('sleeveColor').value);
    formData.append('sleeveRubberColor', document.getElementById('sleeveRubberColor').value);
    for (let i = 1; i <= 11; i++) {
      if (document.getElementById(`enable${i}`).checked) {
        const fileInput = document.getElementById(`image${i}`);
        const comment = document.getElementsByName(`comment${i}`)[0].value;
        if (fileInput.files.length > 0) {
          formData.append(`image${i}`, fileInput.files[0]);
        }
        formData.append(`comment${i}`, comment);
      }
    }
    fetch('https://n8n.srv886746.hstgr.cloud/webhook-test/70598a9b-fe09-4b8b-8311-7e310db53ba8', {
      method: 'POST',
      body: formData
    })
    .then(res => {
      if (res.ok) {
        alert('تم إرسال الطلب بنجاح!');
      } else {
        alert('حدث خطأ أثناء الإرسال.');
      }
    });
  });
}); 
