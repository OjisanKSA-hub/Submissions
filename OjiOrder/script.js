// Phone Verification Modal Logic
const phoneVerificationModal = document.getElementById('phoneVerificationModal');
const modalCountryCode = document.getElementById('modalCountryCode');
const modalPhoneNumber = document.getElementById('modalPhoneNumber');
const modalPhoneError = document.getElementById('modalPhoneError');
const checkPhoneBtn = document.getElementById('checkPhoneBtn');
const verificationMessage = document.getElementById('verificationMessage');
const jacketOrderForm = document.getElementById('jacketOrderForm');
const formCountryCode = document.getElementById('countryCode');
const formPhoneNumber = document.getElementById('phoneNumber');

// Show modal on page load
document.addEventListener('DOMContentLoaded', function() {
  phoneVerificationModal.style.display = 'block';
  // Disable form interaction
  jacketOrderForm.style.pointerEvents = 'none';
  jacketOrderForm.style.opacity = '0.5';
  
  // Focus on phone number input
  setTimeout(() => {
    modalPhoneNumber.focus();
  }, 100);
});

// Phone validation function
function validatePhone(phone) {
  const phonePattern = /^[1-9][0-9]{8}$/;
  return phonePattern.test(phone);
}

// Check phone button click handler
checkPhoneBtn.addEventListener('click', async function() {
  const countryCode = modalCountryCode.value;
  const phoneNumber = modalPhoneNumber.value.trim();
  
  // Clear previous errors
  modalPhoneError.textContent = '';
  verificationMessage.style.display = 'none';
  
  // Validate phone number
  if (!phoneNumber) {
    modalPhoneError.textContent = 'يرجى إدخال رقم الجوال';
    return;
  }
  
  if (!validatePhone(phoneNumber)) {
    modalPhoneError.textContent = 'رقم الجوال غير صحيح. يجب أن يبدأ برقم من 1-9 ويحتوي على 9 أرقام';
    return;
  }
  
  // Disable button and show loading
  checkPhoneBtn.disabled = true;
  checkPhoneBtn.textContent = 'جاري التحقق...';
  
  try {
    const fullPhone = countryCode + phoneNumber;
    const response = await fetch('https://n8n.srv886746.hstgr.cloud/webhook/e99a9c1c-ebf0-462a-ac0c-970f64752cf0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: fullPhone
      })
    });
    
    if (response.ok) {
      const responseText = await response.text();
      if (responseText.trim() === '') {
        // Empty response - allow user to proceed
        handleEmptyResponse(fullPhone);
      } else {
        const data = JSON.parse(responseText);
        handleVerificationResponse(data, fullPhone);
      }
    } else {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    console.error('Error:', error);
    verificationMessage.style.display = 'block';
    verificationMessage.className = 'verification-message error';
    verificationMessage.textContent = 'حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.';
  } finally {
    // Re-enable button
    checkPhoneBtn.disabled = false;
    checkPhoneBtn.textContent = 'التحقق';
  }
});

// Handle Enter key press in modal
modalPhoneNumber.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    checkPhoneBtn.click();
  }
});

// Handle empty response (new user, no previous orders)
function handleEmptyResponse(fullPhone) {
  verificationMessage.style.display = 'block';
  verificationMessage.className = 'verification-message success';
  verificationMessage.textContent = 'مرحباً! يمكنك الآن إكمال طلبك الجديد.';
  
  // Set phone in form and disable it
  formCountryCode.value = modalCountryCode.value;
  formPhoneNumber.value = modalPhoneNumber.value;
  formPhoneNumber.disabled = true;
  formCountryCode.disabled = true;
  
  // Hide modal and enable form
  setTimeout(() => {
    phoneVerificationModal.style.display = 'none';
    jacketOrderForm.style.pointerEvents = 'auto';
    jacketOrderForm.style.opacity = '1';
  }, 2000);
}

// Handle verification response
function handleVerificationResponse(data, fullPhone) {
  verificationMessage.style.display = 'block';
  
  switch (data.Status) {
    case 'accepted':
      verificationMessage.className = 'verification-message success';
      verificationMessage.textContent = 'تم التحقق بنجاح! يمكنك الآن إكمال الطلب.';
      
      // Set phone in form and disable it
      formCountryCode.value = modalCountryCode.value;
      formPhoneNumber.value = modalPhoneNumber.value;
      formPhoneNumber.disabled = true;
      formCountryCode.disabled = true;
      
      // Hide modal and enable form
      setTimeout(() => {
        phoneVerificationModal.style.display = 'none';
        jacketOrderForm.style.pointerEvents = 'auto';
        jacketOrderForm.style.opacity = '1';
      }, 2000);
      break;
      
    case 'pending':
      verificationMessage.className = 'verification-message warning';
      verificationMessage.textContent = 'عذراً، لا يمكنك إضافة طلب آخر لأن طلبك تحت المراجعة. يرجى الانتظار أو التواصل مع خدمة العملاء.';
      break;
      
    case 'rejected':
      verificationMessage.className = 'verification-message error';
      verificationMessage.textContent = 'عذراً، لا يمكنك إضافة طلب آخر لأن طلبك تم رفضه. يرجى الانتظار أو التواصل مع خدمة العملاء.';
      break;
      
    default:
      verificationMessage.className = 'verification-message error';
      verificationMessage.textContent = 'حالة غير معروفة. يرجى التواصل مع خدمة العملاء.';
  }
}

// إظهار/إخفاء الحقول الشرطية
const orderTypeRadios = document.querySelectorAll('input[name="نوع الطلب"]');
const promoFields = document.getElementById('promoFields');
const nationalFields = document.getElementById('nationalFields');
const teamMembersGroup = document.getElementById('teamMembersGroup');
const teamMembersInput = document.getElementById('teamMembers');
const teamMembersError = document.getElementById('teamMembersError');
const backExampleBox = document.getElementById('backExampleBox');

// Make nationalFields available globally for national-jacket.js
window.nationalFields = nationalFields;

// Function to handle order type changes
function handleOrderTypeChange(selectedValue) {
  // Show team members field for options 2, 3, 4
  if (selectedValue === 'فريق1-4' || selectedValue === 'فريق5-29' || selectedValue === 'عرض ترويجي') {
    teamMembersGroup.style.display = 'block';
    teamMembersInput.required = true;
    if (selectedValue === 'فريق1-4') {
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
  
  // Handle promo fields visibility and required attributes
  if (selectedValue === 'عرض ترويجي') {
    promoFields.style.display = 'block';
    backExampleBox.style.display = 'block';
    
    // Make promo fields required
    document.getElementById('backDesign').required = true;
    document.querySelector('input[name="لون الجاكيت"]').required = true;
    document.querySelector('input[name="لون الأكمام"]').required = true;
    document.getElementById('sleeveRubberColorSelect').required = true;
  } else {
    promoFields.style.display = 'none';
    backExampleBox.style.display = 'none';
    
    // Remove required attribute from promo fields and clear their values
    document.getElementById('backDesign').required = false;
    document.querySelector('input[name="لون الجاكيت"]').required = false;
    document.querySelector('input[name="لون الأكمام"]').required = false;
    document.getElementById('sleeveRubberColorSelect').required = false;
    
    // Clear promo field values
    document.getElementById('backDesign').value = '';
    document.querySelectorAll('input[name="لون الجاكيت"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="لون الأكمام"]').forEach(radio => radio.checked = false);
    document.getElementById('sleeveRubberColorSelect').value = '';
    document.getElementById('sleeveRubberColorPreview').style.display = 'none';
  }
  
  // Handle national jacket fields
  if (selectedValue === 'طلب الجاكيت الوطني') {
    nationalFields.style.display = 'block';
  } else {
    nationalFields.style.display = 'none';
  }
}

orderTypeRadios.forEach(radio => {
  radio.addEventListener('change', function() {
    handleOrderTypeChange(this.value);
  });
});

// Initialize form state on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check if any order type is already selected (in case of form state restoration)
  const selectedOrderType = document.querySelector('input[name="نوع الطلب"]:checked');
  if (selectedOrderType) {
    handleOrderTypeChange(selectedOrderType.value);
  } else {
    // Ensure promo fields are hidden and not required by default
    handleOrderTypeChange('');
  }
  
  // Setup custom color fields for promo section
  function setupPromoCustomColorField(radioId, fieldId, inputId) {
    const radio = document.getElementById(radioId);
    const field = document.getElementById(fieldId);
    const input = document.getElementById(inputId);
    
    if (radio && field && input) {
      // Show/hide custom color field when "لون آخر" is selected
      radio.addEventListener('change', function() {
        if (this.checked) {
          field.style.display = 'block';
          input.required = true;
          input.focus();
        }
      });
      
      // Hide field when other colors are selected
      const allRadios = document.getElementsByName(radio.name);
      allRadios.forEach(r => {
        if (r !== radio) {
          r.addEventListener('change', function() {
            if (this.checked) {
              field.style.display = 'none';
              input.required = false;
              input.value = '';
            }
          });
        }
      });
    }
  }
  
  setupPromoCustomColorField('promoJacketColorOther', 'promoJacketCustomColorField', 'promoJacketCustomColor');
  setupPromoCustomColorField('promoSleeveColorOther', 'promoSleeveCustomColorField', 'promoSleeveCustomColor');
  
  // Wait a bit for national jacket script to load
  setTimeout(function() {
    console.log('Checking national jacket functions availability...');
    console.log('nationalJacketValidation available:', typeof window.nationalJacketValidation === 'function');
    console.log('submitNationalJacketOrder available:', typeof window.submitNationalJacketOrder === 'function');
  }, 100);
});

// Form validation function
function validateForm() {
  const errors = [];
  
  // Check required fields
  const requiredFields = [
    { id: 'name', label: 'الاسم' },
    { id: 'lastName', label: 'اسم العائلة' },
    { id: 'phoneNumber', label: 'رقم الجوال' },
    { id: 'countryCode', label: 'رمز الدولة' }
  ];
  
  requiredFields.forEach(field => {
    const element = document.getElementById(field.id);
    if (!element || !element.value.trim()) {
      errors.push(`يجب ملء حقل "${field.label}"`);
    }
  });
  
  // Check name and lastname character limits
  const nameInput = document.getElementById('name');
  const lastNameInput = document.getElementById('lastName');
  
  if (nameInput && nameInput.value.trim().length > 12) {
    errors.push('الاسم يجب أن يكون 12 حرف أو أقل');
  }
  
  if (lastNameInput && lastNameInput.value.trim().length > 12) {
    errors.push('اسم العائلة يجب أن يكون 12 حرف أو أقل');
  }
  
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
    } else if (jacketColorChecked.value === 'لون آخر') {
      const customInput = document.getElementById('promoJacketCustomColor');
      if (!customInput || !customInput.value.trim()) {
        errors.push('يجب إدخال اسم لون الجاكيت المخصص');
      }
    }
    
    if (!sleeveColorChecked) {
      errors.push('يجب اختيار لون الأكمام');
    } else if (sleeveColorChecked.value === 'لون آخر') {
      const customInput = document.getElementById('promoSleeveCustomColor');
      if (!customInput || !customInput.value.trim()) {
        errors.push('يجب إدخال اسم لون الأكمام المخصص');
      }
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
    const phonePattern = /^[1-9][0-9]{8}$/;
    if (!phonePattern.test(phoneInput.value.trim())) {
      errors.push('رقم الجوال غير صحيح - يجب أن يكون 9 أرقام بالضبط');
    }
  }
  
  return errors;
}

// التحقق من رقم الجوال لأي رمز دولة
const countryCodeInput = document.getElementById('countryCode');
const phoneNumberInput = document.getElementById('phoneNumber');
const phoneError = document.getElementById('phoneError');

function getFullPhoneNumber() {
  return formCountryCode.value + formPhoneNumber.value;
}

phoneNumberInput.addEventListener('input', function() {
  const val = phoneNumberInput.value.trim();
  const regex = /^[1-9][0-9]{8}$/;
  if (val && !regex.test(val)) {
    phoneError.textContent = 'رقم الجوال غير صحيح - يجب أن يكون 9 أرقام بالضبط';
    phoneNumberInput.classList.add('invalid');
  } else {
    phoneError.textContent = '';
    phoneNumberInput.classList.remove('invalid');
  }
});

// Real-time validation for name fields
const nameInput = document.getElementById('name');
const lastNameInput = document.getElementById('lastName');

if (nameInput) {
  nameInput.addEventListener('input', function() {
    const val = this.value.trim();
    if (val.length > 12) {
      this.classList.add('invalid');
    } else {
      this.classList.remove('invalid');
    }
  });
}

if (lastNameInput) {
  lastNameInput.addEventListener('input', function() {
    const val = this.value.trim();
    if (val.length > 12) {
      this.classList.add('invalid');
    } else {
      this.classList.remove('invalid');
    }
  });
}

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
  
  // Get submit button and prevent multiple submissions
  const submitButton = document.getElementById('submitBtn');
  if (submitButton.disabled) {
    return; // Already submitting
  }
  
  // Check if national jacket is selected - handle it here
  const orderTypeSelected = document.querySelector('input[name="نوع الطلب"]:checked');
  if (orderTypeSelected && orderTypeSelected.value === 'طلب الجاكيت الوطني') {
    console.log('National jacket selected, validating...');
    
    // Check if national jacket functions are available
    if (typeof window.nationalJacketValidation !== 'function' || typeof window.submitNationalJacketOrder !== 'function') {
      console.error('National jacket functions not loaded yet');
      alert('يرجى الانتظار لحظة ثم المحاولة مرة أخرى.');
      return;
    }
    
    // Validate national jacket fields
    const nationalErrors = window.nationalJacketValidation();
    console.log('National jacket validation errors:', nationalErrors);
    if (nationalErrors.length > 0) {
      alert('يرجى تصحيح الأخطاء التالية:\n\n' + nationalErrors.join('\n'));
      return;
    }
    
    // Disable button and show loading state for national jacket
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'جاري الإرسال...';
    submitButton.style.opacity = '0.6';
    submitButton.style.cursor = 'not-allowed';
    
    // Submit national jacket order
    console.log('Submitting national jacket order...');
    window.submitNationalJacketOrder(originalText, submitButton);
    return;
  }
  
  // Validate form before submission
  const validationErrors = validateForm();
  if (validationErrors.length > 0) {
    alert('يرجى تصحيح الأخطاء التالية:\n\n' + validationErrors.join('\n'));
    return;
  }
  
  // Disable button and show loading state
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'جاري الإرسال...';
  submitButton.style.opacity = '0.6';
  submitButton.style.cursor = 'not-allowed';
  const formData = new FormData(form);
  
  // Manually add phone fields to FormData (in case they're disabled)
  formData.append('رمز الدولة', formCountryCode.value);
  formData.append('رقم الجوال', formPhoneNumber.value);

  // Build order JSON
  const orderObj = {};
  form.querySelectorAll('input, select, textarea').forEach(el => {
    if ((el.type === 'radio' && el.checked) || (el.type !== 'radio' && el.type !== 'checkbox')) {
      if (el.name === 'رقم الجوال') return; // skip, we'll add full phone below
      
      // Handle custom colors - replace "لون آخر" with actual custom color
      if (el.type === 'radio' && el.checked && el.value === 'لون آخر') {
        if (el.name === 'لون الجاكيت') {
          const customInput = document.getElementById('promoJacketCustomColor');
          orderObj[el.name] = customInput ? customInput.value.trim() : el.value;
        } else if (el.name === 'لون الأكمام') {
          const customInput = document.getElementById('promoSleeveCustomColor');
          orderObj[el.name] = customInput ? customInput.value.trim() : el.value;
        } else {
          orderObj[el.name] = el.value;
        }
      } else {
        // For sleeve rubber color, use the value directly (now it's Arabic text)
        orderObj[el.name] = el.value;
      }
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
      // Re-enable button on error
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      submitButton.style.opacity = '1';
      submitButton.style.cursor = 'pointer';
    }
  })
  .catch(() => {
    alert('حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
    // Re-enable button on error
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    submitButton.style.opacity = '1';
    submitButton.style.cursor = 'pointer';
  });
}); 
