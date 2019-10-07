import { Injectable } from '@angular/core';
import { Hero } from './hero';
import { HEROES } from './mock-heroes';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroesUrl = 'http://top.test/api/heroes';  // URL to web api
  /* private heroesUrl = 'http://34c2effb.ngrok.io/api/heroes'; */
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  };
  constructor(private http: HttpClient, private messageService: MessageService) { }
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl).pipe(
      map((data: any) => {
        console.log(data);
        return data.data;
      }),
      tap((data: any) => {
        console.log(data);
        this.log('fetched heroes');
      }),
      catchError(this.handleError<Hero[]>('getHeroes', []))
    );
  }
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }

  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    console.log(url);
    return this.http.get<Hero>(url).pipe(
      map((data: any) => {
        console.log(data);
        return data.data;
      }),
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }
  /** PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any> {
    const url = `${this.heroesUrl}/${hero.id}`;
    console.log(url);
    return this.http.put(url, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }
  addHero(hero: Hero): Observable<Hero> {
    console.log(hero);
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      map((data: any) => {
        console.log(data);
        return data.data;
      }),
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }
  /** DELETE: delete the hero from the server */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    console.log(term);
    return this.http.get<Hero[]>(`${this.heroesUrl}`, {params: {name: term}}).pipe(
      map((data: any) => {
        console.log(data);
        return data.data;
      }),
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      console.error(error.error);
      console.log(result);
      // TODO: better job of transforming error for user consumption

      this.log(`${operation} failed: ${error.message}`);
      // tslint:disable-next-line: triple-equals
      if (typeof error.error != 'undefined') {
        this.log(`${operation} failed: ${error.error.error}`);
      }
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
