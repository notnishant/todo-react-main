// Check if we're running inside Flutter's WebView
const isInFlutterWeb = () => {
  return window.flutterChannel !== undefined;
};

class FlutterBridge {
  constructor() {
    this.isFlutter = isInFlutterWeb();
    this.reviewCallbacks = [];
    this.navigationCallbacks = [];
    this.validationCallbacks = [];

    // Set up global message handler
    if (typeof window !== "undefined") {
      window.receiveFromFlutter = (message) => {
        try {
          const data =
            typeof message === "string" ? JSON.parse(message) : message;
          this.handleFlutterMessage(data);
        } catch (e) {
          console.error("Error processing Flutter message:", e);
        }
      };
    }
  }

  // Send data to Flutter
  sendToFlutter(type, data) {
    if (!this.isFlutter) {
      console.log("Not in Flutter WebView, message not sent:", {
        type,
        data,
      });
      return;
    }

    window.flutterChannel.postMessage(
      JSON.stringify({
        type,
        data,
      })
    );
  }

  // Show validation alert in Flutter
  showValidationAlert(message, field = null) {
    this.sendToFlutter("alert", {
      title: "Validation Error",
      message: message,
      isError: true,
      field: field,
    });
    // Notify validation callbacks
    this.validationCallbacks.forEach((callback) => callback());
  }

  // Show success alert in Flutter
  showSuccessAlert(message) {
    this.sendToFlutter("alert", {
      title: "Success",
      message: message,
      isError: false,
    });
  }

  // Submit form data to Flutter
  submitForm(formData, validationResult) {
    if (!validationResult.isValid) {
      // Show validation error first
      const firstErrorField = Object.keys(validationResult.errors)[0];
      const firstErrorMessage = validationResult.errors[firstErrorField];
      this.showValidationAlert(firstErrorMessage, firstErrorField);
      return false; // Return false to indicate validation failure
    }

    // If validation passes, submit the form data
    this.sendToFlutter("formSubmit", formData);
    this.showSuccessAlert("Form submitted successfully!");
    return true; // Return true to indicate successful submission
  }

  // Update form field with validation
  updateField(fieldName, value, validationError) {
    if (validationError) {
      this.showValidationAlert(validationError, fieldName);
    }
  }

  // Add a callback for navigation requests
  onNavigationRequest(callback) {
    this.navigationCallbacks.push(callback);
  }

  // Remove a navigation callback
  removeNavigationCallback(callback) {
    this.navigationCallbacks = this.navigationCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  // Add a callback for validation failures
  onValidationFailure(callback) {
    this.validationCallbacks.push(callback);
  }

  // Remove a validation callback
  removeValidationCallback(callback) {
    this.validationCallbacks = this.validationCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  // Handle messages from Flutter
  handleFlutterMessage(message) {
    try {
      console.log("Received message from Flutter:", message);
      const data = typeof message === "string" ? JSON.parse(message) : message;

      switch (data.type) {
        case "navigateToReview":
          console.log("Processing navigation request with data:", data.data);
          this.navigationCallbacks.forEach((callback) => callback(data.data));
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (e) {
      console.error("Error handling Flutter message:", e);
    }
  }
}

// Create and export a singleton instance
const flutterBridge = new FlutterBridge();

export default flutterBridge;
