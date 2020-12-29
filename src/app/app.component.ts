import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { projectSub, myusrinfo, projectVariables, projectControls, UserdataService, MainSectionGroup, TestcaseInfo, userProfile, projectFlags } from './service/userdata.service';
import { map, switchMap, filter, startWith } from 'rxjs/operators';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'StepsWise Tool';

  myonline = undefined;
  subjectonline = new BehaviorSubject(undefined);
  getObservableonlineSub: Subscription;
  getObservableonine = (localonline: Observable<boolean>) => {
    this.getObservableonlineSub?.unsubscribe();
    this.getObservableonlineSub = localonline.subscribe((valOnline: any) => {
      this.subjectonline.next(valOnline);
    });
    return this.subjectonline;
  };

  myauth = undefined;
  subjectauth = new BehaviorSubject(undefined);
  getObservableauthStateSub: Subscription;
  getObservableauthState = (authdetails: Observable<firebase.User>) => {

    if (this.getObservableauthStateSub !== undefined) {
      this.getObservableauthStateSub.unsubscribe();
    }
    this.getObservableauthStateSub = authdetails.subscribe((val: any) => {
      this.subjectauth.next(val);
    });
    return this.subjectauth;
  };

  AfterOnlineAfterAuthmyProfileReady = undefined;

  //myProfileInfo = undefined;
  getProfileInfoBehaviourSub = new BehaviorSubject(undefined);
  getProfileInfoSubscription: Subscription;
  getProfileInfo = (ProfileInfoDoc: AngularFirestoreDocument<myusrinfo>) => {
    if (this.getProfileInfoSubscription !== undefined) {
      this.getProfileInfoSubscription.unsubscribe();
    }
    this.getProfileInfoSubscription = ProfileInfoDoc.valueChanges().subscribe(async (val: myusrinfo) => {
      if (val === undefined) {
        const documentExist = await this.developmentservice.docExists();//Demo keys read
        if (documentExist !== undefined) {
          const nextMonth: Date = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const newItem = {
            MembershipEnd: nextMonth.toDateString(),
            MembershipType: 'Demo',
            projectLocation: '/projectList/DemoProjectKey',
            projectOwner: true,
            projectName: 'Demo'
          };
          this.db.doc<any>('myProfile/' + this.myuserProfile.userAuthenObj.uid).set(newItem).then(success => {
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
        } else {
          alert('Check Connection');
          location.reload();
        }
        this.getSectionsBehaviourSub.next(undefined);
      }
      this.getProfileInfoBehaviourSub.next(val);
    });
    return this.getProfileInfoBehaviourSub;
  };

  Sections = undefined;
  getSectionsSubscription: Subscription;
  getSectionsBehaviourSub = new BehaviorSubject(undefined);
  getSections = (MainAndSubSectionkeys: AngularFirestoreDocument<MainSectionGroup>) => {
    if (this.getSectionsSubscription !== undefined) {
      this.getSectionsSubscription.unsubscribe();
    }
    this.getSectionsSubscription = MainAndSubSectionkeys.valueChanges().subscribe((val: any) => {
      if (val === undefined) {
        this.getSectionsBehaviourSub.next(undefined);
      } else {
        if (!Object.keys(val.MainSection).length === true) {
          this.getSectionsBehaviourSub.next(undefined);
        } else {
          if (val.MainSection !== undefined) {
            this.getSectionsBehaviourSub.next(val.MainSection);
          }
        }
      }
    });
    return this.getSectionsBehaviourSub;
  };

  SectionTc = undefined;
  getTestcasesSubscription: Subscription;
  getTestcasesBehaviourSub = new BehaviorSubject(undefined);
  getTestcases = (TestcaseList: AngularFirestoreDocument<TestcaseInfo>) => {
    if (this.getTestcasesSubscription !== undefined) {
      this.getTestcasesSubscription.unsubscribe();
    }
    this.getTestcasesSubscription = TestcaseList.valueChanges().subscribe((val: any) => {
      let arrayeverse = val;
      if (val === undefined) {
        arrayeverse = undefined;
      } else {
        if (!Object.keys(val.testcase).length === true) {
          arrayeverse = undefined;
        } else {
          if (val.testcase !== undefined) {
            arrayeverse = (val.testcase);
            this.myprojectVariables.testcaseslength = arrayeverse.length;
          } else {
            arrayeverse = undefined;
          }
        }
      }
      this.getTestcasesBehaviourSub.next(arrayeverse);
    });

    return this.getTestcasesBehaviourSub;
  };

  publicList = undefined;
  localpublicList: string[] = [];
  getPublicListSubscription: Subscription;
  getPublicListBehaviourSub = new BehaviorSubject(undefined);
  getPublicList = (publicProjects: AngularFirestoreDocument<any>) => {
    if (this.getPublicListSubscription !== undefined) {
      this.getPublicListSubscription.unsubscribe();
    }
    this.getPublicListSubscription = publicProjects.valueChanges().subscribe((val: any) => {
      if (val === undefined) {
        this.getPublicListBehaviourSub.next(undefined);
      } else {
        if (val.public === undefined || !Object.keys(val.public).length === true) {
          this.getPublicListBehaviourSub.next(undefined);
        } else {
          if (val.public !== undefined) {
            this.localpublicList = val.public;
            this.getPublicListBehaviourSub.next(val.public);
          }
        }
      }
    });
    return this.getPublicListBehaviourSub;
  };

  privateList = undefined;
  localprivateList: string[] = [];
  getPrivateListSubscription: Subscription;
  getPrivateListBehaviourSub = new BehaviorSubject(undefined);
  getPrivateList = (privateProjects: AngularFirestoreDocument<any>) => {
    if (this.getPrivateListSubscription !== undefined) {
      this.getPrivateListSubscription.unsubscribe();
    }
    this.getPrivateListSubscription = privateProjects.valueChanges().subscribe((val: any) => {
      if (val === undefined) {
        this.getPrivateListBehaviourSub.next(undefined);
      } else {
        if (val.ownerRecord === undefined || !Object.keys(val.ownerRecord).length === true) {
          //3 types of response
          //1. no doc uid in projectList Collection-> returns undefined
          //2. doc is there with testcase field and no ownerRecord field-> val.ownerRecord returns undefined
          //3.doc/ownerRecord field is there with empty array of private projects-> objectCheck Length will be false

          this.getPrivateListBehaviourSub.next(undefined);
        } else {
          if (val.ownerRecord !== undefined) {
            this.localprivateList = val.ownerRecord;
            this.getPrivateListBehaviourSub.next(val.ownerRecord);
          }
        }
      }
    });
    return this.getPrivateListBehaviourSub;
  };

  privateSection = undefined;
  getPrivateSectionsSubscription: Subscription;
  getPrivateSectionsBehaviourSub = new BehaviorSubject(undefined);
  getPrivateSections = (MainAndSubSectionPrivatekeys: AngularFirestoreDocument<MainSectionGroup>) => {
    if (this.getPrivateSectionsSubscription !== undefined) {
      this.getPrivateSectionsSubscription.unsubscribe();
    }
    this.getPrivateSectionsSubscription = MainAndSubSectionPrivatekeys.valueChanges().subscribe((val: any) => {
      if (val === undefined) {
        this.myuserProfile.mainsubsectionKeys = [];
        this.myuserProfile.keysReadFromDb=[];
        this.developmentservice.sendValueAdd(false);
        this.developmentservice.sendValueDel(false);
        this.developmentservice.sendValueUpdate(false);
        this.myprojectControls.visibilityMainsectionGroup.reset();
        this.myprojectControls.editSubsectionGroup.reset();
        this.myprojectControls.editSubsectionGroup.disable();
        console.log('214',this.myuserProfile.keysReadFromDb);
        this.getPrivateSectionsBehaviourSub.next(undefined);
      } else {
        if (!Object.keys(val.MainSection).length === true) {
          this.myuserProfile.keysReadFromDb=[];
          this.developmentservice.sendValueAdd(false);
          this.developmentservice.sendValueDel(false);
          this.developmentservice.sendValueUpdate(false);
          this.myprojectControls.visibilityMainsectionGroup.reset();
          this.myprojectControls.editSubsectionGroup.reset();
          this.myprojectControls.editSubsectionGroup.disable();
          this.myuserProfile.mainsubsectionKeys = [];
          console.log('225',this.myuserProfile.keysReadFromDb);
          this.getPrivateSectionsBehaviourSub.next(undefined);
        } else {
          if (val.MainSection !== undefined) {
            this.myuserProfile.keysReadFromDb = val.MainSection;
            this.myuserProfile.mainsubsectionKeys = [];
            this.myuserProfile.keysReadFromDb?.forEach(eachMainfield => {
              this.myuserProfile.mainsubsectionKeys.push(eachMainfield.name);
            });
            this.myprojectControls.editMainsectionGroup.setValue({ editMainsectionControl: '' });
            
          }
          console.log('229',this.myuserProfile.keysReadFromDb);
          this.developmentservice.sendValueAdd(false);
          this.developmentservice.sendValueDel(false);
          this.developmentservice.sendValueUpdate(false);
          this.myprojectControls.visibilityMainsectionGroup.reset();
          this.myprojectControls.editSubsectionGroup.reset();
          this.myprojectControls.editSubsectionGroup.disable();
          this.getPrivateSectionsBehaviourSub.next(val.MainSection);
        }
      }
    });
    
    return this.getPrivateSectionsBehaviourSub;
  };

  myprojectSub: projectSub = {
    openeditSub: undefined,
    NewTaskControlSub: undefined,
    ownPublicprojectControlSub: undefined,
    editMainsectionGroupSub: undefined,
    editSubsectionGroupSub: undefined,
    loadFirstPageTcSub: undefined,
    loadfirstPageKeysSub: undefined,
    visibilityMainsectionGroupSub: undefined
  };

  myprojectFlags: projectFlags = {
    testcasesInSubmenu: undefined,//show add or New Testcase based on number of testcases in subsection
    showPaymentpage: undefined,//for expired user-remove it
    firstTestcaseEdit: false,//showditutton
    showEditTcButton: false,
    homeNewProject: false,
    homeDeleteProject: false,
    homeCurrentProject: false,
    editModifyProject: undefined,
    editAddMainsec: undefined,
    editDeleteMainsec: undefined,
    editVisibility: undefined,
    editAddSubSec: undefined,
    editDeleteSubsec: undefined,
    editAddProject: undefined,
    editDeleteProject: undefined,
    editUpdateProject: undefined,
  };

  myuserProfile: userProfile = {
    userAuthenObj: undefined,
    projectOwner: undefined,
    projectLocation: undefined,
    projectName: undefined,
    membershipType: undefined,
    endMembershipValidity: undefined,
    keysReadFromDb: [],
    mainsubsectionKeys: [],
    subSectionKeys: [],
    savedisabledval: undefined,
    savesubSectionKeys: undefined,
    savedMainSectionKey: undefined
  };
  myprojectControls: projectControls = {
    subsectionkeysControl: new FormControl(null, Validators.required),
    testcaseInfoControl: new FormControl(),
    createTestcaseControl: new FormControl(),
    publicprojectControl: new FormControl(null, Validators.required),
    ownPublicprojectControl: new FormControl(null, Validators.required),
    firstMainSecControl: new FormControl(null, Validators.required),
    editMainsectionGroup: this.fb.group({
      editMainsectionControl: [{ value: '' }, Validators.required]
    }),
    visibilityMainsectionGroup: this.fb.group({
      editVisibilityControl: [{ value: false, disabled: false }, Validators.required]
    }),
    editSubsectionGroup: this.fb.group({
      editSubsectionControl: [{ value: '' }]

    })
  };
  myprojectVariables: projectVariables = {
    testcaseInfodata: undefined,
    testcaseslength: 0,
    publicProjectHint: '',
    publicProjectHome: undefined,
    privateTaskMainEdit: undefined,
    privateTaskSubEdit: undefined,
    viewSelectedTestcase: undefined,
    initialMainSection: undefined,
    lastSavedVisibility: false,
    modifiedKeysDb: undefined,
    editProjectkeysSaved: undefined
  }
  @ViewChild('drawer') public sidenav: MatSidenav;
  myvalAfterPrivate=undefined;
  AfterOnlineCheckAuth = undefined;
  myhint='';
  constructor(
    public afAuth: AngularFireAuth,
    public developmentservice: UserdataService,
    private db: AngularFirestore,
    public fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.myauth = this.getObservableauthState(this.afAuth.authState);
    this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
    this.AfterOnlineCheckAuth = this.myonline.pipe(
      filter(offline => offline !== false),
      switchMap((onlineval: any) => {
        return this.myauth.pipe(
          filter(authstat => authstat !== undefined),
          filter(authstat => authstat === null),//only logged off case
          map((afterauth: any) => {
            return true;
          })
        )
      })
    );

    this.AfterOnlineAfterAuthmyProfileReady = this.myonline.pipe(
      filter(offline => offline !== false),//all online values will pass
      switchMap((onlineval: any) => {
        return this.myauth.pipe(
          filter(authstat => authstat !== undefined),
          filter(authstat => authstat !== null),//only logged in case
          switchMap((myauthentication: firebase.User) => {
            //loggedin
            //read tc
            this.myuserProfile.userAuthenObj = myauthentication;
            this.loadFirstPageTc();
            //load public
            this.publicList = this.getPublicList(this.db.doc(('/projectList/publicProjects')));
            //load private
            this.privateList = this.getPrivateList(this.db.doc(('/projectList/' + myauthentication.uid)));
            this.myprojectSub.NewTaskControlSub = this.myprojectControls.createTestcaseControl.valueChanges.pipe(
              map((NewTaskAdded: string) => {
                //check unique
                //check not null
                if (NewTaskAdded !== null) {
                  //this.myuserProfile.projectName = NewTaskAdded;
                  //backend Create new Task
                }
              })).subscribe(success => {
              });
            this.myprojectVariables.publicProjectHome = this.myprojectControls.publicprojectControl.valueChanges.pipe(
              startWith(''),
              filter(filternull => filternull !== null),//not null case will go
              map((publicProjectSelected: string) => {

                if (publicProjectSelected !== '') {
                  const filteredlist = this.localpublicList.filter((option => option.toLowerCase().includes(publicProjectSelected.toLowerCase())));
                  const uniqueinlist = this.localpublicList.filter(publicproj => (publicproj.toLowerCase().localeCompare(publicProjectSelected.toLowerCase()) === 0));
                  const isOnwnerCheck = this.localprivateList.filter(privateproj => (privateproj.toLowerCase().localeCompare(publicProjectSelected.toLowerCase()) === 0));

                  if (uniqueinlist.length > 0) {
                    if (isOnwnerCheck.length > 0) {
                      this.myprojectFlags.homeDeleteProject = true;
                    } else {
                      this.myprojectFlags.homeDeleteProject = false;
                    }
                    this.myprojectFlags.homeNewProject = false;

                    if (this.myuserProfile.projectName === publicProjectSelected) {
                      this.myprojectVariables.publicProjectHint = 'Already Current Project';
                      this.myprojectFlags.homeCurrentProject = false;
                    } else {
                      this.myprojectVariables.publicProjectHint = '';
                      this.myprojectFlags.homeCurrentProject = true;
                    }
                  } else {
                    if (this.myuserProfile.membershipType === 'Demo') {
                      this.myprojectFlags.homeNewProject = false;
                    } else {
                      this.myprojectFlags.homeNewProject = true;
                    }
                    this.myprojectFlags.homeCurrentProject = false;
                    this.myprojectFlags.homeDeleteProject = false;
                    this.myprojectVariables.publicProjectHint = '';

                  }
                  return filteredlist;
                } else {
                  this.myprojectVariables.publicProjectHint = 'Select Task from List';
                  return this.localpublicList;
                }
              }));

            this.myprojectSub.ownPublicprojectControlSub = this.myprojectControls.ownPublicprojectControl.valueChanges.pipe(
              filter(checkreset => checkreset !== undefined),
              map((privateProjectSelected: string) => {
                if (privateProjectSelected !== null) {
                  this.privateSection = this.getPrivateSections(this.db.doc('/publicProjectKeys/' + privateProjectSelected));
                  this.myprojectControls.editSubsectionGroup.disable();
                  this.myprojectControls.visibilityMainsectionGroup.disable();
                  this.saveCurrPrivateProject();                  
                }
              })).subscribe(success => {
              });
            //Main  
            this.myprojectVariables.privateTaskMainEdit = this.myprojectControls.editMainsectionGroup.valueChanges.pipe(
              filter(checkreset => checkreset !== undefined),
              startWith({ editMainsectionControl: '' }),
              map((editMainSecSelected: any) => {
                //console.log('410',editMainSecSelected.editMainsectionControl);
                if (editMainSecSelected.editMainsectionControl !== null && editMainSecSelected.editMainsectionControl !== '') {
                  this.myuserProfile.subSectionKeys = [];
                  this.myuserProfile.savedMainSectionKey=editMainSecSelected.editMainsectionControl;
                  this.myuserProfile.keysReadFromDb.forEach(eachMainfield => {
                    if (editMainSecSelected.editMainsectionControl !== null) {

                      if (editMainSecSelected.editMainsectionControl === eachMainfield.name) {
                        this.myuserProfile.savedisabledval = eachMainfield.disabled;
                        this.myprojectControls.visibilityMainsectionGroup.setValue({ editVisibilityControl: this.myuserProfile.savedisabledval });
                        eachMainfield.section.forEach(eachSubfield => {
                          this.myuserProfile.subSectionKeys.push(eachSubfield.viewvalue);
                          this.myuserProfile.savesubSectionKeys=this.myuserProfile.subSectionKeys;
                          ////console.log('419',this.myuserProfile.subSectionKeys);
                        });
                      } else {

                      }

                    }
                  });
                  const userselection = editMainSecSelected.editMainsectionControl;
                  const filteredlist = this.myuserProfile.mainsubsectionKeys.filter((option => option.toLowerCase().includes(userselection.toLowerCase())));
                  const uniqueinlist = this.myuserProfile.mainsubsectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare(userselection.toLowerCase()) === 0));
                  if(uniqueinlist.length > 0){
                    this.myprojectControls.visibilityMainsectionGroup.enable();
                    this.developmentservice.sendValueAdd(false);
                    this.myprojectControls.editSubsectionGroup.enable();
                  }else{
                    this.developmentservice.sendValueAdd(false);
                    this.developmentservice.sendValueDel(false);
                    this.developmentservice.sendValueUpdate(false);
                    this.myprojectControls.visibilityMainsectionGroup.reset();
                    this.myprojectControls.editSubsectionGroup.reset();
                    this.myprojectControls.editSubsectionGroup.disable();

                  }
                  this.myprojectControls.editSubsectionGroup.reset();
                  return filteredlist;
                } else {
                  this.myuserProfile.subSectionKeys = [];
                  this.developmentservice.sendValueDel(false);
                  this.developmentservice.sendValueAdd(false);
                  this.developmentservice.sendValueUpdate(false);
                  this.myprojectControls.editSubsectionGroup.reset();
                  this.myprojectControls.visibilityMainsectionGroup.reset();
                  //console.log('init-452',this.myuserProfile.mainsubsectionKeys);
                  return this.myuserProfile.mainsubsectionKeys;
                }
              }));
            //Visi  
            this.myprojectSub.visibilityMainsectionGroupSub = this.myprojectControls.visibilityMainsectionGroup.valueChanges.subscribe(selectedvisibility => {
              //console.log('459',selectedvisibility);
              if (!selectedvisibility || selectedvisibility.editVisibilityControl !== null ) {
                if(this.myuserProfile.savedMainSectionKey !== undefined){
                  const filteredlist = this.myuserProfile.mainsubsectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare((this.myuserProfile.savedMainSectionKey).toLowerCase()) === 0));
                  if (filteredlist.length > 0) {
                    if(selectedvisibility.editVisibilityControl === this.myuserProfile.savedisabledval){    
                      console.log('466',filteredlist.length);                 
                      this.developmentservice.sendValueDel(true);
                      this.developmentservice.sendValueAdd(false);
                      this.developmentservice.sendValueUpdate(false);
                      this.myprojectControls.editSubsectionGroup.enable();
                      
                    }else{
                      this.developmentservice.sendValueDel(false);
                      this.developmentservice.sendValueAdd(false);
                      //console.log('reachedhere');
                      this.developmentservice.sendValueUpdate(true);
                      this.myprojectControls.editSubsectionGroup.reset();
                      this.myprojectControls.editSubsectionGroup.disable();

                    }
                   
                  }else{
                    const filteredlist = this.myuserProfile.mainsubsectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare((this.myuserProfile.savedMainSectionKey).toLowerCase()) === 0));
                  if (filteredlist.length > 0) {
                  }else{
                    this.developmentservice.sendValueAdd(true);
                  }
                  }
                }else{
                  this.developmentservice.sendValueDel(false);                  
                }

              }else{
                this.developmentservice.sendValueUpdate(false);
              }
            });
            //Sub
            this.myprojectVariables.privateTaskSubEdit = this.myprojectControls.editSubsectionGroup.valueChanges.pipe(
              filter(checkreset => checkreset.editSubsectionControl !== undefined),
              startWith({ editSubsectionControl: '' }), 
              map((editSubSecSelected: any) => {
                //check not null
                if (editSubSecSelected.editSubsectionControl !== null && editSubSecSelected.editSubsectionControl !== '') {
                  const userselection = editSubSecSelected.editSubsectionControl;
                  const filteredlist = this.myuserProfile.subSectionKeys.filter((option => option.toLowerCase().includes(userselection.toLowerCase())));
                  const uniqueinlist = this.myuserProfile.subSectionKeys.filter(publicproj => (publicproj.toLowerCase().localeCompare(userselection.toLowerCase()) === 0));
                  if (uniqueinlist.length > 0) {
                    this.developmentservice.sendValueAdd(false);
                    this.developmentservice.sendValueDel(true);
                    this.myhint="Delete Sub-Section Now!"
                  } else {
                    this.developmentservice.sendValueAdd(true);
                    this.developmentservice.sendValueDel(false);
                    this.myhint="Add Sub-Section Now!"
                  }
                  
                  return filteredlist;
                } else {
                  this.myhint=""
                  return this.myuserProfile.subSectionKeys;
                }
              }));
            this.myprojectControls.firstMainSecControl.valueChanges.subscribe(firstmainsec=>{
            
            });
            return this.getProfileInfo(this.db.doc('myProfile/' + myauthentication.uid)).pipe(
              map((profileval: any) => {
                this.myuserProfile.projectLocation = 'projectList/DemoProjectKey';
                this.loadFirstPageKeys(profileval);
                return onlineval;
              })
            );

          }),
        )
      })
    );
  }
  NewMain(){
    const ownproj=this.myprojectControls.ownPublicprojectControl.value;
    const newName=this.myprojectControls.firstMainSecControl.value;
    //console.log('543',ownproj,newName);
    let SubSecArr=[];
    SubSecArr.push({name:newName, disabled: false, section:[] });
    this.myprojectVariables.editProjectkeysSaved=SubSecArr;
    this.developmentservice.addMainSection(ownproj, this.myprojectVariables.editProjectkeysSaved).then(success=>{
      this.getPrivateSectionsBehaviourSub.complete();
      //this.myprojectControls.editSubsectionGroup.disable();
      //this.myprojectControls.visibilityMainsectionGroup.disable();
      //this.myprojectControls.editMainsectionGroup.reset();
      //this.privateSection = this.getPrivateSections(this.db.doc('/publicProjectKeys/' + ownproj));        
    });

  }
  EditAdd() {
    const ownproj=this.myprojectControls.ownPublicprojectControl.value;
    const mainval= this.myprojectControls.editMainsectionGroup.controls['editMainsectionControl'].value;
    const disabledval= this.myprojectControls.visibilityMainsectionGroup.controls['editVisibilityControl'].value;
    const subval= this.myprojectControls.editSubsectionGroup.controls['editSubsectionControl'].value;
    if(this.myhint !== ''){
      let SubSecArr= this.myuserProfile.keysReadFromDb;
      SubSecArr.forEach(eachMainfield=>
        {
          if(eachMainfield.name === mainval){
            const subsecObj={ viewvalue: subval };
            eachMainfield.section.push(subsecObj);
          }        
        });
      this.myprojectVariables.editProjectkeysSaved=SubSecArr;
      this.developmentservice.addSubSection(ownproj, mainval, subval, this.myprojectVariables.editProjectkeysSaved).then(success=>{
        this.getPrivateSectionsBehaviourSub.complete();
        this.myprojectControls.editSubsectionGroup.disable();
        this.myprojectControls.visibilityMainsectionGroup.disable();
        this.myprojectControls.editMainsectionGroup.reset();
        this.privateSection = this.getPrivateSections(this.db.doc('/publicProjectKeys/' + ownproj));        

      });
    }else{
      let SubSecArr= this.myuserProfile.keysReadFromDb;
      SubSecArr.push({name:mainval, disabled: disabledval, section:[] });
      this.myprojectVariables.editProjectkeysSaved=SubSecArr;
      this.developmentservice.addMainSection(ownproj, this.myprojectVariables.editProjectkeysSaved).then(success=>{
        this.getPrivateSectionsBehaviourSub.complete();
        this.myprojectControls.editSubsectionGroup.disable();
        this.myprojectControls.visibilityMainsectionGroup.disable();
        this.myprojectControls.editMainsectionGroup.reset();
        this.privateSection = this.getPrivateSections(this.db.doc('/publicProjectKeys/' + ownproj));        
      });
    }
  }

  EditDelete() {
    const ownproj=this.myprojectControls.ownPublicprojectControl.value;
    const mainval= this.myprojectControls.editMainsectionGroup.controls['editMainsectionControl'].value;
    const disabledval= this.myprojectControls.visibilityMainsectionGroup.controls['editVisibilityControl'].value;
    const subval= this.myprojectControls.editSubsectionGroup.controls['editSubsectionControl'].value;
    
    if(this.myhint !== ''){
      //console.log('subsec-del',ownproj,mainval,disabledval,subval );
      let SubSecArr= this.myuserProfile.keysReadFromDb;;
      SubSecArr.forEach(eachMainfield=>
        {
          if(eachMainfield.name === mainval ){         
            eachMainfield.section= eachMainfield.section.filter(mysubsec=> mysubsec.viewvalue !== subval );
          }        
        });
        this.myprojectVariables.editProjectkeysSaved=SubSecArr;
        this.developmentservice.addSubSection(ownproj, mainval, subval, this.myprojectVariables.editProjectkeysSaved).then(success=>{
          this.getPrivateSectionsBehaviourSub.complete();
          
          //this.myprojectControls.editSubsectionGroup.disable();
          //this.myprojectControls.visibilityMainsectionGroup.disable();
          //this.myprojectControls.editMainsectionGroup.reset();
          this.privateSection = this.getPrivateSections(this.db.doc('/publicProjectKeys/' + ownproj));        
        
        });
    }else{
      //console.log('mainsec-del',ownproj,mainval,disabledval,subval);
      let SubSecArr= this.myuserProfile.keysReadFromDb;
      SubSecArr= SubSecArr.filter(mymainkeys=> mymainkeys.name !== mainval);
      this.myprojectVariables.editProjectkeysSaved=SubSecArr;
      this.developmentservice.deleteMainSection(ownproj, this.myprojectVariables.editProjectkeysSaved).then(success=>{
        this.getPrivateSectionsBehaviourSub.complete();
        //this.myprojectControls.editSubsectionGroup.disable();
        //this.myprojectControls.visibilityMainsectionGroup.disable();
        this.myprojectControls.editMainsectionGroup.reset();
        this.privateSection = this.getPrivateSections(this.db.doc('/publicProjectKeys/' + ownproj));        
      
      });
    }
  }
  EditUpdate() {
    const ownproj=this.myprojectControls.ownPublicprojectControl.value;
    const mainval= this.myprojectControls.editMainsectionGroup.controls['editMainsectionControl'].value;
    const disabledval= this.myprojectControls.visibilityMainsectionGroup.controls['editVisibilityControl'].value;
    const subval= this.myprojectControls.editSubsectionGroup.controls['editSubsectionControl'].value;
    //console.log('mainsec-update',ownproj,mainval,disabledval,subval)
    let SubSecArr= this.myuserProfile.keysReadFromDb;
    SubSecArr.forEach(eachMainfield=>
      {
        if(eachMainfield.name === mainval){
          eachMainfield.disabled= disabledval;
        }        
      });
    this.myprojectVariables.editProjectkeysSaved=SubSecArr;
    this.developmentservice.updatevisibility(ownproj, this.myprojectVariables.editProjectkeysSaved).then(success=>{
      this.getPrivateSectionsBehaviourSub.complete();
      this.myprojectControls.editSubsectionGroup.disable();
      this.myprojectControls.visibilityMainsectionGroup.disable();
      this.myprojectControls.editMainsectionGroup.reset();
      this.privateSection = this.getPrivateSections(this.db.doc('/publicProjectKeys/' + ownproj));        
    
    });
  }
  saveCurrPrivateProject() {
    const ProjectName = this.myprojectControls.ownPublicprojectControl.value;
    let newItem = {
      projectLocation: '/publicProjectKeys/' + ProjectName,
      projectOwner: true,
      projectName: ProjectName
    };
    this.db.doc<any>('myProfile/' + this.myuserProfile.userAuthenObj.uid).set(newItem,
      { merge: true }).then(success => {
        this.getTestcasesBehaviourSub.next(undefined);
        this.myprojectControls.subsectionkeysControl.reset();
        this.myprojectVariables.testcaseslength = 0;
        this.Sections = this.getSections(this.db.doc('/publicProjectKeys/' + this.myuserProfile.projectName));
        this.myprojectFlags.homeDeleteProject = false;
        this.myprojectFlags.homeNewProject = false;
        this.myprojectFlags.homeCurrentProject = false;
        //this.myprojectControls.publicprojectControl.setValue('');

      });
  }
  saveCurrProject() {
    const ProjectName = this.myprojectControls.publicprojectControl.value;
    let newItem = {
      projectLocation: '/publicProjectKeys/' + ProjectName,
      projectOwner: true,
      projectName: ProjectName
    };
    if (this.myuserProfile.membershipType === 'Demo') {
      newItem.projectOwner = false;
    } else {
      newItem.projectOwner = true;
    }
    this.db.doc<any>('myProfile/' + this.myuserProfile.userAuthenObj.uid).set(newItem,
      { merge: true }).then(success => {
        this.getTestcasesBehaviourSub.next(undefined);
        this.myprojectControls.subsectionkeysControl.reset();
        this.myprojectVariables.testcaseslength = 0;
        this.Sections = this.getSections(this.db.doc('/publicProjectKeys/' + this.myuserProfile.projectName));
        this.myprojectFlags.homeDeleteProject = false;
        this.myprojectFlags.homeNewProject = false;
        this.myprojectFlags.homeCurrentProject = false;
        this.myprojectControls.publicprojectControl.setValue('');
        this.sidenav.close();
      });
  }

  NewProject() {
    const ProjectName = this.myprojectControls.publicprojectControl.value;
    const newKeys = [{
      name: 'MainSection',
      disabled: false,
      section: [{
        viewvalue: 'SubSection'
      }]
    }];
    const newItem = {
      projectLocation: 'publicProjectKeys/' + ProjectName,
      projectOwner: true,
      projectName: ProjectName
    };
    this.developmentservice.createnewproject(this.myuserProfile.userAuthenObj.uid, ProjectName, newItem, newKeys).then(success => {
      this.myprojectFlags.homeDeleteProject = false;
      this.myprojectFlags.homeNewProject = false;
      this.myprojectFlags.homeCurrentProject = false;
      this.myprojectControls.publicprojectControl.setValue('');
      this.sidenav.close();
    });
  }
  DeleteProject() {
    const ProjectName = this.myprojectControls.publicprojectControl.value;
    let r = confirm("Confirm Project Delete?");
    if (r == true) {
      const newItem = {
        projectLocation: 'projectList/DemoProjectKey',
        projectOwner: true,
        projectName: 'Demo'
      };
      this.developmentservice.deleteproject(this.myuserProfile.userAuthenObj.uid, ProjectName, newItem).then(success => {
        this.myprojectFlags.homeDeleteProject = false;
        this.myprojectFlags.homeNewProject = false;
        this.myprojectFlags.homeCurrentProject = false;
        this.myprojectControls.publicprojectControl.setValue('');
        this.sidenav.close();
      });
    }
  }
  loadFirstPageKeys(profileData: any) {
    if (profileData !== undefined) {//norecords
      if (new Date(profileData.MembershipEnd).valueOf() < new Date().valueOf()) {
        if (profileData.MembershipType === 'Demo') {//expired
          this.myuserProfile.projectOwner = false;//cannot add tc
          this.myuserProfile.projectName = 'Demo';
          this.myuserProfile.projectLocation = '/projectList/DemoProjectKey';
          this.myuserProfile.membershipType = 'Demo';
          this.myuserProfile.endMembershipValidity = new Date(profileData.MembershipEnd);
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
        this.myuserProfile.projectName = profileData.projectName;
        this.myuserProfile.projectOwner = profileData.projectOwner;
        this.myuserProfile.projectLocation = profileData.projectLocation;
        this.myuserProfile.membershipType = profileData.MembershipType;
        this.myuserProfile.endMembershipValidity = new Date(profileData.MembershipEnd);
        this.myprojectFlags.showPaymentpage = false;
      }//end normal
      this.Sections = this.getSections(this.db.doc(this.myuserProfile.projectLocation));
    }//end demo/Member        
  }
  loadFirstPageTc() {
    let localProjectLocation = '';
    if (this.myprojectSub.loadFirstPageTcSub !== undefined) {
      this.myprojectSub.loadFirstPageTcSub.unsubscribe();
    }
    this.myprojectSub.loadFirstPageTcSub = this.myprojectControls.subsectionkeysControl.valueChanges
      .pipe(startWith({ value: '', groupValue: '' }),
        map((selection: any) => {
          if (!selection || selection.groupValue === '') {
            this.myprojectVariables.initialMainSection = 'SubSection';
            this.SectionTc = null;
          } else {
            this.myprojectVariables.initialMainSection = selection.groupValue;
            if (this.myuserProfile.projectName === 'Demo') {
              localProjectLocation = 'projectList/' + this.myuserProfile.userAuthenObj.uid;
            } else {
              localProjectLocation = '/' + this.myuserProfile.projectName + '/' + selection.groupValue + '/items/' + selection.value;
            }

            this.SectionTc = this.getTestcases(this.db.doc(localProjectLocation));
          }

        })

      ).subscribe(_ => {

      });
  }
  ngOnInit() {

  }
  componentLogOff() {
    this.myprojectSub.openeditSub?.unsubscribe();
    this.myprojectSub.visibilityMainsectionGroupSub?.unsubscribe();
    this.myprojectSub.NewTaskControlSub?.unsubscribe();
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
  draweropen() {
  }
  drawerclose() {
    this.sidenav.close();
  }
  AddNew() {
    this.myprojectFlags.firstTestcaseEdit = true;
  }
  saveTC() {
    let locationForSave = '';
    if (this.myuserProfile.projectName === 'Demo') {
      locationForSave = '/projectList/' + this.myuserProfile.userAuthenObj.uid;
    } else {
      const userselection = this.myprojectControls.subsectionkeysControl.value;
      //console.log('userselection', userselection);
      locationForSave = this.myuserProfile.projectName + '/' + userselection.groupValue + '/items/' + userselection.value;
    }
    const updateObject: TestcaseInfo = {
      heading: this.myprojectControls.createTestcaseControl.value,//Heading in testcase list
      subHeading: 'Edit SubHeading',//Sub-Heading in testcase list
      description: 'Edit here!',//Description in testcase view
      linktoTest: 'https://www.google.com/'//stackblitzLink in testcase edit/doubleclick
    };
    this.developmentservice.createNewTestcase(locationForSave, updateObject).then(success => {
      this.myprojectFlags.firstTestcaseEdit = false;
      this.myprojectControls?.createTestcaseControl.reset();
      this.myprojectFlags.showEditTcButton = false;
    });

  }
  exitTC() {
    this.myprojectFlags.firstTestcaseEdit = false;
  }
  refreshList(item: TestcaseInfo) {//When user Selects testitem by doubleclick
    this.myprojectFlags.showEditTcButton = true;
    this.myprojectVariables.viewSelectedTestcase = item;//`${item.subHeading}`;
    this.myprojectControls.testcaseInfoControl.setValue(`${item.description}`)
  }
  Delete() {
    let r = confirm("Confirm Tc Delete?");
    if (r == true) {
      let locationForDelete = '';
      if (this.myuserProfile.projectName === 'Demo') {
        locationForDelete = '/projectList/' + this.myuserProfile.userAuthenObj.uid;
      } else {
        const userselection = this.myprojectControls.subsectionkeysControl.value;
        locationForDelete = this.myuserProfile.projectName + '/' + userselection.groupValue + '/items/' + userselection.value;
      }
      this.developmentservice.deleteTestcase(locationForDelete, this.myprojectVariables.viewSelectedTestcase).then(success => {
        const updateObject: TestcaseInfo = {
          heading: this.myprojectControls.createTestcaseControl.value,//Heading in testcase list
          subHeading: 'Edit SubHeading',//Sub-Heading in testcase list
          description: 'Edit here!',//Description in testcase view
          linktoTest: 'https://www.google.com/'//stackblitzLink in testcase edit/doubleclick
        };

        this.myprojectVariables.viewSelectedTestcase = updateObject;
        this.myprojectControls.testcaseInfoControl.setValue(`${updateObject.description}`);
        this.myprojectFlags.showEditTcButton = false;
      });
    } else {
      this.myprojectFlags.showEditTcButton = true;
    }


  }
  openedit() {
    let locationForEdit = '';
    if (this.myuserProfile.projectName === 'Demo') {
      locationForEdit = '/projectList/' + this.myuserProfile.userAuthenObj.uid;
    } else {
      const userselection = this.myprojectControls.subsectionkeysControl.value;
      locationForEdit = this.myuserProfile.projectName + '/' + userselection.groupValue + '/items/' + userselection.value;
    }
    const dialogRef = this.dialog.open(DialogEditTestcase, {
      width: '80vw',
      data: this.myprojectVariables.viewSelectedTestcase,
      disableClose: true
    });
    this.myprojectSub.openeditSub = dialogRef.afterClosed().subscribe(result => {
      if (result !== null) {
        this.myprojectFlags.showEditTcButton = false;
        const updateObject: TestcaseInfo = { ...result };
        this.developmentservice.editTestcase(locationForEdit, this.myprojectVariables.viewSelectedTestcase, updateObject);
        this.myprojectVariables.viewSelectedTestcase = updateObject;
        this.myprojectControls.testcaseInfoControl.setValue(`${updateObject.description}`)
      }
    });
  }
  NewMember(){
    const nextMonth: Date = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 12);
    const newItem = {
      MembershipEnd: nextMonth.toDateString(),
      MembershipType: 'Member',
      projectOwner: true
    }
    this.db.doc<any>('myProfile/' + this.myuserProfile.userAuthenObj.uid).set(newItem, {merge:true}).then(success=>{
      this.sidenav.close();
    });
  }
}
@Component({
  selector: 'dialog-edit-testcase',
  template: `
  <h1 mat-dialog-title>Edit TestCase</h1>
  <div mat-dialog-content>
  <form [formGroup]="userProfile" fxLayout="row wrap" fxLayoutAlign="center center">
    <mat-form-field appearance="fill" floatLabel="Edit Sub-Heading" fxFlex="75vw">
      <mat-label>Change Sub-Heading</mat-label>
      <input matInput placeholder="Sub-Heading" formControlName = "subHeading">
    </mat-form-field>
    <mat-form-field appearance="fill" floatLabel="Edit Link" fxFlex="75vw">
    <mat-label>Update in Stackblitz</mat-label>
    <input matInput placeholder="Stackblitz github link" formControlName = "linktoTest">
    </mat-form-field>
    <mat-form-field appearance="fill" floatLabel="Edit Description" fxFlex="75vw">
      <mat-label>Give More Information</mat-label>
      <textarea 
        matInput 
        placeholder="Explain More here" 
        formControlName = "description"
        cdkTextareaAutosize
        cdkAutosizeMinRows="13"
        cdkAutosizeMaxRows="70" 
        ></textarea>
    </mat-form-field>
  </form>  
</div>
<div mat-dialog-actions>
<button mat-button mat-raised-button color="primary" [mat-dialog-close]="userProfile.value"  [disabled]="userProfile.pristine">Update</button>
  <button mat-button mat-raised-button color="warn" (click)="onNoClick()" cdkFocusInitial >Cancel</button>  
</div> `
})
export class DialogEditTestcase implements OnInit {
  userProfile: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<DialogEditTestcase>,
    @Inject(MAT_DIALOG_DATA) public data: TestcaseInfo,
    private fb: FormBuilder) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  ngOnInit() {
    this.userProfile = this.fb.group({
      heading: [this.data.heading],
      subHeading: [this.data.subHeading],
      description: [this.data.description],
      linktoTest: [this.data.linktoTest]
    });
  }
}