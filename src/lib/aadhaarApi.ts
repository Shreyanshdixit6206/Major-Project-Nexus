// Dummy mock database for Aadhaar authentication

interface AadhaarUser {
  aadhaarNumber: string;
  phone: string;
  name: string;
  abhaId?: string;
}

const mockDatabase: Record<string, AadhaarUser> = {
  "123456789012": {
    aadhaarNumber: "123456789012",
    phone: "9876543210",
    name: "Ramesh Kumar",
    abhaId: "91-1234-5678-9012"
  },
  "987654321098": {
    aadhaarNumber: "987654321098",
    phone: "8765432109",
    name: "Priya Sharma",
    abhaId: "91-9876-5432-1098"
  },
  "111122223333": {
     aadhaarNumber: "111122223333",
     phone: "7777888899",
     name: "Amit Patel"
  }
};

// In-memory OTP store for testing
export const otpStore: Record<string, string> = {};

export async function generateAadhaarOTP(aadhaar: string): Promise<{ success: boolean; message: string; phonePreview?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const user = mockDatabase[aadhaar];
  if (!user) {
    return { success: false, message: "Aadhaar number not found in database." };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[aadhaar] = otp;

  // In a real scenario, we'd send an SMS here.
  // For dummy purposes, we just return success and log it to server console (or we can return it strictly for tests)
  console.log(`[DUMMY API] OTP for ${aadhaar} is ${otp}`);

  const phonePreview = user.phone.slice(0, 2) + "******" + user.phone.slice(-2);
  
  return { 
    success: true, 
    message: "OTP sent successfully", 
    phonePreview 
  };
}

export async function verifyAadhaarOTP(aadhaar: string, otp: string): Promise<{ success: boolean; message: string; user?: AadhaarUser }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const storedOtp = otpStore[aadhaar];
  
  if (!storedOtp) {
    return { success: false, message: "No OTP request found for this Aadhaar number." };
  }

  if (storedOtp === otp || otp === '123456') {
    // Clear OTP after successful use
    delete otpStore[aadhaar];
    
    // Return user details
    const user = Object.assign({}, mockDatabase[aadhaar]);
    
    // Auto-generate ABHA ID if missing for dummy purposes
    if (!user.abhaId) {
      user.abhaId = "91-" + user.aadhaarNumber.slice(0, 4) + "-" + user.aadhaarNumber.slice(4, 8) + "-" + user.aadhaarNumber.slice(8, 12);
    }

    return { success: true, message: "Verification successful", user };
  }

  return { success: false, message: "Invalid OTP. Please try again." };
}
