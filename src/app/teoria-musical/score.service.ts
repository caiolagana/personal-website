import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Score } from './score.model';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private firestore = inject(Firestore);

  getScores(): Observable<Score[]> {
    const ref = collection(this.firestore, 'scores');
    return collectionData(ref, { idField: 'id' }) as Observable<Score[]>;
  }
}
