import swaggerJSDoc from 'swagger-jsdoc';
import YAML from 'yaml';

export interface APIEndpoint {
  path: string;
  method: string;
  summary: string;
  description?: string;
  parameters?: any[];
  requestBody?: any;
  responses: Record<string, any>;
  security?: any[];
}

export interface APIVersion {
  version: string;
  status: 'current' | 'deprecated' | 'sunset';
  releaseDate: string;
  changelog: string[];
  breakingChanges?: string[];
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Revolution Network API',
      version: '1.0.0',
      description: 'Comprehensive API for the Revolution Network platform',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://revolutionnetwork.com/api' 
          : 'http://localhost:3000/api',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
      }
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    './src/app/api/**/*.ts', // API routes
    './src/lib/**/*.ts' // Library files
  ],
};

/**
 * Generate OpenAPI specification from JSDoc comments
 */
export function generateOpenAPISpec(): any {
  try {
    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    return swaggerSpec;
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    return null;
  }
}

/**
 * Export OpenAPI spec as JSON
 */
export function exportOpenAPIJSON(): string {
  const spec = generateOpenAPISpec();
  return JSON.stringify(spec, null, 2);
}

/**
 * Export OpenAPI spec as YAML
 */
export function exportOpenAPIYAML(): string {
  const spec = generateOpenAPISpec();
  return YAML.stringify(spec);
}

/**
 * Get API documentation for a specific endpoint
 */
export function getEndpointDocumentation(path: string, method: string): APIEndpoint | null {
  const spec = generateOpenAPISpec();
  if (!spec?.paths?.[path]?.[method.toLowerCase()]) {
    return null;
  }

  return spec.paths[path][method.toLowerCase()];
}

/**
 * Get all available endpoints
 */
export function getAllEndpoints(): APIEndpoint[] {
  const spec = generateOpenAPISpec();
  const endpoints: APIEndpoint[] = [];

  if (spec?.paths) {
    Object.entries(spec.paths).forEach(([path, methods]: [string, any]) => {
      Object.entries(methods).forEach(([method, definition]: [string, any]) => {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: definition.summary || '',
          description: definition.description,
          parameters: definition.parameters,
          requestBody: definition.requestBody,
          responses: definition.responses,
          security: definition.security
        });
      });
    });
  }

  return endpoints;
}

/**
 * Get API versions and their status
 */
export function getAPIVersions(): APIVersion[] {
  return [
    {
      version: 'v1.0.0',
      status: 'current',
      releaseDate: '2024-01-15',
      changelog: [
        'Initial API release',
        'Authentication endpoints',
        'User management',
        'Project management',
        'Payment processing'
      ]
    },
    {
      version: 'v0.9.0',
      status: 'deprecated',
      releaseDate: '2023-12-01',
      changelog: [
        'Beta API release',
        'Basic endpoints',
        'Limited functionality'
      ],
      breakingChanges: [
        'Authentication format changed',
        'Response structure updated'
      ]
    }
  ];
}

/**
 * Validate API request against OpenAPI spec
 */
export function validateAPIRequest(
  path: string,
  method: string,
  body?: any,
  query?: Record<string, string>
): { valid: boolean; errors: string[] } {
  const endpoint = getEndpointDocumentation(path, method);
  const errors: string[] = [];

  if (!endpoint) {
    errors.push(`Endpoint ${method.toUpperCase()} ${path} not found`);
    return { valid: false, errors };
  }

  // Validate request body
  if (body && endpoint.requestBody) {
    const requiredFields = endpoint.requestBody.content?.['application/json']?.schema?.required || [];
    requiredFields.forEach((field: string) => {
      if (!body[field]) {
        errors.push(`Required field '${field}' is missing`);
      }
    });
  }

  // Validate query parameters
  if (query && endpoint.parameters) {
    const requiredParams = endpoint.parameters.filter((p: any) => p.required);
    requiredParams.forEach((param: any) => {
      if (!query[param.name]) {
        errors.push(`Required parameter '${param.name}' is missing`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generate API usage statistics
 */
export function getAPIUsageStats(): {
  totalEndpoints: number;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  topEndpoints: Array<{ endpoint: string; requests: number }>;
} {
  // In production, this would fetch from analytics
  return {
    totalEndpoints: 25,
    totalRequests: 125000,
    averageResponseTime: 145,
    errorRate: 0.02,
    topEndpoints: [
      { endpoint: 'GET /user/profile', requests: 15000 },
      { endpoint: 'GET /projects', requests: 12000 },
      { endpoint: 'POST /donations', requests: 8000 },
      { endpoint: 'GET /letters', requests: 7500 },
      { endpoint: 'POST /auth/signin', requests: 6000 }
    ]
  };
}

/**
 * Generate SDK code examples
 */
export function generateSDKExamples(endpoint: APIEndpoint, language: 'javascript' | 'python' | 'ruby'): string {
  const { path, method } = endpoint;
  
  switch (language) {
    case 'javascript':
      return generateJavaScriptExample(path, method);
    case 'python':
      return generatePythonExample(path, method);
    case 'ruby':
      return generateRubyExample(path, method);
    default:
      return '';
  }
}

function generateJavaScriptExample(path: string, method: string): string {
  return `
// JavaScript/Node.js Example
const response = await fetch('${path}', {
  method: '${method.toUpperCase()}',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({
    // Request body here
  })
});

const data = await response.json();
console.log(data);
  `.trim();
}

function generatePythonExample(path: string, method: string): string {
  return `
# Python Example
import requests

url = 'https://revolutionnetwork.com/api${path}'
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
}

response = requests.${method.toLowerCase()}(url, headers=headers, json={
    # Request body here
})

data = response.json()
print(data)
  `.trim();
}

function generateRubyExample(path: string, method: string): string {
  return `
# Ruby Example
require 'net/http'
require 'json'

uri = URI('https://revolutionnetwork.com/api${path}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::${method.capitalize}.new(uri)
request['Content-Type'] = 'application/json'
request['X-API-Key'] = 'your-api-key-here'
request.body = {
  # Request body here
}.to_json

response = http.request(request)
data = JSON.parse(response.body)
puts data
  `.trim();
}

export default {
  generateOpenAPISpec,
  exportOpenAPIJSON,
  exportOpenAPIYAML,
  getEndpointDocumentation,
  getAllEndpoints,
  getAPIVersions,
  validateAPIRequest,
  getAPIUsageStats,
  generateSDKExamples
};
