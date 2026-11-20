// src/utils/validation.js

/**
 * Regex for Egyptian mobile phone numbers (010, 011, 012, 015)
 * Matches: 01012345678, +201012345678, 00201012345678, 1012345678
 */
export const EGYPTIAN_PHONE_REGEX = /^(?:\+20|0020|0)?1[0125]\d{8}$/;

/**
 * Standard Email format validation regex
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Egyptian / Arabic / Alphanumeric License Plate regex
 * Allows Arabic letters, English letters, digits, dashes, and spaces (2-20 characters)
 */
export const LICENSE_PLATE_REGEX = /^[\u0600-\u06FFa-zA-Z0-9\s\-]{2,20}$/;

export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

export function isValidEgyptianPhone(phone) {
  if (typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return EGYPTIAN_PHONE_REGEX.test(cleaned);
}

export function isValidLicensePlate(plate) {
  return typeof plate === 'string' && LICENSE_PLATE_REGEX.test(plate.trim());
}

/**
 * Validate Vehicle Registration Form
 */
export function validateVehicle({ make, model, year, color, licensePlate }) {
  const errors = {};
  const currentYear = new Date().getFullYear();

  if (!make || !make.trim()) {
    errors.make = 'Car make (brand) is required.';
  } else if (make.trim().length < 2) {
    errors.make = 'Make must be at least 2 characters.';
  } else if (make.trim().length > 50) {
    errors.make = 'Make cannot exceed 50 characters.';
  }

  if (!model || !model.trim()) {
    errors.model = 'Car model is required.';
  } else if (model.trim().length > 50) {
    errors.model = 'Model cannot exceed 50 characters.';
  }

  const numYear = Number(year);
  if (!year || isNaN(numYear)) {
    errors.year = 'Manufacturing year is required.';
  } else if (numYear < 1950 || numYear > currentYear + 1) {
    errors.year = `Year must be between 1950 and ${currentYear + 1}.`;
  }

  if (!color || !color.trim()) {
    errors.color = 'Car color is required.';
  } else if (color.trim().length < 2) {
    errors.color = 'Color must be at least 2 characters.';
  }

  if (!licensePlate || !licensePlate.trim()) {
    errors.licensePlate = 'License plate number is required.';
  } else if (!isValidLicensePlate(licensePlate)) {
    errors.licensePlate = 'License plate must contain 2-20 letters/digits (Arabic or English).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate Customer Profile Update Form
 */
export function validateProfile({ fullName, email, phone, gateNotes }) {
  const errors = {};

  if (fullName !== undefined) {
    if (!fullName || !fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    } else if (fullName.trim().length > 100) {
      errors.fullName = 'Full name cannot exceed 100 characters.';
    }
  }

  if (email !== undefined) {
    if (!email || !email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }
  }

  if (phone !== undefined) {
    if (!phone || !phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!isValidEgyptianPhone(phone)) {
      errors.phone = 'Please enter a valid Egyptian mobile number (e.g. 01012345678 or +201012345678).';
    }
  }

  if (gateNotes && gateNotes.length > 500) {
    errors.gateNotes = 'Gate notes cannot exceed 500 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate Booking Parameters
 */
export function validateBooking({
  selectedVehicle,
  selectedPackage,
  address,
  bookingType,
  scheduledDate,
  scheduledTime,
  hasElectricity,
  hasWater,
  parkingType
}) {
  const errors = {};

  if (!selectedVehicle) {
    errors.vehicle = 'Please select a vehicle from your garage.';
  }

  if (!selectedPackage) {
    errors.package = 'Please select a wash package.';
  }

  if (!address || !address.trim()) {
    errors.address = 'Wash location address is required.';
  } else if (address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters long.';
  }

  // Utility requirements
  if (selectedPackage) {
    if (selectedPackage.requiresElectricity && !hasElectricity) {
      errors.utilities = `Package "${selectedPackage.name}" requires on-site electricity access. Please enable power or choose an Eco package.`;
    } else if (selectedPackage.requiresWater && !hasWater) {
      errors.utilities = `Package "${selectedPackage.name}" requires water access on-site. Please confirm water availability.`;
    } else if (selectedPackage.requiresPrivateParking && Number(parkingType) === 0) {
      // 0 = STREET
      errors.utilities = `Package "${selectedPackage.name}" requires private parking (driveway or garage).`;
    }
  }

  // Schedule date/time check
  if (Number(bookingType) === 1) { // 1 = SCHEDULED
    if (!scheduledDate) {
      errors.schedule = 'Please select a scheduled date.';
    } else {
      const selected = new Date(`${scheduledDate}T${scheduledTime?.includes('PM') ? '14:00:00' : '10:00:00'}`);
      const now = new Date();
      // Allow 5 minutes buffer
      if (selected.getTime() < now.getTime() - 5 * 60 * 1000) {
        errors.schedule = 'Scheduled date and time cannot be in the past.';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate Saved Address
 */
export function validateSavedAddress(address) {
  if (!address || !address.trim()) {
    return 'Address cannot be empty.';
  }
  if (address.trim().length < 5) {
    return 'Address must be at least 5 characters long.';
  }
  if (address.trim().length > 250) {
    return 'Address cannot exceed 250 characters.';
  }
  return '';
}

/**
 * Validate Dispute Submission
 */
export function validateDispute({ reason }) {
  const errors = {};
  if (!reason || !reason.trim()) {
    errors.reason = 'Please explain the reason for your dispute.';
  } else if (reason.trim().length < 5) {
    errors.reason = 'Dispute reason must be at least 5 characters.';
  } else if (reason.trim().length > 200) {
    errors.reason = 'Dispute reason cannot exceed 200 characters.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate Technician Payout Request
 */
export function validatePayout({ amount, payoutMethod, accountDetails, availableBalance }) {
  const errors = {};
  const numAmount = Number(amount);

  if (!amount || isNaN(numAmount) || numAmount <= 0) {
    errors.amount = 'Payout amount must be greater than zero.';
  } else if (numAmount < 50) {
    errors.amount = 'Minimum payout withdrawal is 50 EGP.';
  } else if (availableBalance !== undefined && numAmount > availableBalance) {
    errors.amount = `Withdrawal amount cannot exceed available balance (EGP ${availableBalance.toLocaleString()}).`;
  }

  if (!payoutMethod || !payoutMethod.trim()) {
    errors.payoutMethod = 'Please choose a payout method.';
  }

  if (!accountDetails || !accountDetails.trim()) {
    errors.accountDetails = 'Please provide your account details (Instapay username, mobile wallet number, or IBAN).';
  } else if (accountDetails.trim().length < 5) {
    errors.accountDetails = 'Account details must be at least 5 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate Wallet Top-Up
 */
export function validateWalletTopUp(amount) {
  const num = Number(amount);
  if (!amount || isNaN(num) || num <= 0) {
    return 'Please enter a valid top-up amount.';
  }
  if (num < 10) {
    return 'Minimum top-up amount is 10 EGP.';
  }
  if (num > 50000) {
    return 'Maximum top-up amount is 50,000 EGP.';
  }
  return '';
}

/**
 * Helper to extract server validation errors from API error responses
 */
export function extractApiErrors(error) {
  if (!error) return { message: 'An unknown error occurred.', fieldErrors: {} };

  const message = error.message || error.data?.message || 'Validation failed. Please check your inputs.';
  const rawErrors = error.errors || error.data?.errors || {};
  const fieldErrors = {};

  // Normalize server field names to lowercase/camelCase
  Object.keys(rawErrors).forEach((key) => {
    const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
    const msgs = rawErrors[key];
    fieldErrors[normalizedKey] = Array.isArray(msgs) ? msgs[0] : msgs;
  });

  return {
    message,
    fieldErrors
  };
}
