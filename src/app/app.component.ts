import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject , Subscription,Observable } from 'rxjs';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserdataService } from './service/userdata.service';
import { conditionallyCreateMapObjectLiteral } from '@angular/compiler/src/render3/view/util';
import { withLatestFrom, map, switchMap,filter,tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ProjectDevelopmentTool';
  subjectauth = new BehaviorSubject(undefined);
  subjectonline = new BehaviorSubject(undefined);
  getObservableauthStateSub:Subscription;
  getObservableonlineSub:Subscription;
  myauth;
  myonline;
  myonlineAfterAuth;
  getObservableauthState = (authdetails: Observable<firebase.User>) => {

    if(this.getObservableauthStateSub !== undefined){
      this.getObservableauthStateSub.unsubscribe();
    }
    this.getObservableauthStateSub= authdetails.subscribe((val: any) => {    
     this.subjectauth.next(val);
    });
    return this.subjectauth;
  };

  getObservableonine = (localonline: Observable<boolean>) => {    
    this.getObservableonlineSub?.unsubscribe();
    this.getObservableonlineSub= localonline.subscribe((valOnline: any) => {
      this.subjectonline.next(valOnline);
    });
    return this.subjectonline;
  };
  isOnline$: Observable<boolean>;
  constructor(
    public afAuth: AngularFireAuth,
    public developmentservice:UserdataService

    ) {
      this.myauth = this.getObservableauthState(this.afAuth.authState);
      this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
      this.myonlineAfterAuth= this.myonline.pipe(
        switchMap((onlineval:any)=>{
          return this.myauth.pipe(    
            filter(authstat=> authstat !== undefined),        
            map((authval:any)=> {
              //read tc
              //read keys
              return onlineval;      
          }))
        })        
      );
    }
    ngOnInit() {
    }

}
