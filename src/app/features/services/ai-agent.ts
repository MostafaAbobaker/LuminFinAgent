import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AskRequest } from '../Interfaces/ask-request';
import { AskResponse } from '../Interfaces/ask-response';



@Injectable({
  providedIn: 'root'
})
export class AiAgent {
  private readonly API_URL = 'http://146.190.243.196:8000/ask';

  http: HttpClient = inject(HttpClient);



  ask(request: AskRequest): Observable <AskResponse> {
    const payload = {
      question: request.question,
      k: request.k ?? 8,
      think: request.think ?? true,
      fast: request.fast ?? false,
      show_thinking: request.show_thinking ?? false
    };
    return this.http.post<AskResponse>(this.API_URL, payload);
  }
}
