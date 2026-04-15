import { generateAadhaarOTP, verifyAadhaarOTP, otpStore } from '../src/lib/aadhaarApi';

describe('Aadhaar API Mock', () => {
  beforeEach(() => {
    // Clear out OTP store before each test
    for (const key in otpStore) {
      delete otpStore[key];
    }
  });

  it('should successfully generate OTP for a valid dummy Aadhaar number', async () => {
    const validAadhaar = "123456789012";
    const result = await generateAadhaarOTP(validAadhaar);
    
    expect(result.success).toBe(true);
    expect(result.message).toBe("OTP sent successfully");
    expect(result.phonePreview).toBe("98******10");
    // OTP should be stored internally
    expect(otpStore[validAadhaar]).toBeDefined();
    expect(otpStore[validAadhaar]).toMatch(/^\d{6}$/);
  });

  it('should fail to generate OTP for an invalid Aadhaar number', async () => {
    const invalidAadhaar = "000000000000";
    const result = await generateAadhaarOTP(invalidAadhaar);
    
    expect(result.success).toBe(false);
    expect(result.message).toBe("Aadhaar number not found in database.");
    expect(otpStore[invalidAadhaar]).toBeUndefined();
  });

  it('should verify OTP successfully and return user details', async () => {
    const validAadhaar = "123456789012";
    await generateAadhaarOTP(validAadhaar);
    
    // Retrieve OTP directly from store for testing success logic
    const generatedOtp = otpStore[validAadhaar];
    
    const verificationResult = await verifyAadhaarOTP(validAadhaar, generatedOtp);
    
    expect(verificationResult.success).toBe(true);
    expect(verificationResult.message).toBe("Verification successful");
    expect(verificationResult.user).toBeDefined();
    expect(verificationResult.user?.name).toBe("Ramesh Kumar");
    expect(verificationResult.user?.abhaId).toBe("91-1234-5678-9012");
    
    // Ensure OTP is cleared after successful verification
    expect(otpStore[validAadhaar]).toBeUndefined();
  });

  it('should fail verification if OTP is incorrect', async () => {
    const validAadhaar = "123456789012";
    await generateAadhaarOTP(validAadhaar);
    
    const wrongOtp = "000000";
    const verificationResult = await verifyAadhaarOTP(validAadhaar, wrongOtp);
    
    expect(verificationResult.success).toBe(false);
    expect(verificationResult.message).toBe("Invalid OTP. Please try again.");
    
    // OTP should NOT be cleared if verification failed
    expect(otpStore[validAadhaar]).toBeDefined();
  });

  it('should fail verification if no OTP was requested', async () => {
    const validAadhaar = "123456789012";
    
    const verificationResult = await verifyAadhaarOTP(validAadhaar, "123456");
    
    expect(verificationResult.success).toBe(false);
    expect(verificationResult.message).toBe("No OTP request found for this Aadhaar number.");
  });
  
  it('should auto-generate ABHA ID if missing', async () => {
    const noAbhaAadhaar = "111122223333";
    await generateAadhaarOTP(noAbhaAadhaar);
    const generatedOtp = otpStore[noAbhaAadhaar];
    
    const verificationResult = await verifyAadhaarOTP(noAbhaAadhaar, generatedOtp);
    expect(verificationResult.success).toBe(true);
    expect(verificationResult.user?.abhaId).toBe("91-1111-2222-3333");
  });
});
