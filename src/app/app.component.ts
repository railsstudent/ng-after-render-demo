import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, afterNextRender, afterRender } from '@angular/core';
import { Title } from '@angular/platform-browser';
import Chart from 'chart.js/auto';
import { take, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Hello from Lifecycle Hook!</h1>
    <div>
      <canvas #canvas></canvas>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    div {
      width: 400px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy {
  @ViewChild('canvas', { static: true, read: ElementRef })
  canvas!: ElementRef<HTMLCanvasElement>;

  data = [
    { year: 2017, count: 10 },
    { year: 2018, count: 20 },
    { year: 2019, count: 15 },
    { year: 2020, count: 25 },
    { year: 2021, count: 22 },
    { year: 2022, count: 30 },
    { year: 2023, count: 28 },
  ];

  chart: Chart | null = null;
  chartData: { year: number; count: number } | null = null;

  constructor(titleService: Title) {
    titleService.setTitle('ng after render demo');

    timer(100, 500)
      .pipe(
        take(5)
      ).subscribe((value) => {
        this.chartData = {
          year: 2024 + value,
          count: Math.floor(Math.random() * 29 + 1), 
        }
      })

    afterNextRender(() => {
      console.log('afterNextRender called');

      this.chart = new Chart(
        this.canvas.nativeElement,
        {
          type: 'bar',
          data: {
            labels: this.data.map(row => row.year),
            datasets: [
              {
                label: 'Acquisitions by year',
                data: this.data.map(row => row.count)
              }
            ]
          }
        }
      );

    });

    afterRender(() => {
      console.log('afterRender called');

      if (this.chart && this.chartData) {
        this.chart.data?.labels?.push(this.chartData.year);
        this.chart.data.datasets.forEach((dataset) => {
          if (this.chartData) {
            dataset.data.push(this.chartData.count);
          }
        });
        this.chart.update();
        this.chartData = null;
      }
    })
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
