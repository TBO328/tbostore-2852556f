// Centralized error message mapping for security
// Never expose raw database or system errors to users

interface PostgresError {
  code?: string;
  message?: string;
}

export const mapErrorToUserMessage = (
  error: unknown, 
  language: 'en' | 'ar'
): string => {
  // Log full error for debugging (server-side only in production)
  console.error('Application error:', error);
  
  const err = error as PostgresError;
  
  // Check for common Postgres error codes
  if (err?.code === '23505') { // Unique constraint violation
    return language === 'en'
      ? 'This value already exists'
      : 'هذه القيمة موجودة بالفعل';
  }
  
  if (err?.code === '23503') { // Foreign key violation
    return language === 'en'
      ? 'Cannot complete operation: referenced data exists'
      : 'لا يمكن إكمال العملية: البيانات المرجعية موجودة';
  }
  
  if (err?.code === '42501') { // Permission denied
    return language === 'en'
      ? 'You do not have permission for this action'
      : 'ليس لديك إذن لهذا الإجراء';
  }

  if (err?.code === '23502') { // Not null violation
    return language === 'en'
      ? 'Required field is missing'
      : 'حقل مطلوب مفقود';
  }

  if (err?.code === '22P02') { // Invalid text representation
    return language === 'en'
      ? 'Invalid data format'
      : 'صيغة بيانات غير صالحة';
  }

  // Check for rate limiting or auth errors
  if (err?.message?.includes('rate limit')) {
    return language === 'en'
      ? 'Too many requests. Please wait a moment.'
      : 'طلبات كثيرة جداً. يرجى الانتظار.';
  }

  if (err?.message?.includes('JWT') || err?.message?.includes('token')) {
    return language === 'en'
      ? 'Session expired. Please log in again.'
      : 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.';
  }

  // Default safe message
  return language === 'en'
    ? 'An error occurred. Please try again.'
    : 'حدث خطأ. يرجى المحاولة مرة أخرى.';
};

// Validation error message
export const getValidationErrorMessage = (
  language: 'en' | 'ar'
): string => {
  return language === 'en'
    ? 'Please check your information and try again.'
    : 'يرجى التحقق من معلوماتك والمحاولة مرة أخرى.';
};
