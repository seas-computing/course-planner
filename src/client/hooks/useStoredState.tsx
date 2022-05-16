import {
  useState,
  useMemo,
  SetStateAction,
  Dispatch,
  useCallback,
} from 'react';

/**
 * Hookified version of the Storage availabilty test from MDN
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#testing_for_availability
 *
 * Essentially, it makes sure that the storage API exists, and that it is
 * actually writable. While the modern browsers we can about do have the
 * Storage APIs available, there are some circumstances (e.g. private browsing,
 * user preference) where they may not be usable.
 */

export const useHasStorage = (
  type: 'sessionStorage' | 'localStorage'
): boolean => (useMemo(() => {
  let storage: Storage;
  try {
    storage = window[type];
    const test = '__storage_test__';
    // test writing and removing a value to ensure that the storage exists and
    // is actually usable
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch (e) {
    // The above set/remove test could fail if the storage is full, in which
    // case we can still return true
    return e instanceof DOMException
      && (
        // Non-Firefox code/name indicating full storage
        e.code === 22
        || e.name === 'QuotaExceededError'
        // Firefox code/name indicating full storage
        || e.code === 1014
        || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )
      // Some browsers "disable" storage by setting the quota to 0 (ie. in
      // private mode), which would be indicated by the full storage errors
      // above while nothing is actually saved in storage.
      && (storage && storage.length !== 0);
  }
}, [type]));

/**
 * Wraps the existing useState function with an extra handler that persists
 * the state value in storage. If the specified key already exists in storage,
 * that storage value will be used instead of the fallbackValue, if provided.
 * Optionally allows for choosing between sessionStorage and localStorage,
 * defaulting to the former.
 *
 * If the Storage API is not avaialable, it will fall back to the default
 * useState implementation.
 */

export function useStoredState<STATE>(
  key: string,
  fallbackValue: STATE | (() => STATE) = null,
  storageType: 'sessionStorage' | 'localStorage' = 'sessionStorage'
): [STATE, Dispatch<SetStateAction<STATE>>] {
  let initialValue = fallbackValue;
  const canUseStorage = useHasStorage(storageType);
  if (canUseStorage) {
    const storage = window[storageType];
    const existingValue = storage.getItem(key);
    if (existingValue !== null) {
      initialValue = JSON.parse(existingValue) as STATE;
    } else if (fallbackValue) {
      storage.setItem(key, JSON.stringify(fallbackValue));
    }
  }
  const [stateValue, setStateValue] = useState<STATE>(initialValue);
  const setStateValueInStorage = useCallback(
    (newState: SetStateAction<STATE>) => {
      setStateValue((existingState) => {
        // We need to handle cases where the state update is a function by
        // calling the function with the existing state value and persisting
        // that to storage, then returning the new state
        let updatedState: STATE;
        if (newState instanceof Function) {
          updatedState = newState(existingState);
        } else {
          updatedState = newState;
        }
        if (canUseStorage) {
          window[storageType].setItem(key, JSON.stringify(updatedState));
        }
        return updatedState;
      });
    }, [
      key,
      canUseStorage,
      storageType,
    ]
  );
  return [
    stateValue,
    setStateValueInStorage,
  ];
}
