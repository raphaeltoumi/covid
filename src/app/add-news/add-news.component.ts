
import { Component } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { CovidService } from '../covid.service';
import { DataService } from '../data.service';
import { News } from '../models/record.model';
import { User } from '../user.module';

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.component.html',
  styleUrls: ['./add-news.component.css']
})

export class AddNewsComponent {
  isSubmitted = false;

  locationsMap = [{name:'Worldwide',slug:"worldwide"}];
  locations = ["Worldwide"];
  user!: User | null;  
  hasAccess!: boolean;

  constructor(public fb: FormBuilder, private dataService: DataService, public covidService: CovidService) { }

  /*########### Form ###########*/
  registrationForm = this.fb.group({
    location: ['', Validators.required],
    date: ['', Validators.required],
    description: ['', Validators.required, Validators.minLength(3)]
  })

  onSubmit() {
    if (this.covidService.userSignedIn()){
    this.covidService.isEligible().subscribe(bool=>{
      if (bool) {
        
        this.user = this.covidService.getUser();
        console.log("user",this.user);
        this.addNews(this.registrationForm.value.location);
        alert('A news was added to '+this.registrationForm.value.location);
      }
      else {
        alert('You do not have the permission to add news !');
      }
    });
    }
    else {
      alert('You do not have the permission to add news !');
    }
    
  }

  ngOnInit() {
    this.user = this.covidService.getUser();
    console.log("user",this.user);
    if (this.user != null) {
      this.hasAccess = this.user!.isEligible
    }
    else {
      this.hasAccess = false;
    }
    
    this.dataService.getByCountrySummary().subscribe(countries => {
      for (let i=0; i<countries.length; i++){
        this.locationsMap.push({name:countries[i].Country,slug:countries[i].Slug});
        this.locations.push(countries[i].Country);
      }
    });
  }

  changeLocation(e:any) {
    this.location!.setValue(e.target.value, {
      onlySelf: true
    })
  }

  get location() {
    return this.registrationForm.get('location');
  }

  

  addNews(location:string) {
    let news: News = new News(this.user!.uid, this.registrationForm.value.date, this.registrationForm.value.description);
    this.dataService.addNews(this.locationsMap.find(l => (l.name==location))!["slug"], news);
  }

  getAccess() {
    this.covidService.giveEligibility(this.user!);
    this.hasAccess = true;
  }

  boolNews = this.covidService.userSignedIn()&&!this.hasAccess;

  

  


}
