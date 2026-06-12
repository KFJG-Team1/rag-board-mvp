import { useState } from "react";
import { readStorage, writeStorage } from "../lib/storage";

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback));

  const setStoredValue = (nextValue: T | ((previous: T) => T)) => {
    setValue((previous) => {
      const resolvedValue =
        nextValue instanceof Function ? nextValue(previous) : nextValue;
      writeStorage(key, resolvedValue);
      return resolvedValue;
    });
  };

  return [value, setStoredValue] as const;
}
