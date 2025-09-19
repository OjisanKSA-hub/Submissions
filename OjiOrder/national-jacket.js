// National Jacket Functionality Script
// Handles the special logic for "طلب الجاكيت الوطني" orders

// DOM Elements
const nationalOption = document.getElementById('nationalOption');
// nationalFields is already declared in script.js
const jacketColorCombo = document.getElementById('jacketColorCombo');
const nationalJacketSize = document.getElementById('nationalJacketSize');
const rightSleeveDesign = document.getElementById('rightSleeveDesign');
const leftSleeveDesign = document.getElementById('leftSleeveDesign');
const frontLetters = document.getElementById('frontLetters');
const backName = document.getElementById('backName');

// National jacket specific validation function
function validateNationalJacketFields() {
  const errors = [];
  
  // Check jacket color combo
  if (!jacketColorCombo.value) {
    errors.push('يجب اختيار لون الجاكيت والأكمام');
  }
  
  // Check jacket size
  if (!nationalJacketSize.value) {
    errors.push('يجب اختيار مقاس الجاكيت الوطني');
  }
  
  // Check right sleeve design
  if (!rightSleeveDesign.value) {
    errors.push('يجب اختيار تصميم الكم الأيمن');
  }
  
  // Check left sleeve design
  if (!leftSleeveDesign.value) {
    errors.push('يجب اختيار تصميم الكم الأيسر');
  }
  
  // Check front letters (exactly 2 English letters)
  if (!frontLetters.value.trim()) {
    errors.push('يجب إدخال حرفين باللغة الإنجليزية للامام');
  } else {
    const lettersPattern = /^[A-Za-z]{2}$/;
    if (!lettersPattern.test(frontLetters.value.trim())) {
      errors.push('يجب إدخال حرفين فقط باللغة الإنجليزية للامام (مثل TH أو CB)');
    }
  }
  
  // Check back name (English only)
  if (!backName.value.trim()) {
    errors.push('يجب إدخال الاسم باللغة الإنجليزية للظهر');
  } else {
    const englishPattern = /^[A-Za-z\s]+$/;
    if (!englishPattern.test(backName.value.trim())) {
      errors.push('يجب إدخال الاسم باللغة الإنجليزية فقط للظهر (أحرف إنجليزية ومسافات فقط)');
    }
  }
  
  return errors;
}

// Real-time validation for front letters input
if (frontLetters) {
  frontLetters.addEventListener('input', function() {
    const val = this.value.trim();
    const lettersPattern = /^[A-Za-z]{2}$/;
    
    if (val && !lettersPattern.test(val)) {
      this.classList.add('invalid');
    } else {
      this.classList.remove('invalid');
    }
  });
  
  // Convert to uppercase automatically
  frontLetters.addEventListener('input', function() {
    this.value = this.value.toUpperCase();
  });
}

// Real-time validation for back name input
if (backName) {
  // Prevent non-English characters from being typed
  backName.addEventListener('input', function() {
    const val = this.value;
    // Remove any non-English characters immediately
    const englishOnly = val.replace(/[^A-Za-z\s]/g, '');
    
    // If the value changed, update it
    if (val !== englishOnly) {
      this.value = englishOnly;
    }
    
    // Visual validation
    const englishPattern = /^[A-Za-z\s]*$/;
    if (englishOnly && !englishPattern.test(englishOnly)) {
      this.classList.add('invalid');
    } else {
      this.classList.remove('invalid');
    }
  });
  
  // Also prevent paste of non-English text
  backName.addEventListener('paste', function(e) {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const englishOnly = paste.replace(/[^A-Za-z\s]/g, '');
    this.value = englishOnly;
  });
  
  // Prevent typing non-English characters
  backName.addEventListener('keypress', function(e) {
    const char = String.fromCharCode(e.which);
    const englishPattern = /^[A-Za-z\s]$/;
    
    // Allow backspace, delete, tab, enter, arrow keys, etc.
    if (e.which === 8 || e.which === 9 || e.which === 13 || e.which === 46 || 
        (e.which >= 37 && e.which <= 40)) {
      return;
    }
    
    // Block non-English characters
    if (!englishPattern.test(char)) {
      e.preventDefault();
    }
  });
}

// Handle national jacket option selection
function handleNationalJacketSelection() {
  const orderTypeRadios = document.querySelectorAll('input[name="نوع الطلب"]');
  
  orderTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'طلب الجاكيت الوطني') {
        // Show national fields
        if (window.nationalFields) {
          window.nationalFields.style.display = 'block';
        }
        
        // Make national fields required
        jacketColorCombo.required = true;
        nationalJacketSize.required = true;
        rightSleeveDesign.required = true;
        leftSleeveDesign.required = true;
        frontLetters.required = true;
        backName.required = true;
        
        // Hide other conditional fields
        document.getElementById('promoFields').style.display = 'none';
        document.getElementById('teamMembersGroup').style.display = 'none';
        document.getElementById('backExampleBox').style.display = 'none';
        
        // Clear other field requirements
        clearOtherFieldRequirements();
        
      } else {
        // Hide national fields
        if (window.nationalFields) {
          window.nationalFields.style.display = 'none';
        }
        
        // Remove required attributes from national fields
        jacketColorCombo.required = false;
        nationalJacketSize.required = false;
        rightSleeveDesign.required = false;
        leftSleeveDesign.required = false;
        frontLetters.required = false;
        backName.required = false;
        
        // Clear national field values
        clearNationalFieldValues();
      }
    });
  });
}

// Clear national field values
function clearNationalFieldValues() {
  jacketColorCombo.value = '';
  nationalJacketSize.value = '';
  rightSleeveDesign.value = '';
  leftSleeveDesign.value = '';
  frontLetters.value = '';
  backName.value = '';
  frontLetters.classList.remove('invalid');
  backName.classList.remove('invalid');
}

// Clear other field requirements (promo and team fields)
function clearOtherFieldRequirements() {
  // Remove promo field requirements
  document.getElementById('backDesign').required = false;
  document.querySelectorAll('input[name="لون الجاكيت"]').forEach(radio => radio.required = false);
  document.querySelectorAll('input[name="لون الأكمام"]').forEach(radio => radio.required = false);
  document.getElementById('sleeveRubberColorSelect').required = false;
  
  // Clear promo field values
  document.getElementById('backDesign').value = '';
  document.querySelectorAll('input[name="لون الجاكيت"]').forEach(radio => radio.checked = false);
  document.querySelectorAll('input[name="لون الأكمام"]').forEach(radio => radio.checked = false);
  document.getElementById('sleeveRubberColorSelect').value = '';
  document.getElementById('sleeveRubberColorPreview').style.display = 'none';
  
  // Remove team member requirements
  const teamMembersInput = document.getElementById('teamMembers');
  if (teamMembersInput) {
    teamMembersInput.required = false;
    teamMembersInput.value = '';
  }
}

// Enhanced form validation that includes national jacket validation
function enhanceFormValidation() {
  // This function will be called by the main script when needed
  // No need for separate event listener here
}

// Submit national jacket order to specific webhook
function submitNationalJacketOrder(originalText, submitButton) {
  console.log('submitNationalJacketOrder function called');
  const form = document.getElementById('jacketOrderForm');
  const formData = new FormData(form);
  
  // Build order JSON for national jacket
  const orderObj = {
    'نوع الطلب': 'طلب الجاكيت الوطني',
    'الاسم': document.getElementById('name').value,
    'اسم العائلة': document.getElementById('lastName').value,
    'رمز الدولة': document.getElementById('countryCode').value,
    'رقم الجوال': document.getElementById('phoneNumber').value,
    'رقم الجوال الكامل': document.getElementById('countryCode').value + document.getElementById('phoneNumber').value,
    'الدولة': document.getElementById('country').value,
    'المدينة': document.getElementById('city').value,
    'الحي': document.getElementById('neighborhood').value,
    'الشارع': document.getElementById('street').value,
    'تفاصيل إضافية': document.getElementById('details').value,
    'لون الجاكيت والأكمام': jacketColorCombo.value,
    'مقاس الجاكيت الوطني': nationalJacketSize.value,
    'تصميم الكم الأيمن': rightSleeveDesign.value,
    'تصميم الكم الأيسر': leftSleeveDesign.value,
    'حروف الامام': frontLetters.value,
    'اسم الظهر': backName.value,
    'سعر الجاكيت': '95',
    'سعر التوصيل': '29',
    'المجموع': '124'
  };
  
  console.log('Order object:', orderObj);
  formData.append('order_json', JSON.stringify(orderObj));
  
  console.log('Submitting to webhook...');
  
  // Submit to national jacket webhook
  fetch('https://n8n.srv886746.hstgr.cloud/webhook/95e6beb5-872f-44d2-b382-895eb2d54120', {
    method: 'POST',
    body: formData
  })
  .then(res => {
    console.log('Response received:', res.status, res.statusText);
    if (res.ok) {
      // Show success page
      form.style.display = 'none';
      document.querySelector('header').style.display = 'none';
      document.getElementById('successPage').style.display = 'block';
      console.log('Success! Form submitted and success page shown.');
    } else {
      console.error('Submission failed with status:', res.status);
      alert('حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
      // Re-enable button on error
      if (submitButton && originalText) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';
      }
    }
  })
  .catch(error => {
    console.error('Submission error:', error);
    alert('حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
    // Re-enable button on error
    if (submitButton && originalText) {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      submitButton.style.opacity = '1';
      submitButton.style.cursor = 'pointer';
    }
  });
}

// Export functions immediately for use by main script
window.nationalJacketValidation = validateNationalJacketFields;
window.submitNationalJacketOrder = submitNationalJacketOrder;
window.clearNationalFieldValues = clearNationalFieldValues;

console.log('National jacket functions exported to window object');

// Initialize national jacket functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('National jacket script DOM loaded');
  
  // Check if national option is already selected
  const selectedOrderType = document.querySelector('input[name="نوع الطلب"]:checked');
  if (selectedOrderType && selectedOrderType.value === 'طلب الجاكيت الوطني') {
    if (window.nationalFields) {
      window.nationalFields.style.display = 'block';
    }
    jacketColorCombo.required = true;
    nationalJacketSize.required = true;
    rightSleeveDesign.required = true;
    leftSleeveDesign.required = true;
    frontLetters.required = true;
    backName.required = true;
  }
  
  // Initialize event listeners
  handleNationalJacketSelection();
  enhanceFormValidation();
  
  console.log('National jacket initialization complete');
});
