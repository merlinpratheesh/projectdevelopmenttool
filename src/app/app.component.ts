import { Component, OnInit, ViewChild,Inject } from '@angular/core';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { projectSub, myusrinfo, projectVariables, projectControls, UserdataService, MainSectionGroup, TestcaseInfo, userProfile, projectFlags } from './service/userdata.service';
import { map, switchMap, filter, take, startWith } from 'rxjs/operators';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { doc } from 'rxfire/firestore';
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

  myonlineAfterAuth = undefined;

  myProfileInfo = undefined;
  getProfileInfoBehaviourSub = new BehaviorSubject(undefined);
  getProfileInfoSubscription: Subscription;
  getProfileInfo = (ProfileInfoDoc: AngularFirestoreDocument<myusrinfo>) => {
    if (this.getProfileInfoSubscription !== undefined) {
      this.getProfileInfoSubscription.unsubscribe();
    }
    this.getProfileInfoSubscription = ProfileInfoDoc.valueChanges().subscribe(async (val: myusrinfo) => {
      if (val === undefined) {
        this.getSectionsBehaviourSub.next(undefined);
      } else {
        if (!Object.keys(val).length === true) {
          const documentExist = undefined;//= await this.testerApiService.docExists();
          console.log('documentExist', documentExist);
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
          }
        }
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
            this.myprojectVariables.testcaseslength= arrayeverse.length;
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
            this.getPublicListBehaviourSub.next(val.public);
          }
        }
      }
    });
    return this.getPublicListBehaviourSub;
  };

  privateList = undefined;
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
        this.getPrivateSectionsBehaviourSub.next(undefined);
      } else {
        if (!Object.keys(val.MainSection).length === true) {
          this.myuserProfile.mainsubsectionKeys = [];
          this.getPrivateSectionsBehaviourSub.next(undefined);
        } else {
          if (val.MainSection !== undefined) {
            this.myuserProfile.keysReadFromDb = val.MainSection;
            this.myuserProfile.mainsubsectionKeys = [];
            this.myuserProfile.keysReadFromDb?.forEach(eachMainfield => {
              this.myuserProfile.mainsubsectionKeys.push(eachMainfield.name);
            });
          }
          this.getPrivateSectionsBehaviourSub.next(val.MainSection);
        }
      }
    });
    return this.getPrivateSectionsBehaviourSub;
  };

  myprojectSub: projectSub = {
    openeditSub: undefined,
    NewTaskControlSub: undefined,
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
    keysReadFromDb: [],
    mainsubsectionKeys: [],
    subSectionKeys: [],
    savedisabledval: undefined
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
    testcaseslength:0,
    viewSelectedTestcase: undefined,
    initialMainSection: undefined,
    lastSavedVisibility: false,
    modifiedKeysDb: undefined,
    editProjectkeysSaved: undefined
  }
  @ViewChild('drawer') public sidenav: MatSidenav;
  constructor(
    public afAuth: AngularFireAuth,
    public developmentservice: UserdataService,
    private db: AngularFirestore,
    public fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.myauth = this.getObservableauthState(this.afAuth.authState);
    this.myonline = this.getObservableonine(this.developmentservice.isOnline$);
    this.myonlineAfterAuth = this.myonline.pipe(
      switchMap((onlineval: any) => {
        return this.myauth.pipe(
          filter(authstat => authstat !== undefined),
          map((myauthentication: firebase.User) => {
            if (myauthentication === null) {// loggoff
            } else { //logged In            
              //read tc
              this.myProfileInfo = this.getProfileInfo(this.db.doc(('myProfile/' + myauthentication.uid)));
              this.myuserProfile.userAuthenObj = myauthentication;
              this.myuserProfile.projectLocation = 'projectList/DemoProjectKey';
              this.loadFirstPageKeys();
              //read keys
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
              this.myprojectSub.publicprojectControlSub = this.myprojectControls.publicprojectControl.valueChanges.pipe(
                map((publicProjectSelected: string) => {
                  //check unique
                  //check not null
                  if (publicProjectSelected !== null) {
                    this.myuserProfile.projectName = publicProjectSelected;
                    this.getTestcasesBehaviourSub.next(undefined);
                    this.myprojectControls.subsectionkeysControl.reset();
                    this.myprojectVariables.testcaseslength=0;
                    this.Sections = this.getSections(this.db.doc('/publicProjectKeys/' + publicProjectSelected));
                  }
                })).subscribe(success => {
                });
              this.myprojectSub.ownPublicprojectControlSub = this.myprojectControls.ownPublicprojectControl.valueChanges.pipe(
                map((privateProjectSelected: string) => {
                  //check unique
                  //check not null
                  if (privateProjectSelected !== null) {
                    this.privateSection = this.getPrivateSections(this.db.doc('/publicProjectKeys/' + privateProjectSelected));
                  }

                })).subscribe(success => {
                });
              this.myprojectSub.editMainsectionGroupSub = this.myprojectControls.editMainsectionGroup.valueChanges.pipe(
                map((editMainSecSelected: any) => {
                  if (editMainSecSelected.editMainsectionControl !== null) {
                    this.myuserProfile.subSectionKeys = [];
                    this.myuserProfile.keysReadFromDb.forEach(eachMainfield => {
                      if (editMainSecSelected.editMainsectionControl !== null) {
                        if (editMainSecSelected.editMainsectionControl === eachMainfield.name) {
                          this.myuserProfile.savedisabledval = eachMainfield.disabled;
                          this.myprojectControls.visibilityMainsectionGroup.setValue({ editVisibilityControl: this.myuserProfile.savedisabledval });
                          eachMainfield.section.forEach(eachSubfield => {
                            this.myuserProfile.subSectionKeys.push(eachSubfield.viewvalue);
                          });
                        }
                      }

                    });
                    //check unique                  
                  }

                })).subscribe(success => {
                });
              this.myprojectSub.editSubsectionGroupSub = this.myprojectControls.editSubsectionGroup.valueChanges.pipe(
                map((editSubSecSelected: any) => {
                  //check not null
                  if (editSubSecSelected.editSubsectionControl !== null) {
                    //check unique                  
                    //Save Value
                  }

                })).subscribe(success => {
                });
            }
            return onlineval;
          }),

        )
      })
    );
  }

  loadFirstPageKeys() {
    if (this.myprojectSub.loadfirstPageKeysSub !== undefined) {
      this.myprojectSub.loadfirstPageKeysSub.unsubscribe();
    }
    this.myprojectSub.loadfirstPageKeysSub = doc(this.db.firestore.doc('/myProfile/' + this.myuserProfile.userAuthenObj.uid))
      .pipe(take(1),
        map((profileData: any) => {
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
          this.Sections = this.getSections(this.db.doc(this.myuserProfile.projectLocation));
        })//end map-profileData
      ).subscribe(_ => {

      });
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
    this.myprojectSub.openeditSub?.unsubscribe()
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
      console.log('userselection',userselection);
      locationForSave = this.myuserProfile.projectName + '/' + userselection.groupValue + '/items/' + userselection.value;
    }
    const updateObject: TestcaseInfo = {
      heading: this.myprojectControls.createTestcaseControl.value,//Heading in testcase list
      subHeading: 'Edit SubHeading',//Sub-Heading in testcase list
      description: 'Edit here!',//Description in testcase view
      linktoTest: 'https://www.google.com/'//stackblitzLink in testcase edit/doubleclick
    };
    this.developmentservice.createNewTestcase(locationForSave, updateObject).then(success=>{
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
      this.developmentservice.deleteTestcase(locationForDelete,this.myprojectVariables.viewSelectedTestcase).then(success=>{
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
    this.myprojectSub.openeditSub= dialogRef.afterClosed().subscribe(result => {
      if (result !== null) {
        this.myprojectFlags.showEditTcButton = false;
        const updateObject: TestcaseInfo = { ...result };
        this.developmentservice.editTestcase(locationForEdit, this.myprojectVariables.viewSelectedTestcase, updateObject);
        this.myprojectVariables.viewSelectedTestcase= updateObject;
        this.myprojectControls.testcaseInfoControl.setValue(`${updateObject.description}`)
      }
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
//Project Flow
/*
User sees a key/value according to his type-> demo/Member/Expired/Guest
User points To a key/Value from DB
User selects a DB operation
Updated DB State shown to the User
*/