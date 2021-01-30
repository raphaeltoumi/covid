import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddNewsComponent } from './add-news/add-news.component';
import { AuthGuard } from './auth.guard';
import { CountryComponent } from './country/country.component';
import { HomeComponent } from './home/home.component';
import { SigninComponent } from './signin/signin.component';
import { SecurePagesGuard }  from './secure-pages.guard'

const routes: Routes = [
  {path:'countries/:slug', component: CountryComponent},
  { path: "home", component: HomeComponent},
  //{ path: "signin", component: SigninComponent, canActivate: [SecurePagesGuard]},
  //{path: "country", component: CountryComponent},
  {path: "add-news", component: AddNewsComponent},
  {path: "", pathMatch: "full", redirectTo: "home"},
  {path: "**", redirectTo: "home"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
