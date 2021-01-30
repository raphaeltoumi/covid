import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartOptions, ChartPoint, ChartType } from 'chart.js';
import { Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, SingleDataSet } from 'ng2-charts';
import { CovidService } from '../covid.service';
import { DataService } from '../data.service';
import { Country, CountryRecord, News } from '../models/record.model';
import { User } from '../user.module';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import * as moment from 'moment';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  user!: User | null;
  countrySummary!: Country|undefined;
  slug!: string;
  name!: string;
  pieChartData!: SingleDataSet;
  cases: any;
  newCounts: number[] = [];
  deathsCounts: number[] = [];
  recoveredCounts: number[] = [];
  barChartData: any;
  barChartLabels: Label[] = [];
  allConfirmed: number[] = [];
  allDeaths: number[] = [];
  allRecovered: number[] = [];
  lineChartData!: any[];
  lineChartLabels: Label[] = [];

  items!: any;
  tableData!: ({ key: string; value: number; } | { key: string; value: string; })[];
  news!: {description:string,date:string}[];
  hasNews: boolean = false;




  constructor(public covidService: CovidService, private dataService: DataService, private route: ActivatedRoute, private store: AngularFirestore, private router: Router) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
   }

  ngOnInit(): void {
    this.user = this.covidService.getUser(); 
    
    this.route.params.subscribe(params => {
      this.slug = params["slug"];})
    
    this.dataService.getNews(this.slug).subscribe(news => console.log(news));
    //Table 1
    this.dataService.getCountryData(this.slug).subscribe(data=>{
      this.countrySummary=data;
      this.pieChartData = [this.countrySummary!.TotalDeaths, this.countrySummary!.TotalRecovered, this.countrySummary!.TotalConfirmed];
      this.name = this.countrySummary!.Country;
      this.tableData = [
        {key:"Total Cases", value:this.countrySummary!.TotalConfirmed},
        {key:"New Cases", value:this.countrySummary!.NewConfirmed},
        {key:"Active Cases", value:this.countrySummary!.TotalConfirmed-this.countrySummary!.TotalRecovered-this.countrySummary!.TotalDeaths},
        {key:"Total Recovered", value:this.countrySummary!.TotalRecovered},
        {key:"New Recovered", value:this.countrySummary!.NewRecovered},
        {key:"Recovery Rate", value:(this.countrySummary!.TotalRecovered/this.countrySummary!.TotalConfirmed*100).toPrecision(4).toString()+'%'},
        {key:"Total Deaths", value:this.countrySummary!.TotalDeaths},
        {key:"New Deaths", value:this.countrySummary!.NewDeaths},
        {key:"Mortality Rate", value:(this.countrySummary!.TotalDeaths/this.countrySummary!.TotalConfirmed*100).toPrecision(4).toString()+'%'}
      ]
    });
    
    

    //Chart 1
    this.dataService.getCountryCases(this.slug).subscribe((cases: any) => {
      this.cases = cases
      this.getLast7Days()
      this.getAllCases()
      this.barChartData = [
        { data: this.deathsCounts , label: 'Daily Deaths' },
        { data: this.recoveredCounts, label: 'Daily Recovered'},
        { data: this.newCounts, label: 'Daily New Cases'}
      ];
    })
    
    //Chart 2
    
    this.lineChartData = [
      { data: this.allDeaths , label: 'Total Deaths' },
      { data: this.allConfirmed, label: 'Total Cases'},
      { data: this.allRecovered, label: 'Total Recovered'}
    ];

    //news

    this.dataService.getNews(this.slug).subscribe(news => {
      for (let i=0; i<news.length; i++) {
        this.news = news;
      }
      if ((news.length)>0){ this.hasNews = true;}
    })
  
    


  }
  

  getLast7Days(){
    const days = [];
    for (let i=0; i<8; i++){
      days.push(this.cases[this.cases.length-8+i])
    }
    
    for (let i=0; i<days.length-1; i++){
      this.newCounts.push(days[i+1]["Confirmed"]-days[i]["Confirmed"])
      this.deathsCounts.push(days[i+1]["Deaths"]-days[i]["Deaths"])
      this.recoveredCounts.push(days[i+1]["Recovered"]-days[i]["Recovered"])
      this.barChartLabels.push(moment(days[i+1]["Date"]).format('DD-MM-YYYY'))
    }
  }

  getAllCases(){

    for (let i=0; i<this.cases.length;i++){
      if (this.cases[i]["Confirmed"]!=0){
        this.allConfirmed.push(this.cases[i]["Confirmed"])
        this.allDeaths.push(this.cases[i]["Deaths"])
        this.allRecovered.push(this.cases[i]["Recovered"])
        this.lineChartLabels.push(moment(this.cases[i]["Date"]).format('DD-MM-YYYY'))
      }
    }
  }


  

  public pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        display: false
      }
    }
  };
  public pieChartLabels: Label[] = [['Dead Cases'], ['Recovered Cases'], 'Active Cases'];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  // Chart 1
  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        display: false
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  //Chart 2
  public lineChartLegend = true;
  public lineChartType : ChartType = 'line';
  public lineChartPlugins = [];
  public lineChartOptions: (ChartOptions) = {
    responsive: true,
    plugins: {
      datalabels: {
        display: false
      }
    }
  };

  public goToNews(){
    this.router.navigateByUrl('add-news');
  }
}
