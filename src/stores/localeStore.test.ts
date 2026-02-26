jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { useLocaleStore } from './localeStore';

const initialState = useLocaleStore.getState();

beforeEach(() => {
  useLocaleStore.setState(initialState);
});

describe('localeStore', () => {
  describe('initial state', () => {
    it('defaults to English and LTR', () => {
      const state = useLocaleStore.getState();
      expect(state.locale).toBe('en');
      expect(state.isRTL).toBe(false);
    });
  });

  describe('setLocale', () => {
    it('switches to Arabic and sets RTL', () => {
      useLocaleStore.getState().setLocale('ar');
      const state = useLocaleStore.getState();

      expect(state.locale).toBe('ar');
      expect(state.isRTL).toBe(true);
    });

    it('switches back to English and sets LTR', () => {
      useLocaleStore.getState().setLocale('ar');
      useLocaleStore.getState().setLocale('en');
      const state = useLocaleStore.getState();

      expect(state.locale).toBe('en');
      expect(state.isRTL).toBe(false);
    });
  });
});
