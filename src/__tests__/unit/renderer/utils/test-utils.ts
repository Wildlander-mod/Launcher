/**
 * Creates a CSS selector for data-testid attribute
 * @param id - The test ID string
 * @returns CSS attribute selector for the test ID
 */
export const byTestId = (id: string): string => {
  return `[data-testid="${id}"]`;
};
