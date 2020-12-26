import { Component, OnInit,ViewChild } from '@angular/core';
import { BehaviorSubject , Subscription,Observable } from 'rxjs';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { projectSub, myusrinfo,projectVariables,projectControls, UserdataService, MainSectionGroup,TestcaseInfo,userProfile,projectFlags } from './service/userdata.service';
import { map, switchMap,filter,take,startWith } from 'rxjs/operators';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { doc } from 'rxfire/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'StepsWise Tool';

  myonline=undefined;
  subjectonline = new BehaviorSubject(undefined);
  getObservableonlineSub:Subscription;
  getObservableonine = (localonline: Observable<boolean>) => {    
    this.getObservableonlineSub?.unsubscribe();
    this.getObservableonlineSub= localonline.subscribe((valOnline: any) => {
      this.subjectonline.next(valOnline);
    });
    return this.subjectonline;
  };

  myauth=undefined;
  subjectauth = new BehaviorSubject(undefined);
  getObservableauthStateSub:Subscription;
  getObservableauthState = (authdetails: Observable<firebase.User>) => {

    if(this.getObservableauthStateSub !== undefined){
      this.getObservableauthStateSub.unsubscribe();
    }
    this.getObservableauthStateSub= authdetails.subscribe((val: any) => {     
     this.subjectauth.next(val);
    });
    return this.subjectauth;
  };

  myonlineAfterAuth=undefined;

  myProfileInfo=undefined;
  getProfileInfoBehaviourSub= new BehaviorSubject(undefined);
  getProfileInfoSubscription:Subscription;
  getProfileInfo = (ProfileInfoDoc: AngularFirestoreDocument<myusrinfo>) => {    
    if(this.getProfileInfoSubscription !== undefined){
      this.getProfileInfoSubscription.unsubscribe();
    }
    this.getProfileInfoSubscription= ProfileInfoDoc.valueChanges().subscribe(async (val: myusrinfo) => {
      if(val === undefined){       
        this.getSectionsBehaviourSub.next(undefined);
      }else{
        if(!Object.keys(val).length === true){
          const documentExist=undefined;//= await this.testerApiService.docExists();
          console.log('documentExist',documentExist);
          if(documentExist !== undefined){
            const nextMonth: Date = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const newItem = {
              MembershipEnd: nextMonth.toDateString(),
              MembershipType: 'Demo',
              projectLocation: '/projectList/DemoProjectKey',
              projectOwner: true,
              projectName: 'Demo'
            };  
            this.db.doc<any>('myProfile/' + this.myuserProfile.userAuthenObj.uid).set(newItem).then(success=>{
              this.myuserProfile.projectLocation = '/projectList/DemoProjectKey';
              //write new record
              this.myuserProfile.projectOwner = true;
              this.myuserProfile.projectName = 'Demo';
              this.myuserProfile.projectLocation = '/projectList/DemoProjectKey';
              this.myuserProfile.membershipType = 'Demo';
              this.myuserProfile.endMembershipValidity = new Date(nextMonth.toDateString());
              //other opions here for new User
              this.myprojectFlags.showPaymentpage = false;            
            });          
          }
        }
      }
      this.getProfileInfoBehaviourSub.next(val);
    });
    return this.getProfileInfoBehaviourSub;
  };

  Sections=undefined;
  getSectionsSubscription:Subscription;
  getSectionsBehaviourSub= new BehaviorSubject(undefined);
  getSections = (MainAndSubSectionkeys: AngularFirestoreDocument<MainSectionGroup>) => {
    if(this.getSectionsSubscription !== undefined){
      this.getSectionsSubscription.unsubscribe();
    }
    this.getSectionsSubscription= MainAndSubSectionkeys.valueChanges().subscribe((val: any) => {
      if(val === undefined){       
        this.getSectionsBehaviourSub.next(undefined);
      }else{
        if(!Object.keys(val.MainSection).length === true){
          this.getSectionsBehaviourSub.next(undefined);
        }else{ 
          if(val.MainSection !== undefined){
            this.getSectionsBehaviourSub.next(val.MainSection);
          }
        }
      }     
    });
    return this.getSectionsBehaviourSub;
  };

  SectionTc=undefined;
  getTestcasesSubscription:Subscription;
  getTestcasesBehaviourSub= new BehaviorSubject(undefined);
  getTestcases = (TestcaseList: AngularFirestoreDocument<TestcaseInfo>) => {    
    if(this.getTestcasesSubscription !== undefined){
      this.getTestcasesSubscription.unsubscribe();
    }
    this.getTestcasesSubscription= TestcaseList.valueChanges().subscribe((val: any) => {
      let arrayeverse=val;   
      if(val === undefined){       
        arrayeverse= undefined;
      }else{
        if(!Object.keys(val.testcase).length === true){
          arrayeverse= undefined;
        }else{ 
          if(val.testcase !== undefined){ 
          arrayeverse= (val.testcase).reverse();
          }else{
            arrayeverse= undefined;
          }            
        }
      }
      this.getTestcasesBehaviourSub.next(arrayeverse);
    });

    return this.getTestcasesBehaviourSub;
  };

  publicList=undefined;
  getPublicListSubscription:Subscription;
  getPublicListBehaviourSub= new BehaviorSubject(undefined);
  getPublicList = (publicProjects: AngularFirestoreDocument<any>) => {
    if(this.getPublicListSubscription !== undefined){
      this.getPublicListSubscription.unsubscribe();
    }
    this.getPublicListSubscription= publicProjects.valueChanges().subscribe((val: any) => {
      if(val === undefined){
        this.getPublicListBehaviourSub.next(undefined);
      }else{
        if(!Object.keys(val.public).length === true){
          this.getPublicListBehaviourSub.next(undefined);
        }else{ 
          if(val.public !== undefined){         
          this.getPublicListBehaviourSub.next(val.public);
          }
        }
      }     
    });
    return this.getPublicListBehaviourSub;
  };

  privateList=undefined;
  getPrivateListSubscription:Subscription;
  getPrivateListBehaviourSub= new BehaviorSubject(undefined);
  getPrivateList = (privateProjects: AngularFirestoreDocument<any>) => {
    if(this.getPrivateListSubscription !== undefined){
      this.getPrivateListSubscription.unsubscribe();
    }
    this.getPrivateListSubscription= privateProjects.valueChanges().subscribe((val: any) => {
      if(val === undefined){
        this.getPrivateListBehaviourSub.next(undefined);
      }else{
        if(!Object.keys(val.ownerRecord).length === true){
          this.getPrivateListBehaviourSub.next(undefined);
        }else{ 
          if(val.ownerRecord !== undefined){   
            this.getPrivateListBehaviourSub.next(val.ownerRecord);
          }
        }
      }     
    });
    return this.getPrivateListBehaviourSub;
  };

  privateMain=undefined;  
  getPrivateSectionsSubscription:Subscription;
  getPrivateSectionsBehaviourSub= new BehaviorSubject(undefined);
  getPrivateSections = (MainAndSubSectionPrivatekeys: AngularFirestoreDocument<MainSectionGroup>) => {
    if(this.getPrivateSectionsSubscription !== undefined){
      this.getPrivateSectionsSubscription.unsubscribe();
    }
    this.getPrivateSectionsSubscription= MainAndSubSectionPrivatekeys.valueChanges().subscribe((val: any) => {
        if(val === undefined){
          this.myuserProfile.mainsubsectionKeys=[];
          this.getPrivateSectionsBehaviourSub.next(undefined);
        }else{
          if(!Object.keys(val.MainSection).length === true){
            this.myuserProfile.mainsubsectionKeys=[];
            this.getPrivateSectionsBehaviourSub.next(undefined);
          }else{ 
          if(val.MainSection !== undefined){
            this.myuserProfile.keysReadFromDb= val.MainSection;
            this.myuserProfile.mainsubsectionKeys=[];
            this.myuserProfile.keysReadFromDb?.forEach(eachMainfield=>{
                this.myuserProfile.mainsubsectionKeys.push(eachMainfield.name);          
              });         
            }            
            this.getPrivateSectionsBehaviourSub.next(val.MainSection);
          }       
        }     
    });
    return this.getPrivateSectionsBehaviourSub;
  };

  myprojectSub:projectSub={
    publicprojectControlSub: undefined,
    ownPublicprojectControlSub: undefined,
    editMainsectionGroupSub: undefined,
    editSubsectionGroupSub: undefined,
    loadFirstPageTcSub: undefined,
    loadfirstPageKeysSub: undefined,
  };

  myprojectFlags: projectFlags = {
    testcasesInSubmenu: undefined,//show add or New Testcase based on number of testcases in subsection
    showPaymentpage: undefined,//for expired user-remove it
    firstTestcaseEdit: false,//showditutton
    showEditTcButton: false,
    homeNewProject: false,
    homeCurrentProject: false,
    editDeleteProject: false,
    editModifyProject: undefined,
    editAddMainsec: false,
    editDeleteMainsec: false,
    editVisibility: false,
    editAddSubSec: false,
    editDeleteSubsec: false
  };

  myuserProfile: userProfile = {
    userAuthenObj: undefined,
    projectOwner: undefined,
    projectLocation: undefined,
    projectName: undefined,
    membershipType: undefined,
    endMembershipValidity: undefined,
    keysReadFromDb:[],
    mainsubsectionKeys: [],
    subSectionKeys:[],
    savedisabledval:undefined
  };
  myprojectControls: projectControls = {
    subsectionkeysControl: new FormControl(null, Validators.required),
    testcaseInfoControl: new FormControl(),
    createTestcaseControl: new FormControl(),
    publicprojectControl: new FormControl(null, Validators.required),
    ownPublicprojectControl: new FormControl(null, Validators.required),
    editMainsectionGroup: this.fb.group({
      editMainsectionControl: ''
    }),
    visibilityMainsectionGroup: this.fb.group({
      editVisibilityControl: [{ value: false, disabled: false }]
    }),
    editSubsectionGroup: this.fb.group({
      editSubsectionControl: ''
      
    })
  };
  myprojectVariables: projectVariables = {
    testcaseInfodata: undefined,
    initialMainSection: undefined,
    lastSavedVisibility:false,
    modifiedKeysDb:undefined,
    editProjectkeysSaved: undefined
  }
  @ViewChild('drawer') public sidenav: MatSidenav; 
  constructor(
    public afAuth: AngularFireAuth,
    public developmentservice:UserdataService,
    private db: AngularFirestore,    
    public fb: FormBuilder
    ) {
      this.myauth = this.getObservableauthState(this.afAuth.authState);
      this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
      this.myonlineAfterAuth= this.myonline.pipe(
        switchMap((onlineval:any)=>{
          return this.myauth.pipe(    
            filter(authstat=> authstat !== undefined),        
            map((myauthentication:firebase.User)=> {
              if(myauthentication === null){// loggoff
              }else{ //logged In            
              //read tc
              this.myProfileInfo= this.getProfileInfo(this.db.doc(('myProfile/' + myauthentication.uid)));
              this.myuserProfile.userAuthenObj = myauthentication;
              this.myuserProfile.projectLocation= 'projectList/DemoProjectKey';
              this.loadFirstPageKeys();
              //read keys
              this.loadFirstPageTc();
              //load public
              this.publicList= this.getPublicList(this.db.doc(('/projectList/publicProjects')));
              //load private
              this.privateList= this.getPrivateList(this.db.doc(('/projectList/' + myauthentication.uid)));
              
              this.myprojectSub.publicprojectControlSub= this.myprojectControls.publicprojectControl.valueChanges.pipe(
                map((publicProjectSelected: string) => {
                  //check unique
                  //check not null
                  if(publicProjectSelected !== null){
                    this.myuserProfile.projectName=publicProjectSelected;
                    this.Sections= this.getSections(this.db.doc('/publicProjectKeys/' + publicProjectSelected));
                  }                 
              })).subscribe(success=>{
              });
              this.myprojectSub.ownPublicprojectControlSub= this.myprojectControls.ownPublicprojectControl.valueChanges.pipe(
              map((privateProjectSelected: string) => {
                //check unique
                //check not null
                if(privateProjectSelected !== null){
                  this.privateMain= this.getPrivateSections(this.db.doc('/publicProjectKeys/' + privateProjectSelected));
                }
                
              })).subscribe(success=>{
              });
              this.myprojectSub.editMainsectionGroupSub= this.myprojectControls.editMainsectionGroup.valueChanges.pipe(
            map((editMainSecSelected: any) => {
              if(editMainSecSelected.editMainsectionControl !== null){
                this.myuserProfile.subSectionKeys=[];
                this.myuserProfile.keysReadFromDb.forEach(eachMainfield=>
                  {
                    if(editMainSecSelected.editMainsectionControl !== null){
                      if(editMainSecSelected.editMainsectionControl === eachMainfield.name){
                        this.myuserProfile.savedisabledval=eachMainfield.disabled;
                        this.myprojectControls.visibilityMainsectionGroup.setValue({editVisibilityControl:  this.myuserProfile.savedisabledval});
                        eachMainfield.section.forEach(eachSubfield=>{
                          this.myuserProfile.subSectionKeys.push(eachSubfield.viewvalue);
                        });
                      }
                    }
                    
                  });
                //check unique                  
              }

              })).subscribe(success=>{
              });
              this.myprojectSub.editSubsectionGroupSub= this.myprojectControls.editSubsectionGroup.valueChanges.pipe(
                map((editSubSecSelected: any) => {
                  //check not null
                  if(editSubSecSelected.editSubsectionControl !== null){
                    //check unique                  
                    //Save Value
                  }
  
              })).subscribe(success=>{
              });               
            }
              return onlineval;      
          }),
          
          )
        })        
      );
    }

    loadFirstPageKeys(){
      if(this.myprojectSub.loadfirstPageKeysSub !== undefined){
        this.myprojectSub.loadfirstPageKeysSub.unsubscribe();
      }
      this.myprojectSub.loadfirstPageKeysSub= doc(this.db.firestore.doc('/myProfile/' + this.myuserProfile.userAuthenObj.uid))
      .pipe(take(1),
         map((profileData:any)=>{
        if (profileData.data() !== undefined) {//norecords
          if (new Date(profileData.data().MembershipEnd).valueOf() < new Date().valueOf()) {
            if (profileData.data().MembershipType === 'Demo') {//expired
              this.myuserProfile.projectOwner = false;//cannot add tc
              this.myuserProfile.projectName = 'Demo';
              this.myuserProfile.projectLocation = '/projectList/DemoProjectKey';
              this.myuserProfile.membershipType = 'Demo';
              this.myuserProfile.endMembershipValidity = new Date(profileData.data().MembershipEnd);
              this.myprojectFlags.showPaymentpage = true;// show only payments Page
            } else {//expired member
              const nextMonth: Date = new Date();
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              const newItem = {
                MembershipEnd: nextMonth.toDateString(),
                MembershipType: 'Demo',
                projectLocation: '/projectList/DemoProjectKey',
                projectOwner: true,
                projectName: 'Demo'
              };
              this.db.doc<any>('myProfile/' + this.myuserProfile.userAuthenObj.uid).set(newItem);
              this.myuserProfile.projectOwner = true;
              this.myuserProfile.projectName = 'Demo';
              this.myuserProfile.projectLocation = '/projectList/DemoProjectKey';
              this.myuserProfile.membershipType = 'Demo';
              this.myuserProfile.endMembershipValidity = new Date(nextMonth.toDateString());
              this.myprojectFlags.showPaymentpage = false;
            }  
          } else {//start normal
            this.myuserProfile.projectName = profileData.data().projectName;
            this.myuserProfile.projectOwner = profileData.data().projectOwner;
            this.myuserProfile.projectLocation = profileData.data().projectLocation;
            this.myuserProfile.membershipType = profileData.data().MembershipType;
            this.myuserProfile.endMembershipValidity = new Date(profileData.data().MembershipEnd);
            this.myprojectFlags.showPaymentpage = false;
          }//end normal
        }//end demo/Member        
      this.Sections= this.getSections(this.db.doc(this.myuserProfile.projectLocation));
      })//end map-profileData
      ).subscribe(_=>{

      });
    }
    loadFirstPageTc(){
      let localProjectLocation = '';
      if(this.myprojectSub.loadFirstPageTcSub !== undefined){
        this.myprojectSub.loadFirstPageTcSub.unsubscribe();
      }
      this.myprojectSub.loadFirstPageTcSub= this.myprojectControls.subsectionkeysControl.valueChanges
      .pipe(startWith({value: '', groupValue: ''}),
        map((selection:any)=>{
        if(!selection || selection.groupValue === ''){
          this.myprojectVariables.initialMainSection='SubSection';
          this.SectionTc=null;
        }else{
          this.myprojectVariables.initialMainSection=selection.groupValue;
         
          if (this.myuserProfile.projectName === 'Demo' ) {
            localProjectLocation = 'projectList/' + this.myuserProfile.userAuthenObj.uid;
          } else {
            localProjectLocation = '/' + this.myuserProfile.projectName + '/' + selection.groupValue + '/items/' + selection.value;
          }  
          this.SectionTc = this.getTestcases(this.db.doc(localProjectLocation));
        }
       
      })
        
      ).subscribe(_=>{
  
      });
    }
    ngOnInit() {
    }
    componentLogOff() {
      this.myprojectSub.loadfirstPageKeysSub?.unsubscribe();
      this.myprojectSub.loadFirstPageTcSub?.unsubscribe();
      this.getPublicListSubscription?.unsubscribe();
      this.getPublicListBehaviourSub?.complete();
      this.getPrivateSectionsSubscription?.unsubscribe();
      this.getPrivateSectionsBehaviourSub?.complete();
      this.getPrivateListSubscription?.unsubscribe();
      this.getPrivateListBehaviourSub?.complete();
      this.getSectionsSubscription?.unsubscribe();
      this.getSectionsBehaviourSub?.complete();
      this.getTestcasesSubscription?.unsubscribe();
      this.getTestcasesBehaviourSub?.complete();
      this.getProfileInfoSubscription?.unsubscribe();
      this.getProfileInfoBehaviourSub?.complete();     
      this.developmentservice.logout();
}
draweropen(){

}

drawerclose() {
  //this.myprojectVariables.mainsecsubsecSub.unsubscribe();
  this.sidenav.close();
}
}

//Project Flow
/*
User sees a key/value according to his type-> demo/Member/Expired/Guest
User points To a key/Value from DB
User selects a DB operation
Updated DB State shown to the User
*/