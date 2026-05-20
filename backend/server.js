const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .forEach((line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) {
        return;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
}

const app = express();
const port = process.env.PORT || 3000;
const csvPath = path.join(__dirname, '..', 'data', 'barrios_barranquilla.csv');
const distPath = path.join(__dirname, '..', 'dist', 'joulex-monitor-electrico-bq', 'browser');

app.use(cors());
app.use(express.json());

function parseCsv() {
  const raw = fs.readFileSync(csvPath, 'utf8').trim();
  const [headerLine, ...lines] = raw.split(/\r?\n/);
  const headers = headerLine.split(',');

  return lines.map((line) => {
    const values = line.split(',');
    return headers.reduce((row, header, index) => {
      const value = values[index];
      const numberValue = Number(value);
      row[header] = Number.isNaN(numberValue) ? value : numberValue;
      return row;
    }, {});
  });
}

function buildEvents(rows) {
  const eventTypes = {
    NORMAL: ['Reconexión estable', 'Medición nominal', 'Balance de fase validado'],
    ALERTA: ['Baja de tensión', 'Desbalance de fase', 'Pérdidas no técnicas elevadas'],
    CRITICO: ['Sobrecalentamiento de transformador', 'Factor de potencia bajo', 'Punto caliente activo']
  };

  return rows.flatMap((row, barrioIndex) => {
    const count = Math.max(1, Math.min(Number(row.eventos_criticos) || 1, 3));
    return Array.from({ length: count }, (_, index) => {
      const status = index === 0 ? row.estado : row.estado === 'CRITICO' ? 'ALERTA' : row.estado;
      const date = new Date(2026, 4, 20, 8 + barrioIndex, 12 + index * 11, 5);
      return {
        id: `${row.barrio.toString().slice(0, 3).toUpperCase()}-${index + 1}`,
        timestamp: date.toISOString(),
        barrio: row.barrio,
        dispositivo: index === 0 ? `TRAFO-${barrioIndex + 10}` : `CIRCUITO-BQ-${barrioIndex + 1}${index}`,
        evento: eventTypes[status][index % eventTypes[status].length],
        valor: index === 0 ? `${row.temperatura_c} C` : `${row.tension_v} V`,
        estado: status
      };
    });
  });
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const demoEmail = process.env.DEMO_EMAIL || 'demo@joulex.co';
  const demoPassword = process.env.DEMO_PASSWORD || 'demo123';

  if (email === demoEmail && password === demoPassword) {
    return res.json({
      token: 'demo-token-joulex',
      user: {
        name: 'Analista JouleX',
        email,
        role: 'Centro de monitoreo'
      }
    });
  }

  return res.status(401).json({ message: 'Credenciales inválidas para la demostración.' });
});

app.get('/api/barrios', (_req, res) => {
  res.json(parseCsv());
});

app.get('/api/summary', (_req, res) => {
  const rows = parseCsv();
  const totals = rows.reduce(
    (acc, row) => {
      acc.usuarios += Number(row.usuarios);
      acc.consumo += Number(row.consumo_kw);
      acc.perdidas += Number(row.perdidas_kw);
      acc.eventos += Number(row.eventos_criticos);
      acc.tension += Number(row.tension_v);
      acc.factor += Number(row.factor_potencia);
      return acc;
    },
    { usuarios: 0, consumo: 0, perdidas: 0, eventos: 0, tension: 0, factor: 0 }
  );

  res.json({
    usuarios: totals.usuarios,
    consumoKw: Number(totals.consumo.toFixed(1)),
    perdidasKw: Number(totals.perdidas.toFixed(1)),
    eventosCriticos: totals.eventos,
    tensionPromedio: Number((totals.tension / rows.length).toFixed(1)),
    factorPotenciaPromedio: Number((totals.factor / rows.length).toFixed(2)),
    barriosCriticos: rows.filter((row) => row.estado === 'CRITICO').length
  });
});

app.get('/api/events', (_req, res) => {
  res.json(buildEvents(parseCsv()).sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
});

app.get('/api/nodes', (_req, res) => {
  const rows = parseCsv();
  res.json(
    rows.flatMap((row, index) => {
      const resistance = Number((0.018 + index * 0.0025).toFixed(4));
      const current = Number((row.corriente_a / 38).toFixed(1));
      const capacitanceMicroF = 1200 + index * 75;
      const powerLossW = Number((current * current * resistance).toFixed(1));
      const storedEnergyJ = Number((0.5 * (capacitanceMicroF / 1000000) * row.tension_v * row.tension_v).toFixed(2));
      const electricFieldVm = Number(((row.consumo_kw * 1000) / Math.max(row.usuarios, 1) * 720).toFixed(0));

      return [
        {
          id: `ND-${String.fromCharCode(65 + index)}1`,
          barrio: row.barrio,
          tipo: 'Transformador',
          formula: 'P = I^2R',
          resistencia_ohm: resistance,
          corriente_a: current,
          perdida_w: powerLossW,
          campo_vm: electricFieldVm,
          capacitancia_uf: capacitanceMicroF,
          energia_j: storedEnergyJ,
          retie: row.estado === 'CRITICO' ? 'INFRACCION' : row.estado === 'ALERTA' ? 'OBSERVACION' : 'CUMPLE'
        }
      ];
    })
  );
});

app.get('/api/reports', (_req, res) => {
  res.json([
    {
      id: 'REP-RETIE-001',
      nombre: 'Auditoria semanal RETIE',
      frecuencia: 'Lunes 08:00',
      destinatario: 'compliance@joulex.co',
      formato: 'PDF',
      estado: 'ACTIVO'
    },
    {
      id: 'REP-MANT-014',
      nombre: 'Mantenimiento preventivo suroriente',
      frecuencia: 'Diario 06:00',
      destinatario: 'mantenimiento@joulex.co',
      formato: 'XLSX',
      estado: 'ACTIVO'
    },
    {
      id: 'REP-DATA-022',
      nombre: 'Datos en bruto de telemetria',
      frecuencia: 'Cada 12 horas',
      destinatario: 'operaciones@joulex.co',
      formato: 'CSV',
      estado: 'PAUSADO'
    }
  ]);
});

app.get('/api/system-health', (_req, res) => {
  res.json({
    integridadDatos: 99.98,
    latenciaMs: 84,
    paquetesProcesados: 184230,
    sensoresActivos: 128,
    servicios: [
      { nombre: 'Ingestion CSV', estado: 'OPERATIVO', detalle: 'Lecturas cargadas desde data/barrios_barranquilla.csv' },
      { nombre: 'Motor de eventos', estado: 'OPERATIVO', detalle: 'Priorizacion por criticidad electrica' },
      { nombre: 'Constructor de reportes', estado: 'OPERATIVO', detalle: 'PDF, CSV y XLSX simulados para demo' },
      { nombre: 'Gateway de telemetria', estado: 'DEGRADADO', detalle: 'Latencia elevada en sectores criticos' }
    ]
  });
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.status(503).send(`
      <h1>JouleX backend activo</h1>
      <p>La API esta disponible, pero el build Angular no existe en <code>dist/joulex-monitor-electrico-bq/browser</code>.</p>
      <p>Ejecuta <code>npm run build</code> durante el despliegue de Azure.</p>
    `);
  });
}

app.listen(port, () => {
  console.log(`JouleX API escuchando en http://localhost:${port}`);
});
