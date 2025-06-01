// Check if we're running inside Flutter's WebView
const isInFlutterWeb = () => {
  return window.flutterChannel !== undefined;
};

class FlutterBridge {
  constructor() {
    this.isFlutter = isInFlutterWeb();
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
      return;
    }

    // If validation passes, submit the form data
    this.sendToFlutter("formSubmit", formData);
    this.showSuccessAlert("Form submitted successfully!");
  }

  // Update form field with validation
  updateField(fieldName, value, validationError) {
    if (validationError) {
      this.showValidationAlert(validationError, fieldName);
    }
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
