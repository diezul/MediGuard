export const sendVerificationCode = async (email: string, code: string) => {
  // Implement sending email logic here
  // For example, using Firebase Cloud Functions, SendGrid, or another email service
  // Example using a mock service:
  try {
    // Mock sending email
    console.log(`Sending verification code ${code} to ${email}`);
    // Here you'd integrate with your email sending service
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw new Error('Failed to send verification email.');
  }
};
