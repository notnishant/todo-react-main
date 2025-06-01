// Email validation using a comprehensive regex pattern
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

// Phone number validation (accepts formats like: (123) 456-7890, 123-456-7890, 1234567890)
const phoneRegex =
  /^[\s().-]*([0-9]{3})[\s().-]*([0-9]{3})[\s().-]*([0-9]{4})[\s().-]*$/;

// Name validation (letters, spaces, hyphens, apostrophes)
const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;

export const validateField = (name, value) => {
  // For optional fields, return null if empty
  if (name.toLowerCase() === "message" && (!value || value.trim() === "")) {
    return null;
  }

  // For required fields, check if empty
  if ((!value || value.trim() === "") && name.toLowerCase() !== "message") {
    return `${name} is required`;
  }

  switch (name.toLowerCase()) {
    case "email":
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
      break;

    case "phone":
      if (value && !phoneRegex.test(value)) {
        return "Please enter a valid phone number";
      }
      break;

    case "firstname":
    case "lastname":
      if (!nameRegex.test(value)) {
        return "Please enter a valid name (2-50 characters, letters only)";
      }
      break;

    case "message":
      if (value && value.length > 500) {
        return "Message must be less than 500 characters";
      }
      break;
  }

  return null;
};

export const validateForm = (formData) => {
  const errors = {};
  let hasErrors = false;

  // Validate required fields
  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required";
    hasErrors = true;
  } else if (!nameRegex.test(formData.firstName)) {
    errors.firstName = "Please enter a valid first name";
    hasErrors = true;
  }

  if (!formData.lastName.trim()) {
    errors.lastName = "Last name is required";
    hasErrors = true;
  } else if (!nameRegex.test(formData.lastName)) {
    errors.lastName = "Please enter a valid last name";
    hasErrors = true;
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required";
    hasErrors = true;
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Please enter a valid email address";
    hasErrors = true;
  }

  if (formData.phone.trim() && !phoneRegex.test(formData.phone)) {
    errors.phone = "Please enter a valid phone number";
    hasErrors = true;
  }

  // Only validate message length if it's provided
  if (formData.message && formData.message.length > 500) {
    errors.message = "Message must be less than 500 characters";
    hasErrors = true;
  }

  return {
    isValid: !hasErrors,
    errors,
  };
};
