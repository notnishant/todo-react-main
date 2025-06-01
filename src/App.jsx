import { useState, useEffect } from "react";
import flutterBridge from "./utils/flutterBridge";
import { validateField, validateForm } from "./utils/validation";

function App() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set up Flutter message handlers
    flutterBridge.handleValidationError((errorData) => {
      setErrors(errorData);
      setIsLoading(false);
    });

    flutterBridge.handleSubmissionSuccess((responseData) => {
      setSubmitted(true);
      setIsLoading(false);
      flutterBridge.showSuccessAlert("Form submitted successfully!");
      flutterBridge.sendToFlutter('formSubmitted', responseData);
    });

    flutterBridge.handlePrefilledData((data) => {
      setFormData(prevData => ({
        ...prevData,
        ...data
      }));
    });

    // Request any pre-filled data from Flutter
    flutterBridge.requestInitialData();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    
    // Validate all fields
    const validationResult = validateForm(formData);
    
    // Show validation errors but still allow submission
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      // Send validation errors to Flutter
      flutterBridge.showValidationAlert(Object.values(validationResult.errors).join('\n'));
    }

    // Send form data to Flutter with validation result
    flutterBridge.submitForm(formData, validationResult);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    
    // Validate the field as user types
    const validationError = validateField(name, value);
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [name]: validationError
    }));

    // Notify Flutter of field changes with validation
    flutterBridge.updateField(name, value, validationError);
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    
    // Validate on blur
    const validationError = validateField(name, value);
    if (validationError) {
      setErrors(prev => ({
        ...prev,
        [name]: validationError
      }));
    } else {
      // Clear error if field is valid
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }

  if (submitted) {
    return (
      <div className="success-screen">
        <h2>Thanks for submitting!</h2>
        <p>We've received your information.</p>
        <div className="details-card">
          <h3>Your Details</h3>
          <p>
            <strong>Name</strong>
            {formData.firstName} {formData.lastName}
          </p>
          <p>
            <strong>Email</strong>
            {formData.email}
          </p>
          <p>
            <strong>Phone</strong>
            {formData.phone}
          </p>
          {formData.message && (
            <p>
              <strong>Message</strong>
              {formData.message}
            </p>
          )}
        </div>
        <div className="submit-btn-container">
          <button 
            className="submit-btn" 
            onClick={() => {
              setSubmitted(false);
              flutterBridge.sendToFlutter('resetForm', {});
            }}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <h1>Profile Details</h1>
      </header>
      
      <p className="app-description">Please fill in your information below</p>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          <div className="form-field">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`input ${errors.firstName ? 'input-error' : ''}`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="error-message">{errors.firstName}</p>
            )}
          </div>
          
          <div className="form-field">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`input ${errors.lastName ? 'input-error' : ''}`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="error-message">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="john.doe@example.com"
          />
          {errors.email && (
            <p className="error-message">{errors.email}</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input ${errors.phone ? 'input-error' : ''}`}
            placeholder="(123) 456-7890"
          />
          {errors.phone && (
            <p className="error-message">{errors.phone}</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="message">Message (Optional)</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input textarea ${errors.message ? 'input-error' : ''}`}
            placeholder="Your message here..."
            rows="4"
          />
          {errors.message && (
            <p className="error-message">{errors.message}</p>
          )}
        </div>

        <div className="submit-btn-container">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </>
  );
}

export default App;
