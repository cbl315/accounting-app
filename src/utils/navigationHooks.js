// Mock implementations for web
export const useBackButton = () => {};
export const useDocumentTitle = () => {};
export const useLinking = () => ({
  getInitialState: async () => null,
  getStateFromPath: () => null,
  getPathFromState: () => '/'
});
