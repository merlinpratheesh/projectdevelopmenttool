import { Component } from '@angular/core';
import { BehaviorSubject , Subscription,Observable } from 'rxjs';
import firebase from 'firebase/app';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserdataService } from './service/userdata.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ProjectDevelopmentTool';
  subjectauth = new BehaviorSubject(null);
  getObservableauthStateSub:Subscription;
  myauth;
  getObservableauthState = (authdetails: Observable<firebase.User>) => {

    if(this.getObservableauthStateSub !== undefined){
      //this.subjectauth.complete();
      this.getObservableauthStateSub.unsubscribe();
    }
    this.getObservableauthStateSub= authdetails.subscribe((val: any) => {     
      this.subjectauth.next(val);
    });
    return this.subjectauth;
  };

  constructor(
    public dialog: MatDialog,
    public afAuth: AngularFireAuth,
    public developmentservice:UserdataService

    ) {
      this.myauth = this.getObservableauthState(this.afAuth.authState);

    }
}
