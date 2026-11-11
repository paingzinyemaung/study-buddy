const KEY = 'accessCode';
export const ACCESS_EVENT = 'access-required';

export function getAccessCode(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function setAccessCode(code: string) {
  try {
    localStorage.setItem(KEY, code.trim());
  } catch {
    /* storage ပိတ်ထားရင် ကျော်သွားမယ် */
  }
}

// Code လိုတဲ့အခါ dialog ဖွင့်ခိုင်းတဲ့ signal
export function requestAccessCode() {
  window.dispatchEvent(new Event(ACCESS_EVENT));
}
