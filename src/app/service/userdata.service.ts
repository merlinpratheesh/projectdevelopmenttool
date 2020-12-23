import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { of, merge, fromEvent } from 'rxjs';
import { map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class UserdataService {
  isOnline$: Observable<boolean>;

  constructor(
    public auth: AngularFireAuth
  ) {
    this.isOnline$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).pipe(map(() => navigator.onLine));
  }
  login() {
    return this.auth.signInWithPopup( new (firebase.auth as any).GoogleAuthProvider()).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/network-request-failed'){
        alert('Check Internet Connection');
      }
    });
  }
  logout() {
    return this.auth.signOut();
  }
}
