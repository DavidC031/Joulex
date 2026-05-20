import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApiService, BarrioMetric, EventLog, ScheduledReport, Summary, SystemHealth, TechnicalNode } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  loginForm = this.fb.nonNullable.group({
    email: ['demo@joulex.co', [Validators.required, Validators.email]],
    password: ['demo123', Validators.required]
  });

  loggedIn = false;
  loading = false;
  userName = '';
  barrios: BarrioMetric[] = [];
  selectedBarrio?: BarrioMetric;
  summary?: Summary;
  events: EventLog[] = [];
  nodes: TechnicalNode[] = [];
  reports: ScheduledReport[] = [];
  systemHealth?: SystemHealth;
  activeModule: 'plataforma' | 'analitica' | 'reportes' | 'sistema' = 'plataforma';
  reportVariables = ['Perdida termica', 'Varianza electrica', 'Alertas RETIE'];
  reportFormat = 'PDF';
  chartData: unknown;
  analyticChartData: unknown;
  statusChartData: unknown;
  healthChartData: unknown;
  chartOptions: unknown;
  analyticChartOptions: unknown;
  doughnutOptions: unknown;

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly messages: MessageService
  ) {}

  ngOnInit(): void {
    this.configureChart();
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.loading = true;
    this.api.login(email, password).subscribe({
      next: ({ user }) => {
        this.loggedIn = true;
        this.userName = user.name;
        this.loading = false;
        this.loadDashboard();
      },
      error: () => {
        this.loading = false;
        this.messages.add({
          severity: 'error',
          summary: 'Acceso rechazado',
          detail: 'Usa demo@joulex.co y demo123 para la demostración.'
        });
      }
    });
  }

  logout(): void {
    this.loggedIn = false;
    this.userName = '';
  }

  loadDashboard(): void {
    this.loading = true;
    this.api.getSummary().subscribe((summary) => (this.summary = summary));
    this.api.getEvents().subscribe((events) => (this.events = events));
    this.api.getNodes().subscribe((nodes) => {
      this.nodes = nodes;
      this.refreshAnalyticChart();
    });
    this.api.getReports().subscribe((reports) => (this.reports = reports));
    this.api.getSystemHealth().subscribe((systemHealth) => (this.systemHealth = systemHealth));
    this.api.getBarrios().subscribe({
      next: (barrios) => {
        this.barrios = barrios;
        this.selectedBarrio = barrios.find((barrio) => barrio.barrio === 'Simon Bolivar') ?? barrios[0];
        this.refreshChart();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messages.add({
          severity: 'error',
          summary: 'API no disponible',
          detail: 'Verifica que el backend Node este ejecutandose en el puerto 3000.'
        });
      }
    });
  }

  refreshChart(): void {
    const labels = this.barrios.map((row) => row.barrio);
    this.chartData = {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Consumo kW',
          yAxisID: 'yLoad',
          backgroundColor: 'rgba(28, 95, 168, 0.82)',
          borderColor: '#1c5fa8',
          borderRadius: 6,
          borderSkipped: false,
          data: this.barrios.map((row) => row.consumo_kw)
        },
        {
          type: 'line',
          label: 'Perdidas kW',
          yAxisID: 'yLoss',
          borderColor: '#ba1a1a',
          backgroundColor: '#ba1a1a',
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#ba1a1a',
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.35,
          data: this.barrios.map((row) => row.perdidas_kw)
        }
      ]
    };
    this.statusChartData = {
      labels: ['Normal', 'Alerta', 'Critico'],
      datasets: [
        {
          data: [
            this.barrios.filter((row) => row.estado === 'NORMAL').length,
            this.barrios.filter((row) => row.estado === 'ALERTA').length,
            this.barrios.filter((row) => row.estado === 'CRITICO').length
          ],
          backgroundColor: ['#28a745', '#ffc107', '#ba1a1a'],
          borderColor: '#ffffff',
          borderWidth: 4,
          hoverOffset: 6
        }
      ]
    };
  }

  refreshAnalyticChart(): void {
    this.analyticChartData = {
      labels: this.nodes.slice(0, 8).map((node) => node.id),
      datasets: [
        {
          type: 'line',
          label: 'Perdida Joule W',
          yAxisID: 'yLoss',
          borderColor: '#1c5fa8',
          backgroundColor: 'rgba(28, 95, 168, 0.18)',
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#1c5fa8',
          pointBorderWidth: 2,
          pointRadius: 4,
          fill: true,
          tension: 0.35,
          data: this.nodes.slice(0, 8).map((node) => node.perdida_w)
        },
        {
          type: 'bar',
          label: 'Energia reserva J',
          yAxisID: 'yReserve',
          backgroundColor: '#79b0ff',
          borderRadius: 6,
          borderSkipped: false,
          data: this.nodes.slice(0, 8).map((node) => node.energia_j)
        }
      ]
    };
  }

  configureChart(): void {
    const baseFont = { family: 'Inter', size: 12 };
    this.chartOptions = {
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: '#43474f',
            usePointStyle: true,
            boxWidth: 8,
            font: baseFont
          }
        },
        tooltip: {
          backgroundColor: '#001430',
          padding: 12,
          titleFont: { family: 'Inter', weight: '700' },
          bodyFont: baseFont
        }
      },
      scales: {
        x: {
          ticks: { color: '#43474f', font: baseFont, maxRotation: 35, minRotation: 0 },
          grid: { display: false }
        },
        yLoad: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Consumo (kW)', color: '#1c5fa8', font: baseFont },
          ticks: { color: '#43474f', font: baseFont },
          grid: { color: 'rgba(196, 198, 208, 0.55)' }
        },
        yLoss: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Perdidas (kW)', color: '#ba1a1a', font: baseFont },
          ticks: { color: '#43474f', font: baseFont },
          grid: { drawOnChartArea: false }
        }
      }
    };

    this.analyticChartOptions = {
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: '#43474f',
            usePointStyle: true,
            boxWidth: 8,
            font: baseFont
          }
        },
        tooltip: {
          backgroundColor: '#001430',
          padding: 12,
          titleFont: { family: 'Inter', weight: '700' },
          bodyFont: baseFont
        }
      },
      scales: {
        x: {
          ticks: { color: '#43474f', font: baseFont },
          grid: { display: false }
        },
        yLoss: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Perdida Joule (W)', color: '#1c5fa8', font: baseFont },
          ticks: { color: '#43474f', font: baseFont },
          grid: { color: 'rgba(196, 198, 208, 0.55)' }
        },
        yReserve: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Reserva (J)', color: '#00427d', font: baseFont },
          ticks: { color: '#43474f', font: baseFont },
          grid: { drawOnChartArea: false }
        }
      }
    };

    this.doughnutOptions = {
      cutout: '68%',
      maintainAspectRatio: false,
      layout: {
        padding: 0
      },
      plugins: {
        legend: {
          display: false,
          labels: {
            color: '#43474f',
            usePointStyle: true,
            boxWidth: 8,
            font: baseFont
          }
        }
      }
    };
  }

  statusClass(status: BarrioMetric['estado']): string {
    return `status-${status.toLowerCase()}`;
  }

  severityFor(status: BarrioMetric['estado'] | EventLog['estado']): 'success' | 'warn' | 'danger' {
    if (status === 'CRITICO') {
      return 'danger';
    }

    return status === 'ALERTA' ? 'warn' : 'success';
  }

  retieSeverity(status: TechnicalNode['retie']): 'success' | 'warn' | 'danger' {
    if (status === 'INFRACCION') {
      return 'danger';
    }

    return status === 'OBSERVACION' ? 'warn' : 'success';
  }

  setModule(module: typeof this.activeModule): void {
    this.activeModule = module;
  }

  healthPercent(value: number, max: number): number {
    return Math.min(100, Math.round((value / max) * 100));
  }

  exportPdf(kind: 'retie' | 'ficha'): void {
    if (!this.selectedBarrio || !this.summary) {
      this.messages.add({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Actualiza el dashboard antes de generar el PDF.'
      });
      return;
    }

    const reportTitle = kind === 'retie' ? 'Informe RETIE de Cumplimiento Electrico' : 'Ficha Tecnica de Infraestructura';
    const selectedNode = this.nodes.find((node) => node.barrio === this.selectedBarrio?.barrio) ?? this.nodes[0];
    const criticalEvents = this.events.filter((event) => event.barrio === this.selectedBarrio?.barrio).slice(0, 8);
    const reportRows =
      kind === 'retie'
        ? this.nodes
            .map(
              (node) => `
                <tr>
                  <td>${this.escapeHtml(node.id)}</td>
                  <td>${this.escapeHtml(node.barrio)}</td>
                  <td>${this.escapeHtml(node.formula)}</td>
                  <td>${node.perdida_w} W</td>
                  <td>${node.campo_vm.toLocaleString('es-CO')} V/m</td>
                  <td><span class="tag ${node.retie.toLowerCase()}">${this.escapeHtml(node.retie)}</span></td>
                </tr>`
            )
            .join('')
        : `
            <tr><th>Nodo</th><td>${this.escapeHtml(selectedNode?.id ?? 'ND-SIN-DATO')}</td></tr>
            <tr><th>Barrio</th><td>${this.escapeHtml(this.selectedBarrio.barrio)}</td></tr>
            <tr><th>Tipo</th><td>${this.escapeHtml(selectedNode?.tipo ?? 'Transformador')}</td></tr>
            <tr><th>Formula base</th><td>${this.escapeHtml(selectedNode?.formula ?? 'P = I^2R')}</td></tr>
            <tr><th>Corriente / Resistencia</th><td>${selectedNode?.corriente_a ?? 0} A / ${selectedNode?.resistencia_ohm ?? 0} ohm</td></tr>
            <tr><th>Perdida Joule</th><td>${selectedNode?.perdida_w ?? 0} W</td></tr>
            <tr><th>Reserva energetica</th><td>${selectedNode?.energia_j ?? 0} J</td></tr>
            <tr><th>Estado RETIE</th><td>${this.escapeHtml(selectedNode?.retie ?? 'SIN DATO')}</td></tr>`;

    const eventRows = criticalEvents
      .map(
        (event) => `
          <tr>
            <td>${new Date(event.timestamp).toLocaleString('es-CO')}</td>
            <td>${this.escapeHtml(event.dispositivo)}</td>
            <td>${this.escapeHtml(event.evento)}</td>
            <td>${this.escapeHtml(event.valor)}</td>
            <td><span class="tag ${event.estado.toLowerCase()}">${this.escapeHtml(event.estado)}</span></td>
          </tr>`
      )
      .join('');

    const html = `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>${this.escapeHtml(reportTitle)}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 32px; color: #191c1d; font-family: Arial, sans-serif; background: #ffffff; }
            header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 4px solid #002855; padding-bottom: 18px; margin-bottom: 24px; }
            h1 { margin: 0; color: #001430; font-size: 26px; }
            h2 { margin: 24px 0 10px; color: #002855; font-size: 17px; }
            p { color: #43474f; line-height: 1.45; }
            .brand { font-weight: 800; color: #1c5fa8; text-align: right; }
            .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
            .metric { border: 1px solid #c4c6d0; border-radius: 8px; padding: 12px; }
            .metric span { display: block; color: #43474f; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .metric strong { display: block; margin-top: 6px; color: #001430; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
            th { background: #002855; color: #ffffff; text-align: left; padding: 9px; }
            td { border-bottom: 1px solid #e1e3e4; padding: 9px; }
            tr:nth-child(even) td { background: #f8f9fa; }
            .tag { display: inline-block; border-radius: 999px; padding: 3px 8px; font-size: 10px; font-weight: 800; }
            .normal, .cumple { background: #d9f7df; color: #146c2e; }
            .alerta, .observacion { background: #fff1bf; color: #7a5200; }
            .critico, .infraccion { background: #ffdad6; color: #93000a; }
            footer { margin-top: 32px; color: #747780; font-size: 11px; border-top: 1px solid #c4c6d0; padding-top: 12px; }
            @media print { body { padding: 18mm; } button { display: none; } }
          </style>
        </head>
        <body>
          <header>
            <div>
              <h1>${this.escapeHtml(reportTitle)}</h1>
              <p>Sector ${this.escapeHtml(this.selectedBarrio.sector)} - ${this.escapeHtml(this.selectedBarrio.barrio)}</p>
            </div>
            <div class="brand">
              JouleX<br>
              MonitorElectrico BQ<br>
              ${new Date().toLocaleDateString('es-CO')}
            </div>
          </header>

          <section class="meta">
            <div class="metric"><span>Usuarios</span><strong>${this.selectedBarrio.usuarios.toLocaleString('es-CO')}</strong></div>
            <div class="metric"><span>Consumo</span><strong>${this.selectedBarrio.consumo_kw} kW</strong></div>
            <div class="metric"><span>Tension</span><strong>${this.selectedBarrio.tension_v} V</strong></div>
            <div class="metric"><span>Estado</span><strong>${this.escapeHtml(this.selectedBarrio.estado)}</strong></div>
          </section>

          <h2>${kind === 'retie' ? 'Resumen normativo por nodo' : 'Hoja de vida tecnica del nodo'}</h2>
          <table>
            ${
              kind === 'retie'
                ? '<thead><tr><th>Nodo</th><th>Barrio</th><th>Formula</th><th>Perdida</th><th>Campo</th><th>RETIE</th></tr></thead><tbody>' + reportRows + '</tbody>'
                : '<tbody>' + reportRows + '</tbody>'
            }
          </table>

          <h2>Eventos auditables del sector</h2>
          <table>
            <thead><tr><th>Fecha</th><th>Dispositivo</th><th>Evento</th><th>Valor</th><th>Estado</th></tr></thead>
            <tbody>${eventRows || '<tr><td colspan="5">Sin eventos priorizados para el sector seleccionado.</td></tr>'}</tbody>
          </table>

          <footer>
            Documento generado localmente para demostracion academica. Fuente: CSV de barrios de Barranquilla y simulacion tecnica JouleX.
          </footer>
        </body>
      </html>`;

    const printWindow = window.open('', '_blank', 'width=980,height=760');
    if (!printWindow) {
      this.messages.add({
        severity: 'warn',
        summary: 'Ventana bloqueada',
        detail: 'Permite ventanas emergentes para generar el PDF.'
      });
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 350);

    this.messages.add({
      severity: 'success',
      summary: 'PDF preparado',
      detail: 'En la ventana de impresion elige Guardar como PDF.'
    });
  }

  downloadCsv(): void {
    const headers = [
      'tipo',
      'barrio',
      'sector',
      'usuarios',
      'consumo_kw',
      'tension_v',
      'perdidas_kw',
      'estado',
      'nodo',
      'perdida_w',
      'campo_vm',
      'retie'
    ];
    const rows = this.barrios.map((barrio) => {
      const node = this.nodes.find((item) => item.barrio === barrio.barrio);
      return [
        'barrio',
        barrio.barrio,
        barrio.sector,
        barrio.usuarios,
        barrio.consumo_kw,
        barrio.tension_v,
        barrio.perdidas_kw,
        barrio.estado,
        node?.id ?? '',
        node?.perdida_w ?? '',
        node?.campo_vm ?? '',
        node?.retie ?? ''
      ];
    });
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `joulex_datos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.messages.add({
      severity: 'success',
      summary: 'CSV descargado',
      detail: 'El archivo incluye barrios, nodos y estado RETIE.'
    });
  }

  scheduleReport(): void {
    this.messages.add({
      severity: 'success',
      summary: 'Reporte programado',
      detail: `Se simulo la programacion del reporte ${this.reportFormat} para ${this.selectedBarrio?.barrio ?? 'el sector'}.`
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
