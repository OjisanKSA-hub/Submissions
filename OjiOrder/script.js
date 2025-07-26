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
      document.querySelectorAll('input[name="لون الجاكيت"]').forEach(i => i.required = true);
      document.querySelectorAll('input[name="لون الأكمام"]').forEach(i => i.required = true);
      document.querySelectorAll('select[name="لون مطاط الأكمام"]').forEach(i => i.required = true);
      document.getElementById('backDesign').required = true;
      if (backExampleBox) backExampleBox.style.display = 'flex';
    } else {
      promoFields.style.display = 'none';
      document.querySelectorAll('input[name="لون الجاكيت"]').forEach(i => i.required = false);
      document.querySelectorAll('input[name="لون الأكمام"]').forEach(i => i.required = false);
      document.querySelectorAll('select[name="لون مطاط الأكمام"]').forEach(i => i.required = false);
      document.getElementById('backDesign').required = false;
      if (backExampleBox) backExampleBox.style.display = 'none';
    }
  });
});

// التحقق من رقم الجوال لأي رمز دولة
const countryCodeInput = document.getElementById('countryCode');
const phoneNumberInput = document.getElementById('phoneNumber');
const phoneError = document.getElementById('phoneError');

function getFullPhoneNumber() {
  return countryCodeInput.value + phoneNumberInput.value;
}

phoneNumberInput.addEventListener('input', function() {
  const val = phoneNumberInput.value.trim();
  const regex = /^[0-9]{6,}$/;
  if (!regex.test(val)) {
    phoneError.textContent = 'يرجى إدخال رقم جوال صحيح (6 أرقام على الأقل) بدون رمز الدولة';
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
      sleeveRubberColorImg.src = sleeveRubberColorSelect.value;
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
  if (phoneNumberInput.classList.contains('invalid')) return;
  if (teamMembersInput.required && teamMembersInput.classList.contains('invalid')) return;
  const promoVisible = promoFields.style.display === 'block';
  if (promoVisible) {
    const jacketColorChecked = document.querySelector('input[name="لون الجاكيت"]:checked');
    const sleeveColorChecked = document.querySelector('input[name="لون الأكمام"]:checked');
    // For the dropdown, check if a value is selected
    if (!jacketColorChecked || !sleeveColorChecked || !sleeveRubberColorSelect.value) {
      alert('يرجى اختيار لون الجاكيت ولون الأكمام ولون مطاط الأكمام');
      return;
    }
  }
  const formData = new FormData(form);

  // Build order JSON
  const orderObj = {};
  form.querySelectorAll('input, select, textarea').forEach(el => {
    if ((el.type === 'radio' && el.checked) || (el.type !== 'radio' && el.type !== 'checkbox')) {
      if (el.name === 'رقم الجوال') return; // skip, we'll add full phone below
      if (el.name === 'لون مطاط الأكمام') {
        // Use the label, not the filename
        const selectedOption = el.options[el.selectedIndex];
        orderObj[el.name] = selectedOption ? selectedOption.text : el.value;
      } else {
        orderObj[el.name] = el.value;
      }
    }
  });
  orderObj['رقم الجوال'] = getFullPhoneNumber();
  formData.append('order_json', JSON.stringify(orderObj));

  fetch('https://n8n.srv886746.hstgr.cloud/webhook-test/860b7952-4e3d-45d9-8d00-52b759909d72', {
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
