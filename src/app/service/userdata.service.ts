import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Observable,Subscription } from 'rxjs';
import { of, merge, fromEvent } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, first } from 'rxjs/operators';
import { FormControl,FormGroup} from '@angular/forms'
import {BehaviorSubject} from 'rxjs';

export interface projectSub{
  NewTaskControlSub:Subscription;
  ownPublicprojectControlSub:Subscription;
  editMainsectionGroupSub:Subscription;
  editSubsectionGroupSub:Subscription;
  loadFirstPageTcSub:Subscription;
  loadfirstPageKeysSub:Subscription;
  openeditSub:Subscription;
  visibilityMainsectionGroupSub:Subscription;
}
export interface projectFlags
{    
    testcasesInSubmenu:boolean;//show add or New Testcase based on number of testcases in subsection
    showPaymentpage:boolean;//for expired user-remove it
    firstTestcaseEdit:boolean;
    showEditTcButton:boolean;
    homeNewProject:boolean;
    homeDeleteProject:boolean;
    homeCurrentProject:boolean;
    editModifyProject:boolean;
    editAddMainsec:boolean;
    editDeleteMainsec:boolean;
    editVisibility:boolean;//visibility button
    editAddSubSec:boolean;
    editDeleteSubsec:boolean;
    editAddProject:boolean;
    editDeleteProject:boolean;
    editUpdateProject:boolean;
    
}
export interface userProfile { 
  userAuthenObj: firebase.User,//Receive User obj after login success
  projectLocation?:string;//Demo or User public project ref
  projectOwner?:boolean;
  projectName?:string
  membershipType?:string;
  endMembershipValidity?:Date;
  keysReadFromDb?:MainSectionGroup[];
  mainsubsectionKeys?: string[];
  subSectionKeys?:string[];
  savedMainSectionKey:string;
  savesubSectionKeys?:string[];
  savedisabledval?:boolean;
 }

export interface SubSection {
  viewvalue: string;
}

export interface TestcaseInfo{
  heading: string;//Heading in testcase list
  subHeading:string;//Sub-Heading in testcase list
  description: string;//Description in testcase view
  linktoTest: string;//stackblitzLink in testcase edit/doubleclick
}

export interface MainSectionGroup {
  disabled: boolean;
  name: string;
  section: SubSection[];
}

export interface projectControls{
  subsectionkeysControl: FormControl;//1-Keys come from db and user sub-sec selection will load a doc from demo or public proj
  testcaseInfoControl: FormControl; //Displays the selected Testcase details
  createTestcaseControl: FormControl;//User enters a test case name
  publicprojectControl: FormControl;//1-User selects a public project    
  ownPublicprojectControl: FormControl;//1-User selects own public project
  firstMainSecControl: FormControl
  editMainsectionGroup: FormGroup;// user selects a Main section key
  visibilityMainsectionGroup:FormGroup,
  editSubsectionGroup: FormGroup;  // user selects a Sub section key

}
export interface projectVariables
{
    initialMainSection?:string;
    testcaseslength?:number;
    publicProjectHint?:string;
    publicProjectHome:Observable<string[]>;
    privateTaskMainEdit:Observable<string[]>;
    privateTaskSubEdit:Observable<string[]>;
    viewSelectedTestcase?:TestcaseInfo;
    testcaseInfodata?: Observable<TestcaseInfo[]>;
    modifiedKeysDb?:TestcaseInfo[];
    editProjectkeysSaved:MainSectionGroup[];
    lastSavedVisibility:boolean;
}
export interface myusrinfo{
  MembershipEnd:string;
  MembershipType:string;
  projectLocation:string;
  projectName:string;
  projectOwner:string;
}
@Injectable({
  providedIn: 'root'
})

export class UserdataService {
  isOnline$: Observable<boolean>;
  public booleanAdd = new BehaviorSubject(false);
  public booleanDel = new BehaviorSubject(false);
  public booleanUpdate = new BehaviorSubject(false);
  castValueAdd = this.booleanAdd.asObservable();
  castValueDel = this.booleanDel.asObservable();
  castValueUpdate = this.booleanUpdate.asObservable();
  constructor(
    public auth: AngularFireAuth,private db: AngularFirestore
  ) { 
    this.isOnline$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).pipe(map(() => navigator.onLine));
  }
  sendValueAdd(newValue){
    this.booleanAdd.next(newValue); 
  }
  sendValueDel(newValue){
    this.booleanDel.next(newValue); 
  }
  sendValueUpdate(newValue){
    this.booleanUpdate.next(newValue); 
  }

  login() {
    return this.auth.signInWithRedirect( new (firebase.auth as any).GoogleAuthProvider()).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/network-request-failed'){
        
        //alert('Check Internet Connection');
        location.reload();
      }
    });
  }
  logout() {
    return this.auth.signOut();
  }
  docExists() {
    return this.db.doc(`projectList/DemoProjectKey`).valueChanges().pipe(first()).toPromise();
  }
  async createNewTestcase(locationForSave : string, newTestcase :TestcaseInfo)  : Promise<void>{
    await this.db.firestore.doc(locationForSave).set({testcase: firebase.firestore.FieldValue.arrayUnion(newTestcase) },{merge: true}); 
  }
  async deleteTestcase(locationForDelete : string, deleteTestcase :TestcaseInfo): Promise<void>{
    await this.db.firestore.doc(locationForDelete).update({testcase: firebase.firestore.FieldValue.arrayRemove(deleteTestcase)}); 
  }
  async editTestcase(locationForedit : string, deleteTestcase :TestcaseInfo,updatedTestcase :TestcaseInfo ): Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.firestore.doc(locationForedit).update({testcase: firebase.firestore.FieldValue.arrayRemove(deleteTestcase)}),
        this.db.firestore.doc(locationForedit).update({testcase: firebase.firestore.FieldValue.arrayUnion(updatedTestcase)})
      ]);
      return promise;
    });
  }
  async createnewproject(uid:string, projectname: string, newprojectinfo: any, MainSection:any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.firestore.doc('myProfile/' + uid).set(newprojectinfo,{merge: true}),
        this.db.firestore.doc('projectList/' + uid).set({ownerRecord: firebase.firestore.FieldValue.arrayUnion(projectname)},{merge: true}),
        this.db.firestore.doc('publicProjectKeys/' + projectname).set({MainSection},  {merge: false}) ,
        this.db.firestore.doc('projectList/' + 'publicProjects/').set({public: firebase.firestore.FieldValue.arrayUnion(projectname)},{merge: true})
      ]);
      return promise;
    });
  }
  async deleteproject(uid:string,oldprojectName:string, newprojectinfo: any) : Promise<void>{
    console.log('oldprojectName',oldprojectName);
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.firestore.doc('projectList/' + uid).update({ownerRecord: firebase.firestore.FieldValue.arrayRemove(oldprojectName)}),
        this.db.firestore.doc('projectList/' + 'publicProjects').update({public: firebase.firestore.FieldValue.arrayRemove(oldprojectName)}),
        this.db.firestore.doc('myProfile/' + uid).set(newprojectinfo,{merge: true}),
        this.db.firestore.doc('publicProjectKeys/' + oldprojectName).delete()
      ]);
      return promise;
    });
  }  
  async deleteMainSection(ProjectName: string, MainSection: any) : Promise<void>{    
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.doc('publicProjectKeys/' + ProjectName).set({MainSection },  {merge: false} )
    ]);
    return promise;
  });
  }
  async addMainSection(ProjectName: string,  MainSection: any) : Promise<void>{    
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.doc('publicProjectKeys/' + ProjectName).set({MainSection },  {merge: false} )
    ]);
    return promise;
  });
  }  
  async updatevisibility(ProjectName: string,MainSection: any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.doc('publicProjectKeys/' + ProjectName).set({MainSection},  {merge: false})
    ]);
    return promise;
  });}
  async addSubSection(ProjectName: string,MainSectionName:string, SubSectionName: string,MainSection: any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.doc('publicProjectKeys/' + ProjectName).set({MainSection},  {merge: false}),
        this.db.doc(ProjectName + '/' + MainSectionName + '/items/' + SubSectionName ).delete()  
    ]);
    return promise;
  });}
  async deleteSubSection(ProjectName: string, MainSection: string, SubSectionName: string, SubsecObj: any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.doc( ProjectName + '/' + MainSection + '/items/' + SubSectionName + '/').delete(),
        this.db.doc('publicProjectKeys/' + ProjectName).set(SubsecObj,  {merge: false})        
      ]);
      return promise;
    });
  }
  async updateSubSection(ProjectName: string, MainSection: string, subSection: any) : Promise<void>{
    await this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        //this.db.doc('publicProjectKeys/' + ProjectName).update({ [MainSection]: firebase.firestore.FieldValue.delete()}),
        this.db.doc('publicProjectKeys/' + ProjectName).set(subSection),
      ]);
      return promise;
    });
  }
}