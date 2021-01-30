import * as moment from 'moment';
import { User } from '../user.module';

export interface IGlobalRecord {
    TotalConfirmed: number;
    NewConfirmed: number;
    ActiveConfirmed: number;
    NewDeaths: number;
    TotalDeaths: number;
    NewRecovered: number;
    TotalRecovered: number;
    RecoveryRate: string;
    MortalityRate: string;
    
}
export class GlobalRecord implements IGlobalRecord {
    NewConfirmed!: number;
    TotalConfirmed!: number;
    NewDeaths!: number;
    TotalDeaths!: number;
    NewRecovered!: number;
    TotalRecovered!: number;
    RecoveryRate!: string;
    MortalityRate!: string;
    ActiveConfirmed!: number;

    constructor(summary:any){
        this.NewConfirmed=summary.NewConfirmed;
        this.TotalConfirmed=summary.TotalConfirmed;
        this.NewDeaths=summary.NewDeaths;
        this.TotalDeaths=summary.TotalDeaths;
        this.NewRecovered=summary.NewRecovered;
        this.TotalRecovered=summary.TotalRecovered;
        this.RecoveryRate = (this.TotalRecovered/this.TotalConfirmed*100).toFixed(2).toString()+'%'
        this.MortalityRate = (this.TotalDeaths/this.TotalConfirmed*100).toFixed(2).toString()+'%'
        this.ActiveConfirmed = this.TotalConfirmed-this.TotalRecovered-this.TotalDeaths
    }
}

export interface CountryRecord {
    Slug: string;
    Country: string;
    NewConfirmed: number;
    TotalConfirmed: number;
    NewDeaths: number;
    TotalDeaths: number;
    NewRecovered: number;
    TotalRecovered: number;
    Date: Date;
}
export interface Summary {
    Global: GlobalRecord;
    Countries: Country[];
}

export class Country{
    Slug: string;
    Country: string;
    NewConfirmed: number;
    TotalConfirmed: number;
    NewDeaths: number;
    TotalDeaths: number;
    NewRecovered: number;
    TotalRecovered: number;
    Date: Date;

    constructor(Slug: string,
        Country: string,
        NewConfirmed: number,
        TotalConfirmed: number,
        NewDeaths: number,
        TotalDeaths: number,
        NewRecovered: number,
        TotalRecovered: number,
        Date: Date,){
            this.Slug=Slug;
            this.Country=Country;
            this.NewConfirmed=NewConfirmed;
            this.TotalConfirmed=TotalConfirmed;
            this.NewDeaths=NewDeaths;
            this.TotalDeaths=TotalDeaths;
            this.NewRecovered=NewRecovered;
            this.TotalRecovered=TotalRecovered;
            this.Date=Date;
    }
}

export class News {
    uid: string;
    date: string;
    description: string;

    constructor(uid: string, date: Date, description: string){
        this.uid=uid;
        this.date=moment(date).format('DD-MM-YYYY');
        this.description=description;
    }

}