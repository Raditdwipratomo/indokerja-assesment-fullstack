export const ApiResponse = (success: boolean, data?: any, message?: string) => {
  return { success, data, message };
};
