import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimations } from '@angular/platform-browser/animations';

const firebaseConfig = {
  apiKey: "AIzaSyCHbX2QK--PsFtiIXGRgk-7eoOrm8raUy4",
  authDomain: "kutuphaneitp.firebaseapp.com",
  projectId: "kutuphaneitp",
  storageBucket: "kutuphaneitp.firebasestorage.app",
  messagingSenderId: "599655432245",
  appId: "1:599655432245:web:549a52db95d8e26ecb317c"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnimations()
  ]
};
