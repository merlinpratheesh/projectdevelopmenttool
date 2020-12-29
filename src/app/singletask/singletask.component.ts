import { Component,ChangeDetectionStrategy,OnInit, Input, Output, EventEmitter, ElementRef, Renderer2, AfterViewChecked } from '@angular/core';
import { TestcaseInfo } from '../service/userdata.service';

@Component({
  selector: 'app-singletask',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './singletask.component.html',
  styleUrls: ['./singletask.component.scss']
})
export class SingletaskComponent implements OnInit, AfterViewChecked {
  @Input() task: TestcaseInfo;
 //@Input() lasteditedHeading: string;
//@Input() lasteditedSubHeading: string;
  @Output() toshow = new EventEmitter<TestcaseInfo>();
  constructor(
    private el: ElementRef,
    private renderer: Renderer2) {
    }
ngAfterViewChecked(): void{
/*if( this.lasteditedHeading !== undefined && this.lasteditedHeading === this.task.heading && this.lasteditedSubHeading === this.task.subHeading ){
    this.changeselected(this.task);
 }*/
}
  ngOnInit(): void {
  }
  public open(): void {
    const url = `${this.task.linktoTest}`;
    const w = screen.width * 0.9;
    const h = screen.height * 0.8;
    const left = (screen.width / 2) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    const randomnumber = Math.floor((Math.random() * 100) + 1);
    // tslint:disable-next-line:max-line-length
    window.open(url, '_blank', 'PopUp' + randomnumber + ',scrollbars=1,menubar=0,resizable=1,width = ' + w + ', height = ' + h + ', top = ' + top + ', left = ' + left);
  }

  changeselected(mytask){
    const part = this.el.nativeElement.querySelector('.item');
    this.renderer.setStyle(part, 'background-color', 'lightblue');
    this.toshow.emit(mytask);
  }

}