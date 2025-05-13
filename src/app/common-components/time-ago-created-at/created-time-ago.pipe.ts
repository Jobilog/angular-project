import { Pipe, PipeTransform , OnDestroy,NgZone, ChangeDetectorRef} from '@angular/core';

@Pipe({
  name: 'createdTimeAgo',
  standalone: true,
  pure: false
})
export class CreatedTimeAgoPipe implements PipeTransform , OnDestroy {
  private timer: any;

  constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) {}

  transform(value: Date | any): string {
    if (!value) return '';

    const date = new Date(value);
    this.removeTimer();

    const now = new Date();
    const seconds = Math.round(Math.abs((now.getTime() - date.getTime()) / 1000));
    const timeToUpdate = this.getSecondsUntilUpdate(seconds) * 1000;

    this.ngZone.runOutsideAngular(() => {
      this.timer = setTimeout(() => {
        this.ngZone.run(() => this.changeDetectorRef.markForCheck());
      }, timeToUpdate);
    });

    if (seconds < 29) return 'Just now';
    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (const i in intervals) {
      const counter = Math.floor(seconds / intervals[i]);
      if (counter > 0)
        return `${counter} ${i}${counter === 1 ? '' : 's'} ago`;
    }

    return 'Just now';
  }

  ngOnDestroy(): void {
    this.removeTimer();
  }

  private removeTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private getSecondsUntilUpdate(seconds: number): number {
    if (seconds < 60) return 1;
    else if (seconds < 3600) return 30;
    else if (seconds < 86400) return 300;
    else return 3600;
  }

}
