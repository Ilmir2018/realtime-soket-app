import { Component } from '@angular/core';
import { min, Observable } from 'rxjs';
import { Test, TestService } from './services/test-service/test.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title: Observable<Test> = this.service.getTest();

  constructor(private service: TestService) {}
}
