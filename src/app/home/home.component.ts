import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CovidService } from '../covid.service';
import { User } from '../user.module';
import { ChartDataSets, ChartOptions, ChartPoint, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { DataService } from '../data.service';
import { CountryRecord, GlobalRecord, News } from '../models/record.model';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';




@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  user!: User | null;
  wSummary!: GlobalRecord;
  displayedColumns!: string[];
  pieChartData!: SingleDataSet;
  countries!: CountryRecord[];
  dataLoaded!: boolean;
  lastcases: (string|number)[][] = [];
  lastdeaths: (string|number)[][] = [];
  lastrecovered: (string|number)[][] = [];
  barChartData: any;
  barChartLabels!: Label[];
  lineChartData!: { data: ChartPoint[]; label: string; }[];
  lineChartLabels!: Label[];
  

  countryTableData!: MatTableDataSource<CountryRecord>;

  @ViewChild(MatSort, { static: false })
  sort!: MatSort;
  tableData!: ({ key: string; value: number; } | { key: string; value: string; })[];
  news: {date: string, description: string}[] = [];
  hasNews: boolean = false;
  
  
  constructor(public covidService: CovidService, private dataService: DataService, private router: Router) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
   }


   ngAfterViewInit() {
     //this.countryTableData.sort = this.sort
    }

  ngOnInit(): void {
    this.user = this.covidService.getUser(); 
    
    this.dataService.getWorldwideSummary().subscribe(wSummary => {
      this.wSummary = new GlobalRecord(wSummary);

      //Pie chart
      this.pieChartData = [this.wSummary.TotalDeaths, this.wSummary.TotalRecovered, this.wSummary.TotalConfirmed]; 
      this.tableData = [
        {key:"Total Cases", value:this.wSummary!.TotalConfirmed},
        {key:"New Cases", value:this.wSummary!.NewConfirmed},
        {key:"Active Cases", value:this.wSummary!.TotalConfirmed-this.wSummary!.TotalRecovered-this.wSummary!.TotalDeaths},
        {key:"Total Recovered", value:this.wSummary!.TotalRecovered},
        {key:"New Recovered", value:this.wSummary!.NewRecovered},
        {key:"Recovery Rate", value:(this.wSummary!.TotalRecovered/this.wSummary!.TotalConfirmed*100).toPrecision(4).toString()+'%'},
        {key:"Total Deaths", value:this.wSummary!.TotalDeaths},
        {key:"New Deaths", value:this.wSummary!.NewDeaths},
        {key:"Mortality Rate", value:(this.wSummary!.TotalDeaths/this.wSummary!.TotalConfirmed*100).toPrecision(4).toString()+'%'}
      ]
    });
    
    //Chart 1
  
    this.dataService.getWorldwideLastdays().subscribe((lastdays: { cases: any; deaths: any; recovered: any; }) => {
      const lastCasesCounts: any[][] = this.getLastDays(lastdays.cases);
      const lastDeathsCounts: any[][] = this.getLastDays(lastdays.deaths);
      const lastRecoveredCounts: any[][] = this.getLastDays(lastdays.recovered);
      for (let i=0; i<lastCasesCounts.length-1;i++){
        this.lastcases.push([lastCasesCounts[i+1][0],lastCasesCounts[i+1][1]-lastCasesCounts[i][1]]);
        this.lastdeaths.push([lastDeathsCounts[i+1][0],lastDeathsCounts[i+1][1]-lastDeathsCounts[i][1]]);
        this.lastrecovered.push([lastRecoveredCounts[i+1][0],lastRecoveredCounts[i+1][1]-lastRecoveredCounts[i][1]]);
      }

      this.barChartData = [
        { data: this.getValues(lastCasesCounts) , label: 'Daily Deaths' },
        { data: this.getValues(lastDeathsCounts), label: 'Daily Recovered'},
        { data: this.getValues(lastRecoveredCounts), label: 'Daily New Cases'}
      ];
      
      this.barChartLabels = this.getLabels(this.lastcases);
      
    })

    //Chart 2

    this.dataService.getWorldwide30days().subscribe((lastdays: { cases: any; deaths: any; recovered: any; }) => {
      const last30daysCasesCounts: (string|number)[][] = this.getLastDays(lastdays.cases);
      const last30daysDeathsCounts = this.getLastDays(lastdays.deaths);
      const last30daysRecoveredCounts = this.getLastDays(lastdays.recovered);

      this.lineChartData = [
        { data: this.getValues(last30daysDeathsCounts) , label: 'Daily Deaths' },
        { data: this.getValues(last30daysRecoveredCounts), label: 'Daily Recovered'},
        { data: this.getValues(last30daysCasesCounts), label: 'Daily New Cases'}
      ];
      
      this.lineChartLabels = this.getLabels(last30daysCasesCounts);
    })
    
    //Table 2

    this.dataService.getByCountrySummary().subscribe(countries =>{
      console.log(countries)

      this.countryTableData = new MatTableDataSource(countries)
      this.countryTableData.sort = this.sort;
      console.log(this.countryTableData)

    })

    this.dataService.getNews('worldwide').subscribe(news => {
      for (let i=0; i<news.length; i++) {
        this.news = news;
      }
      if ((news.length)>0){ this.hasNews = true;}
    })

  
  }


  private getLastDays(days: any): (string|number)[][]{
    var items = Object.keys(days).map(function(key) {
      return [key, days[key]];
    });

    items.sort(function(first, second) {
      if (second[0]>first[0]) {return -1}
      else {return +1}
    });
    return items
  }

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


  public getLabels(counts:any): Label[]{
    return counts.map(function(value: any[],index: any) { return value[0]; })
  }
  public getValues(counts: any): ChartPoint[]{
    return counts.map(function(value: any[],index: any) { return value[1]; })
  }
  

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  //Chart 2 
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];
  public lineChartOptions: (ChartOptions) = {
    responsive: true,
    plugins: {
      datalabels: {
        display: false
      }
    }
  };

  

  //public countryHeader: string[] = ['Country', 'New Cases','Total Cases','New Recoveries','Total Recoveries','New Deaths', 'Total Deaths'];
  public countryColumns: string[] = ["country","newCases","totalCases","newRecovered","totalRecovered","newDeaths","totalDeaths","getDetails"]

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

  public btnClick(slug:string) {
    this.router.navigateByUrl('/countries/'+slug);
  };

  public goToNews() {
    this.router.navigateByUrl('/add-news');
  }
}
