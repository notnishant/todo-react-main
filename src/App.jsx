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

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [currentView, setCurrentView] = useState('form'); // 'form' or 'review'

  useEffect(() => {
    // Check for stored review data on mount
    const storedReviewData = localStorage.getItem('reviewData');
    if (storedReviewData) {
      try {
        const parsedData = JSON.parse(storedReviewData);
        setReviewData(parsedData);
        setCurrentView('review');
      } catch (e) {
        console.error('Error parsing stored review data:', e);
      }
    }

    // Set up navigation handler
    const handleNavigation = (data) => {
      console.log('Received navigation data:', data);
      setReviewData(data);
      setCurrentView('review');
      setIsLoading(false);
      // Store the review data
      localStorage.setItem('reviewData', JSON.stringify(data));
    };

    // Set up validation failure handler
    const handleValidationFailure = () => {
      setIsLoading(false);
    };

    flutterBridge.onNavigationRequest(handleNavigation);
    flutterBridge.onValidationFailure(handleValidationFailure);

    // Cleanup
    return () => {
      flutterBridge.removeNavigationCallback(handleNavigation);
      flutterBridge.removeValidationCallback(handleValidationFailure);
    };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    
    const validationResult = validateForm(formData);
    setErrors(validationResult.errors || {});
    
    // Only keep loading state if validation passed
    const submitted = flutterBridge.submitForm(formData, validationResult);
    if (!submitted) {
      setIsLoading(false);
    }
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

  function handleNewSubmission() {
    setCurrentView('form');
    setReviewData(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: ""
    });
    setErrors({});
    setIsLoading(false);
    // Clear stored review data
    localStorage.removeItem('reviewData');
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

  // Review screen component
  if (currentView === 'review' && reviewData) {
    return (
      <div className="form-container">
        <header className="app-header">
          <h1>Submission Review</h1>
          <p className="app-description">Your submission has been reviewed</p>
        </header>

        <div className="review-status">
          <div className={`status-badge ${reviewData.status}`}>
            {reviewData.status.charAt(0).toUpperCase() + reviewData.status.slice(1)}
          </div>
          <div className="rating">
            Rating: {Math.round(reviewData.rating)} / 5
          </div>
        </div>

        {reviewData.adminComments && (
          <div className="admin-comments">
            <h2>Admin Comments</h2>
            <p>{reviewData.adminComments}</p>
          </div>
        )}

        <div className="review-details">
          <h2>Submission Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>Name</label>
              <p>{reviewData.firstName} {reviewData.lastName}</p>
            </div>
            <div className="detail-item">
              <label>Email</label>
              <p>{reviewData.email}</p>
            </div>
            <div className="detail-item">
              <label>Phone</label>
              <p>{reviewData.phone}</p>
            </div>
            {reviewData.message && (
              <div className="detail-item full-width">
                <label>Message</label>
                <p>{reviewData.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="timestamps">
          <p>Submitted: {new Date(reviewData.timestamp).toLocaleString()}</p>
          <p>Reviewed: {new Date(reviewData.reviewedAt).toLocaleString()}</p>
        </div>

        <div className="submit-btn-container">
          <button 
            type="button" 
            className="submit-btn"
            onClick={handleNewSubmission}
          >
            Submit Another Form
          </button>
        </div>
      </div>
    );
  }

  // Form screen component
  return (
    <div className="form-container">
      <header className="app-header">
        <h1>Profile Details</h1>
        <p className="app-description">Please fill in your information below</p>
      </header>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          {renderField("firstName", "First Name", "text", "Suresh")}
          {renderField("lastName", "Last Name", "text", "Kumar")}
        </div>

        {renderField("email", "Email Address", "email", "Suresh.kumar@example.com")}
        {renderField("phone", "Phone Number", "tel", "9876543210")}
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
