import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { concatMap, find, map, switchMap } from 'rxjs/operators';

import { Country, CountryRecord, GlobalRecord, News, Summary } from './models/record.model';
import { CovidService } from './covid.service';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';





@Injectable({
  providedIn: 'root'
})
export class DataService {

  country:Country|undefined = new Country("no","no",0,0,0,0,0,0,new Date());;

  private api = "https://api.covid19api.com/";
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(private http: HttpClient, private firestore: AngularFirestore) { }

  getByCountrySummary(): Observable<Country[]>{
    return this.http.get<Summary>(this.api+'summary').pipe(map(summary => {console.log(summary.Countries); return summary.Countries}))
  }


  getWorldwideSummary(): Observable<GlobalRecord>{
    return this.http.get<Summary>(this.api+'summary').pipe(map(summary => summary.Global))
  }

  getWorldwideLastdays(): any{
    return this.http.get("https://corona.lmao.ninja/v2/historical/all?lastdays=8").pipe(map( lastdays => lastdays))
  }

  getWorldwide30days(): any {
    return this.http.get('https://corona.lmao.ninja/v2/historical/all').pipe(map(lastdays => lastdays))
  }

  getCountryCases(slug:string): any{
    return this.http.get('https://api.covid19api.com/total/country/'+slug).pipe(map(days => days))
  }

  getCountryData(slug:string): Observable<Country|undefined>{
    return this.isInDatabaseAndUpToDate(slug).pipe(switchMap(bool => {
      console.log('bool', bool);
      if (bool) {
        console.log("here");
        return this.firestore.collection('countries').doc<Country>(slug).valueChanges();
      }
      else {
        console.log("there");
        return this.getByCountrySummary().pipe(
          map(countries => countries.find(c => c.Slug === slug))
        ).pipe(map(country => {
            this.firestore.collection('countries').doc(slug).set(Object.assign({}, country), {merge:true});
            return country;
        }));
        
        
      }
    }));
  }

  isInDatabaseAndUpToDate(slug:string): Observable<boolean> {
    return this.firestore.collection("countries").doc<Country>(slug).get().pipe(map(doc => {
      return (doc.exists && moment(doc.get("Date")).format('DD-MM-YYYY')==moment(new Date()).format('DD-MM-YYYY'))
    }));
  }

  getNews(slug:string): Observable<News[]> {
    return this.firestore.collection("countries").doc<Country>(slug).collection<News>('news').valueChanges()
  }
     

  addNews(slug:string, news:News){
    this.firestore.collection('countries').doc(slug).get().subscribe(doc=> {
      if (!doc.exists) {
        console.log("not exists")
        this.getByCountrySummary().pipe(
          map(countries => countries.find(c => c.Slug === slug))
        ).pipe(map(country => {
            this.firestore.collection('countries').doc(slug).set(Object.assign({}, country), {merge:true});
            this.firestore.collection('countries').doc(slug).collection('news').add(Object.assign({}, news))
      })).subscribe()}
      else {
        this.firestore.collection('countries').doc(slug).collection('news').add(Object.assign({}, news)).then();

      }
    });


  }



}
