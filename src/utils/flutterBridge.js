// Check if we're running inside Flutter's WebView
const isInFlutterWeb = () => {
  return (
    window.showAlert !== undefined ||
    window.updateField !== undefined ||
    window.submitForm !== undefined
  );
};

class FlutterBridge {
  constructor() {
    this.isFlutter = isInFlutterWeb();
  }

  // Send data to Flutter
  sendToFlutter(channel, data) {
    if (!this.isFlutter) {
      console.log("Not in Flutter WebView, message not sent:", {
        channel,
        data,
      });
      return;
    }

    // Convert data to string if it's an object
    const messageString =
      typeof data === "object" ? JSON.stringify(data) : data;

    // Use the specific channel if it exists
    if (window[channel]) {
      window[channel].postMessage(messageString);
    } else {
      console.warn(`Channel ${channel} not found in Flutter WebView`);
    }
  }

  // Show validation alert in Flutter
  showValidationAlert(message, field = null) {
    this.sendToFlutter("showAlert", {
      type: "validation",
      title: "Validation Error",
      message: message,
      field: field,
    });
  }

  // Show success alert in Flutter
  showSuccessAlert(message) {
    this.sendToFlutter("showAlert", {
      type: "success",
      title: "Success",
      message: message,
    });
  }

  // Submit form data to Flutter with validation
  submitForm(formData, validationResult) {
    if (!validationResult.isValid) {
      // Find the first error and its field
      const firstErrorField = Object.keys(validationResult.errors)[0];
      const firstErrorMessage = validationResult.errors[firstErrorField];

      // Send the first validation error to Flutter with field information
      this.showValidationAlert(firstErrorMessage, firstErrorField);

      // Send all validation errors for Flutter's reference
      this.sendToFlutter("validationErrors", {
        errors: validationResult.errors,
        firstErrorField: firstErrorField,
      });

      return;
    }

    // If validation passes, submit the form data
    this.sendToFlutter("submitForm", {
      data: formData,
      timestamp: new Date().toISOString(),
    });
  }

  // Update form field with validation
  updateField(fieldName, value, validationError) {
    this.sendToFlutter("updateField", {
      field: fieldName,
      value: value,
      isValid: !validationError,
      error: validationError,
    });
  }

  // Handle messages from Flutter
  handleFlutterMessage(event) {
    try {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "prefilledData":
          if (this.prefilledDataCallback) {
            this.prefilledDataCallback(message.data);
          }
          break;
        case "validationError":
          if (this.validationErrorCallback) {
            this.validationErrorCallback(message.data);
          }
          break;
        case "submissionSuccess":
          if (this.submissionSuccessCallback) {
            this.submissionSuccessCallback(message.data);
          }
          break;
      }
    } catch (e) {
      console.error("Error handling Flutter message:", e);
    }
  }

  // Handle validation errors from Flutter
  handleValidationError(callback) {
    this.validationErrorCallback = callback;
  }

  // Handle successful submission response from Flutter
  handleSubmissionSuccess(callback) {
    this.submissionSuccessCallback = callback;
  }

  // Handle pre-filled data from Flutter
  handlePrefilledData(callback) {
    this.prefilledDataCallback = callback;
  }

  // Request initial data from Flutter
  requestInitialData() {
    this.sendToFlutter("requestInitialData", {});
  }
}

// Create and export a singleton instance
const flutterBridge = new FlutterBridge();

// Set up global message handler
if (typeof window !== "undefined") {
  window.receiveFromFlutter = (data) => {
    flutterBridge.handleFlutterMessage({ data: JSON.stringify(data) });
  };
}

export default flutterBridge;
