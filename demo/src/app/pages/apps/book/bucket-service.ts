import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BucketService {

  private bucketUrl = 'https://storage.googleapis.com/storage/v1/b/books_priming/o';
  private apiKey = 'AIzaSyB3oYiQJ6q8S4Q0DdR8kDOXfX13Yn-0bfc';

  constructor(private http: HttpClient) { }

  listBucketFiles() {
    // Define os cabeçalhos com a chave de API
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.apiKey}`);

    // Define os parâmetros de consulta
    let params = new HttpParams();
    params = params.append('prefix', '');
    params = params.append('delimiter', '');

    // Faz a requisição HTTP com os cabeçalhos e parâmetros definidos
    return this.http.get<any>(this.bucketUrl, { headers, params });
  }
}
