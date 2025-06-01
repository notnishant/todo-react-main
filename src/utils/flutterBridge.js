// Check if we're running inside Flutter's WebView
const isInFlutterWeb = () => {
  return (
    window.flutter_inappwebview !== undefined ||
    window.FlutterWebView !== undefined
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

    // Support both flutter_inappwebview and standard Flutter WebView
    if (window.flutter_inappwebview) {
      window.flutter_inappwebview.callHandler(channel, data);
    } else if (window.FlutterWebView) {
      window.FlutterWebView.postMessage(
        JSON.stringify({
          channel,
          data,
        })
      );
    }
  }

  // Register a handler for receiving messages from Flutter
  registerFlutterHandler(channel, callback) {
    if (!this.isFlutter) {
      console.log("Not in Flutter WebView, handler not registered:", channel);
      return;
    }

    if (window.flutter_inappwebview) {
      // For flutter_inappwebview
      window.flutter_inappwebview.addWebMessageListener(channel, callback);
    } else if (window.FlutterWebView) {
      // For standard Flutter WebView
      window.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.channel === channel) {
            callback(message.data);
          }
        } catch (e) {
          console.error("Error parsing message from Flutter:", e);
        }
      });
    }
  }

  // Show validation alert in Flutter
  showValidationAlert(message) {
    this.sendToFlutter("showAlert", {
      type: "validation",
      title: "Validation Error",
      message: message,
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
      // Send validation errors to Flutter
      this.showValidationAlert(
        Object.values(validationResult.errors).join("\n")
      );
      return;
    }

    this.sendToFlutter("submitForm", formData);
  }

  // Request initial data from Flutter
  requestInitialData() {
    this.sendToFlutter("requestInitialData", {});
  }

  // Update form field with validation
  updateField(fieldName, value, validationError) {
    this.sendToFlutter("updateField", {
      field: fieldName,
      value,
      isValid: !validationError,
      error: validationError,
    });

    if (validationError) {
      this.showValidationAlert(validationError);
    }
  }

  // Handle validation errors from Flutter
  handleValidationError(callback) {
    this.registerFlutterHandler("validationError", callback);
  }

  // Handle successful submission response from Flutter
  handleSubmissionSuccess(callback) {
    this.registerFlutterHandler("submissionSuccess", callback);
  }

  // Handle pre-filled data from Flutter
  handlePrefilledData(callback) {
    this.registerFlutterHandler("prefilledData", callback);
  }
}

// Create and export a singleton instance
const flutterBridge = new FlutterBridge();
export default flutterBridge;
