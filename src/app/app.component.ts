import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, afterNextRender, afterRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import Chart from 'chart.js/auto';
import { take, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, NgFor],
  template: `
    <div class="container">
      <h1>Hello from Lifecycle Hook!</h1>
      <div>
        <label>
          Bar Color:
          <select [(ngModel)]="barColor">
            <option *ngFor="let c of barColors; trackBy: trackById" [value]="c.id">
              {{ c.color }}
            </option>
          </select>
        </label>
      </div>
      <canvas #canvas></canvas>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    div.container {
      width: 800px;
      padding: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy {
  @ViewChild('canvas', { static: true, read: ElementRef })
  canvas!: ElementRef<HTMLCanvasElement>;

  barColors = [
    { id: 'red', color: 'Red' },
    { id: 'pink', color: 'Pink' },
    { id: 'magenta', color: 'Magenta' },
    { id: 'rebeccapurple', color: 'Rebecca Purple' },
    { id: 'cyan', color: 'Cyan' },
    { id: 'blue', color: 'Blue' },
    { id: 'green', color: 'Green' },
    { id: 'yellow', color: 'Yellow' }
  ];

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
  barColor = 'red';

  constructor(titleService: Title) {
    titleService.setTitle('ng after render demo');

    timer(100, 1000)
      .pipe(take(5))
      .subscribe((value) => {
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
                data: this.data.map(row => row.count),
                backgroundColor: this.barColor,
              }
            ]
          }
        }
      );

    });

    afterRender(() => {
      if (this.chart) {
        const datasets = this.chart.data.datasets;
        if (this.chartData) {
          const { year, count } = this.chartData;
          this.chart.data.labels?.push(year);
          datasets.forEach((dataset) => {
            dataset.data.push(count);
          });
          this.chartData = null;
        }

        datasets.forEach((dataset) => {
          dataset.backgroundColor = this.barColor;
        });
        this.chart.update();
      }
    })
  }

  trackById(index: number, item: { id: string, color: string }) {
    return item.id;
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
