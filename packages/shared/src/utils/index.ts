// Utility function to format contact display name
export function getContactDisplayName(contact: { 
  firstName?: string; 
  lastName?: string; 
  companyName?: string; 
  contactType: 'person' | 'company' 
}): string {
  if (contact.contactType === 'company') {
    return contact.companyName || 'Unnamed Company';
  }
  
  const firstName = contact.firstName || '';
  const lastName = contact.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  return firstName || lastName || 'Unnamed Contact';
}

// Utility function to format address as single line
export function formatAddress(address: {
  addressLine1?: string;
  addressLine2?: string;
  locality?: string;
  administrativeArea?: string;
  postalCode?: string;
  countryCode?: string;
}): string {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.locality,
    address.administrativeArea,
    address.postalCode,
  ].filter(Boolean);
  
  return parts.join(', ');
}

// Utility to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility to validate phone format (basic)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Export validation utilities
export * from './validation';
