// This service is deprecated as the app is now offline-only.
// No AI dependencies are required.
export const generateColorFromMood = async (mood: string): Promise<any> => {
  throw new Error("AI features are disabled in offline mode.");
};