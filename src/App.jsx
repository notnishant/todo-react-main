import { useState } from "react";
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

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    
    // Validate all fields
    const validationResult = validateForm(formData);
    
    // Update local error state
    setErrors(validationResult.errors || {});
    
    // Submit to Flutter (validation is handled in the bridge)
    flutterBridge.submitForm(formData, validationResult);
    setIsLoading(false);
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
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    
    // Validate on blur
    const validationError = validateField(name, value);
    
    // Update errors state
    setErrors(prev => ({
      ...prev,
      [name]: validationError
    }));

    // Show validation error in Flutter if any
    if (validationError) {
      flutterBridge.updateField(name, value, validationError);
    }
  }

  return (
    <div className="form-container">
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
              disabled={isLoading}
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
              disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
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
            className={`input ${errors.message ? 'input-error' : ''}`}
            placeholder="Your message here..."
            disabled={isLoading}
            rows={4}
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
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
