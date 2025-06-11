import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HapticService {
  constructor() {}

  /**
   * Triggers a light haptic feedback
   */
  light() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  /**
   * Triggers a medium haptic feedback
   */
  medium() {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }

  /**
   * Triggers a strong haptic feedback
   */
  strong() {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }
} 