// Local Storage Key Constants
const STORAGE_KEYS = {
  FULL_NAME: 'fullName',
  AGE: 'age',
  SEX: 'sex',
} as const;

// Define a type for the user data
type UserData = {
  fullName: string | null;
  age: string | null;
  sex: string | null;
};

// Setter for Local Storage
export function setUserDataInLocalStorage(data: {fullName: string, age: string, sex: string}): void {
  if (typeof data.fullName === 'string') {
    localStorage.setItem(STORAGE_KEYS.FULL_NAME, data.fullName);
  }
  if (typeof data.age === 'string') {
    localStorage.setItem(STORAGE_KEYS.AGE, data.age);
  }
  if (typeof data.sex === 'string') {
    localStorage.setItem(STORAGE_KEYS.SEX, data.sex);
  }
}

// Getter for Local Storage
export function getUserData(): UserData {
  return {
    fullName: localStorage.getItem(STORAGE_KEYS.FULL_NAME),
    age: localStorage.getItem(STORAGE_KEYS.AGE),
    sex: localStorage.getItem(STORAGE_KEYS.SEX),
  };
}