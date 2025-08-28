// إظهار/إخفاء الحقول الشرطية
const orderTypeRadios = document.querySelectorAll('input[name="نوع الطلب"]');
const promoFields = document.getElementById('promoFields');
const teamMembersGroup = document.getElementById('teamMembersGroup');
const teamMembersInput = document.getElementById('teamMembers');
const teamMembersError = document.getElementById('teamMembersError');
const backExampleBox = document.getElementById('backExampleBox');

orderTypeRadios.forEach(radio => {
  radio.addEventListener('change', function() {
    // Show team members field for options 2, 3, 4
    if (this.value === 'فريق1-4' || this.value === 'فريق5-29' || this.value === 'عرض ترويجي') {
      teamMembersGroup.style.display = 'block';
      teamMembersInput.required = true;
      if (this.value === 'فريق1-4') {
        teamMembersInput.min = 1;
        teamMembersInput.max = 4;
        teamMembersInput.placeholder = '1 - 4';
      } else {
        teamMembersInput.min = 5;
        teamMembersInput.max = 29;
        teamMembersInput.placeholder = '5 - 29';
      }
    } else {
      teamMembersGroup.style.display = 'none';
      teamMembersInput.required = false;
      teamMembersInput.value = '';
      teamMembersError.textContent = '';
    }
    // Existing promoFields logic
    if (this.value === 'عرض ترويجي') {
      promoFields.style.display = 'block';
      backExampleBox.style.display = 'block';
    } else {
      promoFields.style.display = 'none';
      backExampleBox.style.display = 'none';
    }
  });
});

// Form validation function
function validateForm() {
  const errors = [];
  
  // Check required fields
  const requiredFields = [
    { id: 'name', label: 'الاسم' },
    { id: 'phoneNumber', label: 'رقم الجوال' },
    { id: 'countryCode', label: 'رمز الدولة' }
  ];
  
  requiredFields.forEach(field => {
    const element = document.getElementById(field.id);
    if (!element || !element.value.trim()) {
      errors.push(`يجب ملء حقل "${field.label}"`);
    }
  });
  
  // Check if order type is selected
  const orderTypeSelected = document.querySelector('input[name="نوع الطلب"]:checked');
  if (!orderTypeSelected) {
    errors.push('يجب اختيار نوع الطلب');
  }
  
  // Check team members if required
  if (teamMembersInput.required) {
    if (!teamMembersInput.value.trim()) {
      errors.push('يجب إدخال عدد أعضاء المجموعة');
    } else {
      const val = parseInt(teamMembersInput.value, 10);
      const min = parseInt(teamMembersInput.min, 10);
      const max = parseInt(teamMembersInput.max, 10);
      if (isNaN(val) || val < min || val > max) {
        errors.push(`يجب إدخال عدد أعضاء المجموعة بين ${min} و ${max}`);
      }
    }
  }
  
  // Check promo fields if visible
  if (promoFields.style.display === 'block') {
    const jacketColorChecked = document.querySelector('input[name="لون الجاكيت"]:checked');
    const sleeveColorChecked = document.querySelector('input[name="لون الأكمام"]:checked');
    const sleeveRubberColorSelected = document.getElementById('sleeveRubberColorSelect').value;
    const backDesignFile = document.getElementById('backDesign').files[0];
    
    if (!jacketColorChecked) {
      errors.push('يجب اختيار لون الجاكيت');
    }
    if (!sleeveColorChecked) {
      errors.push('يجب اختيار لون الأكمام');
    }
    if (!sleeveRubberColorSelected) {
      errors.push('يجب اختيار لون مطاط الأكمام');
    }
    if (!backDesignFile) {
      errors.push('يجب رفع صورة لتصميم الظهر');
    }
  }
  
  // Check phone number format
  const phoneInput = document.getElementById('phoneNumber');
  if (phoneInput && phoneInput.value.trim()) {
    const phonePattern = /^[1-9][0-9]{5,}$/;
    if (!phonePattern.test(phoneInput.value.trim())) {
      errors.push('يجب إدخال رقم جوال صحيح (6 أرقام على الأقل) بدون رمز الدولة - لا يجب أن يبدأ الرقم بصفر');
    }
  }
  
  return errors;
}

// التحقق من رقم الجوال لأي رمز دولة
const countryCodeInput = document.getElementById('countryCode');
const phoneNumberInput = document.getElementById('phoneNumber');
const phoneError = document.getElementById('phoneError');

function getFullPhoneNumber() {
  return countryCodeInput.value + phoneNumberInput.value;
}

phoneNumberInput.addEventListener('input', function() {
  const val = phoneNumberInput.value.trim();
  const regex = /^[1-9][0-9]{5,}$/;
  if (!regex.test(val)) {
    phoneError.textContent = 'يرجى إدخال رقم جوال صحيح (6 أرقام على الأقل) بدون رمز الدولة - لا يجب أن يبدأ الرقم بصفر';
    phoneNumberInput.classList.add('invalid');
  } else {
    phoneError.textContent = '';
    phoneNumberInput.classList.remove('invalid');
  }
});

// التحقق من عدد أعضاء المجموعة
teamMembersInput.addEventListener('input', function() {
  const val = parseInt(teamMembersInput.value, 10);
  const min = parseInt(teamMembersInput.min, 10);
  const max = parseInt(teamMembersInput.max, 10);
  if (teamMembersInput.required && (isNaN(val) || val < min || val > max)) {
    teamMembersError.textContent = `يرجى إدخال عدد بين ${min} و ${max}`;
    teamMembersInput.classList.add('invalid');
  } else {
    teamMembersError.textContent = '';
    teamMembersInput.classList.remove('invalid');
  }
});

const sleeveRubberColorSelect = document.getElementById('sleeveRubberColorSelect');
const sleeveRubberColorPreview = document.getElementById('sleeveRubberColorPreview');
const sleeveRubberColorImg = document.getElementById('sleeveRubberColorImg');
const sleeveRubberColorLabel = document.getElementById('sleeveRubberColorLabel');

if (sleeveRubberColorSelect) {
  sleeveRubberColorSelect.addEventListener('change', function() {
    const selectedOption = sleeveRubberColorSelect.options[sleeveRubberColorSelect.selectedIndex];
    if (sleeveRubberColorSelect.value) {
      // Use the data-image attribute for the preview image
      const imagePath = selectedOption.getAttribute('data-image');
      if (imagePath) {
        sleeveRubberColorImg.src = imagePath;
      }
      sleeveRubberColorLabel.textContent = selectedOption.text;
      sleeveRubberColorPreview.style.display = 'flex';
    } else {
      sleeveRubberColorPreview.style.display = 'none';
    }
  });
}

// إرسال النموذج
const form = document.getElementById('jacketOrderForm');
const successPage = document.getElementById('successPage');
form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Validate form before submission
  const validationErrors = validateForm();
  if (validationErrors.length > 0) {
    alert('يرجى تصحيح الأخطاء التالية:\n\n' + validationErrors.join('\n'));
    return;
  }
  const formData = new FormData(form);

  // Build order JSON
  const orderObj = {};
  form.querySelectorAll('input, select, textarea').forEach(el => {
    if ((el.type === 'radio' && el.checked) || (el.type !== 'radio' && el.type !== 'checkbox')) {
      if (el.name === 'رقم الجوال') return; // skip, we'll add full phone below
      // For sleeve rubber color, use the value directly (now it's Arabic text)
      orderObj[el.name] = el.value;
    }
  });
  orderObj['رقم الجوال'] = getFullPhoneNumber();
  formData.append('order_json', JSON.stringify(orderObj));

  fetch('https://n8n.srv886746.hstgr.cloud/webhook/fcd37d22-69da-4846-8718-ff4e4c6d7d57', {
    method: 'POST',
    body: formData
  })
  .then(res => {
    if (res.ok) {
      form.style.display = 'none';
      document.querySelector('header').style.display = 'none';
      successPage.style.display = 'block';
    } else {
      alert('حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
    }
  })
  .catch(() => {
    alert('حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
  });
}); 
