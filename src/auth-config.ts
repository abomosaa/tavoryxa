// Browser-public settings only. Provider secrets never belong in Vite variables.
export const authConfig = {
  url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
  emailDeliveryEnabled: import.meta.env.VITE_EMAIL_DELIVERY_ENABLED === 'true',
};
