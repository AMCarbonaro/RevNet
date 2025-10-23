import { NextRequest, NextResponse } from 'next/server';

export interface ServiceConfig {
  name: string;
  url: string;
  healthCheck: string;
  timeout: number;
  retries: number;
  circuitBreaker?: {
    threshold: number;
    timeout: number;
    resetTimeout: number;
  };
}

export interface GatewayRequest {
  service: string;
  endpoint: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

class APIGateway {
  private services: Map<string, ServiceConfig> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    const serviceConfigs: ServiceConfig[] = [
      {
        name: 'auth-service',
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        circuitBreaker: {
          threshold: 5,
          timeout: 10000,
          resetTimeout: 30000
        }
      },
      {
        name: 'project-service',
        url: process.env.PROJECT_SERVICE_URL || 'http://localhost:3002',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        circuitBreaker: {
          threshold: 5,
          timeout: 10000,
          resetTimeout: 30000
        }
      },
      {
        name: 'payment-service',
        url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        circuitBreaker: {
          threshold: 5,
          timeout: 10000,
          resetTimeout: 30000
        }
      },
      {
        name: 'notification-service',
        url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        circuitBreaker: {
          threshold: 5,
          timeout: 10000,
          resetTimeout: 30000
        }
      },
      {
        name: 'collaboration-service',
        url: process.env.COLLABORATION_SERVICE_URL || 'http://localhost:3005',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        circuitBreaker: {
          threshold: 5,
          timeout: 10000,
          resetTimeout: 30000
        }
      }
    ];

    serviceConfigs.forEach(config => {
      this.services.set(config.name, config);
      this.circuitBreakers.set(config.name, new CircuitBreaker(config.circuitBreaker!));
      this.rateLimiters.set(config.name, new RateLimiter(1000, 3600000)); // 1000 requests per hour
    });
  }

  /**
   * Route request to appropriate microservice
   */
  async routeRequest(request: GatewayRequest): Promise<NextResponse> {
    const service = this.services.get(request.service);
    if (!service) {
      return NextResponse.json(
        { error: `Service '${request.service}' not found` },
        { status: 404 }
      );
    }

    // Check circuit breaker
    const circuitBreaker = this.circuitBreakers.get(request.service);
    if (circuitBreaker && circuitBreaker.isOpen()) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable', service: request.service },
        { status: 503 }
      );
    }

    // Check rate limiting
    const rateLimiter = this.rateLimiters.get(request.service);
    if (rateLimiter && !rateLimiter.isAllowed()) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    try {
      const response = await this.makeRequest(service, request);
      
      // Record success for circuit breaker
      circuitBreaker?.recordSuccess();
      
      return response;
    } catch (error: any) {
      // Record failure for circuit breaker
      circuitBreaker?.recordFailure();
      
      console.error(`Gateway error for service ${request.service}:`, error);
      
      return NextResponse.json(
        { error: 'Internal server error', service: request.service },
        { status: 500 }
      );
    }
  }

  /**
   * Make HTTP request to microservice
   */
  private async makeRequest(service: ServiceConfig, request: GatewayRequest): Promise<NextResponse> {
    const url = `${service.url}${request.endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), service.timeout);

    try {
      const response = await fetch(url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: request.body ? JSON.stringify(request.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<Record<string, any>> {
    const healthStatus: Record<string, any> = {};

    for (const [serviceName, service] of this.services) {
      try {
        const response = await fetch(`${service.url}${service.healthCheck}`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });

        healthStatus[serviceName] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime: Date.now(),
          url: service.url
        };
      } catch (error) {
        healthStatus[serviceName] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          url: service.url
        };
      }
    }

    return healthStatus;
  }

  /**
   * Get service metrics
   */
  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};

    for (const [serviceName, circuitBreaker] of this.circuitBreakers) {
      metrics[serviceName] = {
        circuitBreaker: {
          state: circuitBreaker.getState(),
          failures: circuitBreaker.getFailures(),
          successes: circuitBreaker.getSuccesses()
        }
      };
    }

    return metrics;
  }
}

/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(private config: { threshold: number; timeout: number; resetTimeout: number }) {}

  isOpen(): boolean {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.successes++;
    if (this.state === 'half-open') {
      this.state = 'closed';
      this.failures = 0;
    }
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.threshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  getSuccesses(): number {
    return this.successes;
  }
}

/**
 * Rate Limiter implementation
 */
class RateLimiter {
  private requests: number[] = [];

  constructor(private limit: number, private window: number) {}

  isAllowed(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.window);
    
    if (this.requests.length >= this.limit) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getRemaining(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);
    return Math.max(0, this.limit - this.requests.length);
  }

  getResetTime(): number {
    if (this.requests.length === 0) return Date.now();
    return this.requests[0] + this.window;
  }
}

// Singleton instance
let gatewayInstance: APIGateway | null = null;

export function getAPIGateway(): APIGateway {
  if (!gatewayInstance) {
    gatewayInstance = new APIGateway();
  }
  return gatewayInstance;
}

export default APIGateway;
