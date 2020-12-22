import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject , Subscription,Observable } from 'rxjs';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserdataService } from './service/userdata.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { conditionallyCreateMapObjectLiteral } from '@angular/compiler/src/render3/view/util';
import { withLatestFrom, map, switchMap } from 'rxjs/operators';

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
  myauthonline;
  openDialogSub:Subscription;
  getObservableauthState = (authdetails: Observable<firebase.User>) => {

    if(this.getObservableauthStateSub !== undefined){
      this.getObservableauthStateSub.unsubscribe();
    }
    this.getObservableauthStateSub= authdetails.subscribe((val: any) => {     
     this.subjectauth.next(val);
    });
    return this.subjectauth;
  };
  titleDialogRef: MatDialogRef<DialogLogin>

  getObservableonine = (localonline: Observable<boolean>) => {    
    this.getObservableonlineSub?.unsubscribe();
    this.getObservableonlineSub= localonline.subscribe((valOnline: any) => {
      this.subjectonline.next(valOnline);
    });
    return this.subjectonline;
  };
  isOnline$: Observable<boolean>;
  constructor(
    public dialog: MatDialog,
    public afAuth: AngularFireAuth,
    public developmentservice:UserdataService

    ) {
      this.myauth = this.getObservableauthState(this.afAuth.authState);
      //this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
      this.myauthonline= this.getObservableonine(this.developmentservice.isOnline$).pipe(
        switchMap((onlineval:any)=>{
          return this.myauth.pipe(map((authval:any)=> {
            console.log('online',onlineval, 'auth', authval);
            if(onlineval === true){
              if(authval === null){
                this.titleDialogRef?.close();
                this.openDialog('loggedout');
              }else{
                this.titleDialogRef?.close();
              }
              return onlineval;
            }
            if(onlineval === false){

alert('check Internet connection');
              return onlineval;
            }
            
          }))
        })        
      );
    }
    openDialog(status: string): void {
      this.titleDialogRef = this.dialog.open(DialogLogin, {
        data: status
      });
  
      this.openDialogSub= this.titleDialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      
      });
    }
    ngOnInit() {
     // this.openDialog('spinner');
    }
    componentLogOff() {

      this.developmentservice.logout();
      this.openDialogSub?.unsubscribe();
}
}

@Component({
  selector: 'dialog-login',
  template: `




 <div *ngIf="data === 'loggedout'"  style="color:blue; padding:0px;" >
 <div fxLayout="column" fxLayoutAlign="space-around center" style="letter-spacing: 20px;">
 <h1> <strong style="font-size:30px">Testing tool</strong> </h1>
 <h1>  Checkout various Public projects TestCases </h1>
 <h1>  Also Edit/Create/Delete Testcases in Demo Mode </h1>
 </div>
 <div fxLayout="row " fxLayoutAlign="space-around center">
   <mat-chip-list>
   <mat-chip  style="font-size:2em; padding:10px;height: 60px !important;
   " >Login now:</mat-chip>
   </mat-chip-list>
   <button mat-raised-button color="primary" (click)="testerApiService.login()"> Google login</button>
 </div>
 </div>

 <div *ngIf="data !== 'loggedout'">
<mat-spinner  ></mat-spinner>
</div>






  `
})
export class DialogLogin {
 
  constructor(
    public dialogRef: MatDialogRef<DialogLogin>,
    @Inject(MAT_DIALOG_DATA) public data: string, public testerApiService: UserdataService) {

  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}

