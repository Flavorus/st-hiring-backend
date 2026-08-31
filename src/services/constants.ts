// Settings validation messages and rules
export const SETTINGS_VALIDATION_MESSAGES = {
  bodyMustBeObject: 'Body must be a JSON object',
  salesEnabledMustBeBoolean: 'salesEnabled must be a boolean',
  defaultCurrencyMustBeNonEmptyString: 'defaultCurrency must be a non-empty string',
  supportEmailMustBeValid: 'supportEmail must be a valid email string',
  ticketHoldMinutesMustBePositiveInteger: 'ticketHoldMinutes must be an integer greater than 0',
} as const;

export const SETTINGS_VALIDATION_RULES = {
  minTicketHoldMinutes: 1,
} as const;
