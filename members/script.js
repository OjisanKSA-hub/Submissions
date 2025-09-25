// Supabase configuration
const SUPABASE_URL = 'https://pxapeabojeqcwrcfaunx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4YXBlYWJvamVxY3dyY2ZhdW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkwNTUyNywiZXhwIjoyMDY1NDgxNTI3fQ.y4LrbiXtJw9pDTBgU0EJZLc0nw6yRx_sVQb0fcRNBe0';

// Phone Verification Modal Logic
const phoneVerificationModal = document.getElementById('phoneVerificationModal');
const invalidTeamModal = document.getElementById('invalidTeamModal');
const modalCountryCode = document.getElementById('modalCountryCode');
const modalPhoneNumber = document.getElementById('modalPhoneNumber');
const modalPhoneError = document.getElementById('modalPhoneError');
const checkPhoneBtn = document.getElementById('checkPhoneBtn');
const verificationMessage = document.getElementById('verificationMessage');
const jacketForm = document.getElementById('jacketForm');
const formPhoneCountry = document.getElementById('phoneCountry');
const formPhone = document.getElementById('phone');

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
    const teamCode = document.getElementById('teamCode').value;
    
    const response = await fetch('https://n8n.srv886746.hstgr.cloud/webhook/d70b99bc-ca6b-49ad-85f5-ff2fc3b605f0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        team_code: parseInt(teamCode),
        phone: fullPhone
      })
    });
    
    if (response.ok) {
      const responseText = await response.text();
      if (responseText.trim() === '') {
        // Empty response - invalid team code
        handleInvalidTeam();
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

// Handle invalid team code
function handleInvalidTeam() {
  phoneVerificationModal.style.display = 'none';
  invalidTeamModal.style.display = 'block';
  // Disable form interaction
  jacketForm.style.pointerEvents = 'none';
  jacketForm.style.opacity = '0.5';
}

// Handle verification response
function handleVerificationResponse(data, fullPhone) {
  verificationMessage.style.display = 'block';
  
  // Case 1: No data or invalid team code
  if (!data.TeamCode || data.TeamCode === null) {
    handleInvalidTeam();
    return;
  }
  
  // Case 2: Check submission count
  if (data.submission_count !== null && data.submission_count >= parseInt(data['Team Members'])) {
    verificationMessage.className = 'verification-message error';
    verificationMessage.textContent = 'عذراً، جميع أعضاء الفريق قد قاموا بتقديم النموذج بالفعل.';
    return;
  }
  
  // Case 3: Check status
  if (data.Status === 'accepted' || data.Status === 'pending') {
    verificationMessage.className = 'verification-message error';
    verificationMessage.textContent = 'عذراً، لقد قمت بتقديم النموذج مسبقاً.';
    return;
  }
  
  // Case 4: Status is null or allowed - proceed
  verificationMessage.className = 'verification-message success';
  verificationMessage.textContent = 'تم التحقق بنجاح! يمكنك الآن إكمال النموذج.';
  
  // Set phone in form and disable it
  formPhoneCountry.value = modalCountryCode.value;
  formPhone.value = modalPhoneNumber.value;
  formPhone.disabled = true;
  formPhoneCountry.disabled = true;
  
  // Hide modal and enable form
  setTimeout(() => {
    phoneVerificationModal.style.display = 'none';
    jacketForm.style.pointerEvents = 'auto';
    jacketForm.style.opacity = '1';
  }, 2000);
}

// Handle Enter key press in modal
modalPhoneNumber.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    checkPhoneBtn.click();
  }
});

// Populate team code from URL query string (e.g., ?team=1234)
document.addEventListener('DOMContentLoaded', function() {
  console.log('JS loaded');
  const urlParams = new URLSearchParams(window.location.search);
  const teamCode = urlParams.get('team') || '';
  
  // Check if team code exists
  if (!teamCode) {
    handleInvalidTeam();
    return;
  }
  
  document.getElementById('teamCode').value = teamCode;
  
  // Show phone verification modal
  phoneVerificationModal.style.display = 'block';
  // Disable form interaction
  jacketForm.style.pointerEvents = 'none';
  jacketForm.style.opacity = '0.5';
  
  // Focus on phone number input
  setTimeout(() => {
    modalPhoneNumber.focus();
  }, 100);

  // Show/hide upload fields based on checkbox
  for (let i = 1; i <= 11; i++) {
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
    const freeDesigns = [3, 7, 11];
    // Designs that are 20 SAR
    const twentySarDesigns = [6, 10];
    for (let i = 1; i <= 11; i++) {
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
  
  // Custom color functionality
  function setupCustomColorField(radioId, fieldId, inputId) {
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
  
  setupCustomColorField('jacketColorOther', 'jacketCustomColorField', 'jacketCustomColor');
  setupCustomColorField('sleeveColorOther', 'sleeveCustomColorField', 'sleeveCustomColor');

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

  // Form validation function
  function validateForm() {
    const errors = [];
    
    // Required fields that must be filled (3, 7, 11)
    const requiredFields = [3, 7, 11];
    
    // Check required fields first
    for (let i of requiredFields) {
      const enableBox = document.getElementById(`enable${i}`);
      const fileInput = document.getElementById(`image${i}`);
      
      if (!enableBox || !enableBox.checked) {
        const fieldNames = {3: 'كم أيمن', 7: 'كم أيسر', 11: 'خلف'};
        errors.push(`يجب تحديد وإضافة تصميم للحقل رقم ${i} (${fieldNames[i]}) - هذا الحقل مطلوب`);
      } else if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        const fieldNames = {3: 'كم أيمن', 7: 'كم أيسر', 11: 'خلف'};
        errors.push(`يجب رفع صورة للتصميم رقم ${i} (${fieldNames[i]}) - هذا الحقل مطلوب`);
      }
    }
    
    // Check if any other checked checkbox has no file uploaded
    for (let i = 1; i <= 11; i++) {
      if (requiredFields.includes(i)) continue; // Skip required fields, already checked above
      
      const enableBox = document.getElementById(`enable${i}`);
      const fileInput = document.getElementById(`image${i}`);
      
      if (enableBox && enableBox.checked) {
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
          errors.push(`يجب رفع صورة للتصميم رقم ${i} أو إلغاء تحديده`);
        }
      }
    }
    
    // Check paidAdd1 if checked
    const paidAdd1Checkbox = document.getElementById('paidAdd1');
    const paidAdd1Image = document.getElementById('paidAdd1Image');
    if (paidAdd1Checkbox && paidAdd1Checkbox.checked) {
      if (!paidAdd1Image || !paidAdd1Image.files || paidAdd1Image.files.length === 0) {
        errors.push('يجب رفع صورة لتطريز البطانة أو إلغاء تحديده');
      }
    }
    
    // Check custom color fields if "لون آخر" is selected
    const jacketColorOther = document.getElementById('jacketColorOther');
    const jacketCustomColor = document.getElementById('jacketCustomColor');
    if (jacketColorOther && jacketColorOther.checked) {
      if (!jacketCustomColor || !jacketCustomColor.value.trim()) {
        errors.push('يجب إدخال اسم لون الجاكيت المخصص');
      }
    }
    
    const sleeveColorOther = document.getElementById('sleeveColorOther');
    const sleeveCustomColor = document.getElementById('sleeveCustomColor');
    if (sleeveColorOther && sleeveColorOther.checked) {
      if (!sleeveCustomColor || !sleeveCustomColor.value.trim()) {
        errors.push('يجب إدخال اسم لون الأكمام المخصص');
      }
    }
    
    return errors;
  }

  // Supabase API functions
  async function checkUserExists(teamCode, phone, name) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/team_member_submission?select="Status"&"TeamCode"=eq.${encodeURIComponent(teamCode)}&"Phone"=like.${encodeURIComponent(phone)}&"Name"=eq.${encodeURIComponent(name)}&"Status"=in.(pending,accepted)`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 406) {
        // User doesn't exist, return null
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error checking user existence:', error);
      // If there's an error, assume user doesn't exist and continue
      return null;
    }
  }



  // Form submission: send as FormData to n8n webhook
  document.getElementById('jacketForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get submit button and prevent multiple submissions
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton.disabled) {
      return; // Already submitting
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
    
    const formData = new FormData();
    const getValue = id => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };
    const getRadioValue = name => {
      const radios = document.getElementsByName(name);
      for (let radio of radios) {
        if (radio.checked) {
          // If "لون آخر" is selected, return the custom color value instead
          if (radio.value === 'لون آخر') {
            if (name === 'jacketColor') {
              const customInput = document.getElementById('jacketCustomColor');
              return customInput ? customInput.value.trim() : radio.value;
            } else if (name === 'sleeveColor') {
              const customInput = document.getElementById('sleeveCustomColor');
              return customInput ? customInput.value.trim() : radio.value;
            }
          }
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
    for (let i = 1; i <= 11; i++) {
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
    
    // Check if user already exists in Supabase
    const teamCode = getValue('teamCode');
    const phoneCountry = getValue('phoneCountry');
    const phone = getValue('phone');
    const fullPhone = phoneCountry + phone; // Combine country code with phone number
    const name = getValue('name');
    
    try {
             const existingUser = await checkUserExists(teamCode, fullPhone, name);
      
      if (existingUser) {
        // User exists, check status
        if (existingUser["Status"] === 'rejected') {
          // User exists with rejected status, continue with form submission
        } else {
          // User exists and status is not rejected, show alert
          alert('عفوا لقد تم تقديم هذا الطلب بالفعل والطلب قيد المراجعة!');
          return;
        }
      }
      
      // User doesn't exist or has rejected status, proceed with form submission
      const res = await fetch('https://n8n.srv886746.hstgr.cloud/webhook/3634ec6c-6ed9-4c34-99f7-62b26495266d', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        window.location.href = 'success.html';
      } else {
        alert('حدث خطأ أثناء الإرسال.');
        // Re-enable button on error
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      alert('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.');
      // Re-enable button on error
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      submitButton.style.opacity = '1';
      submitButton.style.cursor = 'pointer';
    }
  });
}); 
