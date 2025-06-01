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
    
    const validationResult = validateForm(formData);
    setErrors(validationResult.errors || {});
    
    flutterBridge.submitForm(formData, validationResult);
    setIsLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const validationError = validateField(name, value);
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    setErrors(prev => ({
      ...prev,
      [name]: validationError
    }));
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    const validationError = validateField(name, value);
    
    setErrors(prev => ({
      ...prev,
      [name]: validationError
    }));

    if (validationError) {
      flutterBridge.updateField(name, value, validationError);
    }
  }

  const renderField = (name, label, type = "text", placeholder = "") => (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`input ${errors[name] ? 'input-error' : ''}`}
          placeholder={placeholder}
          disabled={isLoading}
          rows={4}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          required={type !== "tel"}
          className={`input ${errors[name] ? 'input-error' : ''}`}
          placeholder={placeholder}
          disabled={isLoading}
        />
      )}
      {errors[name] && (
        <p className="error-message">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="form-container">
      <header className="app-header">
        <h1>Profile Details</h1>
        <p className="app-description">Please fill in your information below</p>
      </header>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          {renderField("firstName", "First Name", "text", "John")}
          {renderField("lastName", "Last Name", "text", "Doe")}
        </div>

        {renderField("email", "Email Address", "email", "john.doe@example.com")}
        {renderField("phone", "Phone Number", "tel", "(123) 456-7890")}
        {renderField("message", "Message (Optional)", "textarea", "Your message here...")}

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
