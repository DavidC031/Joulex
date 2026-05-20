import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface BarrioMetric {
  barrio: string;
  sector: string;
  usuarios: number;
  consumo_kw: number;
  tension_v: number;
  corriente_a: number;
  factor_potencia: number;
  temperatura_c: number;
  perdidas_kw: number;
  eventos_criticos: number;
  estado: 'NORMAL' | 'ALERTA' | 'CRITICO';
  lat: number;
  lng: number;
}

export interface Summary {
  usuarios: number;
  consumoKw: number;
  perdidasKw: number;
  eventosCriticos: number;
  tensionPromedio: number;
  factorPotenciaPromedio: number;
  barriosCriticos: number;
}

export interface EventLog {
  id: string;
  timestamp: string;
  barrio: string;
  dispositivo: string;
  evento: string;
  valor: string;
  estado: 'NORMAL' | 'ALERTA' | 'CRITICO';
}

export interface TechnicalNode {
  id: string;
  barrio: string;
  tipo: string;
  formula: string;
  resistencia_ohm: number;
  corriente_a: number;
  perdida_w: number;
  campo_vm: number;
  capacitancia_uf: number;
  energia_j: number;
  retie: 'CUMPLE' | 'OBSERVACION' | 'INFRACCION';
}

export interface ScheduledReport {
  id: string;
  nombre: string;
  frecuencia: string;
  destinatario: string;
  formato: string;
  estado: 'ACTIVO' | 'PAUSADO';
}

export interface SystemHealth {
  integridadDatos: number;
  latenciaMs: number;
  paquetesProcesados: number;
  sensoresActivos: number;
  servicios: Array<{ nombre: string; estado: 'OPERATIVO' | 'DEGRADADO'; detalle: string }>;
}

@Injectable()
export class ApiService {
  private readonly apiUrl = window.location.port === '4200' ? 'http://localhost:3000/api' : '/api';

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<{ token: string; user: { name: string; email: string; role: string } }> {
    return this.http.post<{ token: string; user: { name: string; email: string; role: string } }>(`${this.apiUrl}/login`, {
      email,
      password
    });
  }

  getBarrios(): Observable<BarrioMetric[]> {
    return this.http.get<BarrioMetric[]>(`${this.apiUrl}/barrios`);
  }

  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.apiUrl}/summary`);
  }

  getEvents(): Observable<EventLog[]> {
    return this.http.get<EventLog[]>(`${this.apiUrl}/events`);
  }

  getNodes(): Observable<TechnicalNode[]> {
    return this.http.get<TechnicalNode[]>(`${this.apiUrl}/nodes`);
  }

  getReports(): Observable<ScheduledReport[]> {
    return this.http.get<ScheduledReport[]>(`${this.apiUrl}/reports`);
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(`${this.apiUrl}/system-health`);
  }
}
