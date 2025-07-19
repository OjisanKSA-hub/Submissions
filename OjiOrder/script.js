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
      document.querySelectorAll('input[name="لون رباط الأكمام"]').forEach(i => i.required = true);
      document.getElementById('backDesign').required = true;
      if (backExampleBox) backExampleBox.style.display = 'flex';
    } else {
      promoFields.style.display = 'none';
      document.querySelectorAll('input[name="لون الجاكيت"]').forEach(i => i.required = false);
      document.querySelectorAll('input[name="لون الأكمام"]').forEach(i => i.required = false);
      document.querySelectorAll('input[name="لون رباط الأكمام"]').forEach(i => i.required = false);
      document.getElementById('backDesign').required = false;
      if (backExampleBox) backExampleBox.style.display = 'none';
    }
  });
});

// التحقق من رقم الجوال لأي رمز دولة
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');
phoneInput.addEventListener('input', function() {
  const val = phoneInput.value.trim();
  const regex = /^\+[0-9]{6,}$/;
  if (!regex.test(val)) {
    phoneError.textContent = 'يجب أن يبدأ الرقم بـ + ويحتوي على 6 أرقام على الأقل بعده';
    phoneInput.classList.add('invalid');
  } else {
    phoneError.textContent = '';
    phoneInput.classList.remove('invalid');
  }
});

// التحقق من عدد أعضاء الفريق
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

// إرسال النموذج
const form = document.getElementById('jacketOrderForm');
const successPage = document.getElementById('successPage');
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (phoneInput.classList.contains('invalid')) return;
  if (teamMembersInput.required && teamMembersInput.classList.contains('invalid')) return;
  const promoVisible = promoFields.style.display === 'block';
  if (promoVisible) {
    const jacketColorChecked = document.querySelector('input[name="لون الجاكيت"]:checked');
    const sleeveColorChecked = document.querySelector('input[name="لون الأكمام"]:checked');
    const sleeveRubberColorChecked = document.querySelector('input[name="لون رباط الأكمام"]:checked');
    if (!jacketColorChecked || !sleeveColorChecked || !sleeveRubberColorChecked) {
      alert('يرجى اختيار لون الجاكيت ولون الأكمام ولون رباط الأكمام');
      return;
    }
  }
  const formData = new FormData(form);

  // Build order JSON
  const orderObj = {};
  form.querySelectorAll('input, select, textarea').forEach(el => {
    if ((el.type === 'radio' && el.checked) || (el.type !== 'radio' && el.type !== 'checkbox')) {
      orderObj[el.name] = el.value;
    }
  });
  formData.append('order_json', JSON.stringify(orderObj));

  fetch('https://n8n.srv886746.hstgr.cloud/webhook-test/860b7952-4e3d-45d9-8d00-52b759909d72', {
    method: 'POST',
    body: formData
  })
  .then(res => {
    if (res.ok) {
      form.style.display = 'none';
      successPage.style.display = 'block';
    } else {
      alert('حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
    }
  })
  .catch(() => {
    alert('حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
  });
}); 
