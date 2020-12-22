import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class UserdataService {

  constructor(
    public auth: AngularFireAuth
  ) { }
  login() {
    return this.auth.signInWithPopup( new (firebase.auth as any).GoogleAuthProvider()).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/network-request-failed'){
        alert(errorMessage);
      }
    });
  }
  logout() {
    return this.auth.signOut();
  }
}
