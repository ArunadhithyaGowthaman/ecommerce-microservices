const client = require('prom-client');

const register = new client.Registry();
register.setDefaultLabels({ service: process.env.SERVICE_NAME || 'unknown-service' });
client.collectDefaultMetrics({ register }); // CPU, memory, event loop lag, GC

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
});
register.registerMetric(httpRequestDuration);

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestsTotal);

const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP 5xx errors',
  labelNames: ['method', 'route'],
});
register.registerMetric(httpErrorsTotal);

function metricsMiddleware(req, res, next) {
  const start = process.hrtime();
  res.on('finish', () => {
    const [sec, nano] = process.hrtime(start);
    const duration = sec + nano / 1e9;
    const route = req.route ? req.route.path : req.path;

    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
    if (res.statusCode >= 500) {
      httpErrorsTotal.labels(req.method, route).inc();
    }
  });
  next();
}

module.exports = { register, metricsMiddleware };