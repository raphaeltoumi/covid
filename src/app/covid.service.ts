import { Injectable } from '@angular/core';
import firebase  from 'firebase/app';
import { AngularFireAuth} from '@angular/fire/auth';
import { User } from './user.module';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { News } from './models/record.model';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CovidService {

  user!: User | null;
  

  constructor(private afAuth: AngularFireAuth, private router: Router, private firestore: AngularFirestore) { }

  async signInWithGoogle(){
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    this.user = {
      uid: credentials.user!.uid!,
      displayName: credentials.user!.displayName!,
      email: credentials.user!.email!,
      isEligible: false
    };
    localStorage.setItem("user", JSON.stringify(this.user));
    this.updateUserData(this.user);
  }

  private updateUserData(user: User){
    this.firestore.collection("users").doc(this.user!.uid).set({
      uid: this.user!.uid,
      displayName: this.user!.displayName,
      email: this.user!.email,
    }, {merge: true});
  }

  getUser(){
    if (this.user == null && this.userSignedIn()){
      this.user = JSON.parse(localStorage.getItem("user")!);
    }
    return this.user;
  }

  userSignedIn(): boolean{
    return localStorage.getItem("user") != null;
  }

  public isEligible(): Observable<boolean>{
    return this.firestore.collection('users').doc<User>(this.user!.uid).valueChanges().pipe(map(user => {return user!.isEligible;}))
  }

  public giveEligibility(user:User) {
    user.isEligible = true;
    this.firestore.collection('users').doc<User>(user.uid).set(user, {merge:true});
  }

  public signOut(){
    this.afAuth.signOut();
    localStorage.removeItem("user");
    this.user = null;
  }

  getNews(country: string) : Observable<any>  {
    return this.firestore.collection('countries').doc(country).collection('news').valueChanges() //order by date

    
  }
}
