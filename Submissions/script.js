// Populate team code from URL query string (e.g., ?team=1234)
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const teamCode = urlParams.get('team') || '';
  document.getElementById('teamCode').value = teamCode;

  // Show/hide upload fields based on checkbox
  for (let i = 1; i <= 9; i++) {
    const enableBox = document.getElementById(`enable${i}`);
    const uploadFields = document.querySelector(`#upload-row-${i} .upload-fields`);
    const fileInput = document.getElementById(`image${i}`);
    
    enableBox.addEventListener('change', function() {
      if (enableBox.checked) {
        uploadFields.classList.add('show');
      } else {
        uploadFields.classList.remove('show');
        // Clear file and comment if unchecked
        fileInput.value = '';
        document.getElementsByName(`comment${i}`)[0].value = '';
      }
      updatePrice();
    });
    
    // File size validation (10MB max)
    fileInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
          alert(`حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت.`);
          this.value = ''; // Clear the file input
          return;
        }
      }
    });
  }

  // Price calculation
  const priceSpan = document.getElementById('price');
  function updatePrice() {
    let count = 0;
    for (let i = 1; i <= 9; i++) {
      const enableBox = document.getElementById(`enable${i}`);
      if (enableBox && enableBox.checked) count++;
    }
    // Base price 100 SAR, first 3 images free, from 4th image each adds 25 SAR
    let price = 100;
    if (count > 3) {
      price += (count - 3) * 15;
    }
    priceSpan.textContent = price;
  }
  updatePrice();

  // Form submission: send as FormData to n8n webhook
  document.getElementById('jacketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('teamCode', document.getElementById('teamCode').value);
    formData.append('name', document.getElementById('name').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('jacketName', document.getElementById('jacketName').value);
    formData.append('size', document.getElementById('size').value);
    formData.append('jacketColor', document.getElementById('jacketColor').value);
    formData.append('sleeveColor', document.getElementById('sleeveColor').value);
    formData.append('sleeveRubberColor', document.getElementById('sleeveRubberColor').value);
    for (let i = 1; i <= 9; i++) {
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
