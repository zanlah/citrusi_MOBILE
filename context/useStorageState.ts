import * as SecureStore from "expo-secure-store";
import * as React from "react";
import { Platform } from "react-native";

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null]
): UseStateHook<T> {
  return React.useReducer(
    (
      state: [boolean, T | null],
      action: T | null = null
    ): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === "web") {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    try {
      if (value == null) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      console.error("SecureStore operation failed:", e);
    }
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  // Public
  const [state, setState] = useAsyncState<string>();

  // Get
  React.useEffect(() => {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") {
          setState(localStorage.getItem(key));
        }
      } catch (e) {
        console.error("Local storage is unavailable:", e);
      }
    } else {
      SecureStore.getItemAsync(key).then((value: any) => {
        setState(value);
      });
    }
  }, [key]);

  // Set
  const setValue = React.useCallback(
    async (value: string | null) => {
      try {
        await setStorageItemAsync(key, value);
        setState(value); // Update state only after storage is confirmed
      } catch (error) {
        console.error("Failed to update storage:", error);
      }
    },
    [key]
  );

  return [state, setValue];
}
