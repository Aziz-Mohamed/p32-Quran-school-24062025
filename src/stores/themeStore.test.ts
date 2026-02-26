jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { useThemeStore } from './themeStore';

const initialState = useThemeStore.getState();

beforeEach(() => {
  useThemeStore.setState(initialState);
});

describe('themeStore', () => {
  describe('initial state', () => {
    it('defaults to light mode', () => {
      expect(useThemeStore.getState().mode).toBe('light');
    });
  });

  describe('setMode', () => {
    it('sets mode to dark', () => {
      useThemeStore.getState().setMode('dark');
      expect(useThemeStore.getState().mode).toBe('dark');
    });

    it('sets mode to light', () => {
      useThemeStore.getState().setMode('dark');
      useThemeStore.getState().setMode('light');
      expect(useThemeStore.getState().mode).toBe('light');
    });
  });

  describe('toggleMode', () => {
    it('toggles from light to dark', () => {
      useThemeStore.getState().toggleMode();
      expect(useThemeStore.getState().mode).toBe('dark');
    });

    it('toggles from dark to light', () => {
      useThemeStore.getState().setMode('dark');
      useThemeStore.getState().toggleMode();
      expect(useThemeStore.getState().mode).toBe('light');
    });

    it('toggles back and forth', () => {
      useThemeStore.getState().toggleMode(); // dark
      useThemeStore.getState().toggleMode(); // light
      useThemeStore.getState().toggleMode(); // dark
      expect(useThemeStore.getState().mode).toBe('dark');
    });
  });
});
