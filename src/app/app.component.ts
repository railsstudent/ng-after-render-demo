import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, afterNextRender, afterRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import Chart from 'chart.js/auto';
import { take, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container">
      <h1>Hello from Lifecycle Hook!</h1>
      <div>
        <label>
          Bar Color:
          <select [(ngModel)]="barColor">
              <option value="red">Red</option>
              <option value="pink">Pink</option>
              <option value="magenta">Magenta</option>
              <option value="rebeccapurple">Rebecca Purple</option>
              <option value="cyan">Cyan</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
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

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
