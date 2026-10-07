const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alumni Tracker API',
      version: '1.0.0',
      description: `
## 🎓 Alumni Tracker — RESTful API Documentation

API for Istanbul Yeni Yüzyıl University Alumni Tracking and Management Platform (Information Systems / YBS).

### System Capabilities
- **API User Management**: RESTful JSON CRUD operations (\`GET\`, \`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`)
- **Web User Management**: Web view profile pages and form submission handlers
- **System Telemetry**: Real-time server diagnostics, CPU core metrics, memory thresholds, and uptime statistics
- **Utility Calculators**: Parameterized greeting and mathematical sum endpoints
- **Presentation Pages**: HTML static and dynamic view routing

### Data & Payload Formats
- REST API responses return standardized **JSON**
- Mutation endpoints (\`POST\`, \`PUT\`, \`PATCH\`) support **application/json**, **multipart/form-data**, and **application/x-www-form-urlencoded**

### HTTP Status Code Conventions
| Status Code | Description |
|:---|:---|
| **200 OK** | Request processed successfully |
| **201 Created** | New resource created and persisted successfully |
| **302 Found** | Web form submission redirect |
| **400 Bad Request** | Missing required fields or invalid input payload |
| **404 Not Found** | Target resource ID does not exist |
| **409 Conflict** | Business constraint violation (e.g. duplicate email) |
      `,
      contact: {
        name: 'Mehmet Raşid Ünlüel',
        url: 'https://github.com/mehmetrasid0'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    tags: [
      { name: 'API Users', description: 'RESTful API User CRUD endpoints (/api/users)' },
      { name: 'Web Users', description: 'Web client user profile view and form actions (/users)' },
      { name: 'Health', description: 'System health diagnostic telemetry endpoints' },
      { name: 'Utility', description: 'Greeting and mathematical utility endpoints' },
      { name: 'Pages', description: 'Client HTML presentation page routes' }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-incremented unique user identifier',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Full name of the alumnus',
              example: 'Ahmet Yilmaz'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Unique email address',
              example: 'ahmet@alumni.edu'
            },
            graduationYear: {
              type: 'integer',
              description: 'Year of graduation',
              example: 2020
            },
            department: {
              type: 'string',
              description: 'Academic department',
              example: 'Computer Engineering'
            },
            company: {
              type: 'string',
              description: 'Current employer company',
              example: 'Google'
            },
            role: {
              type: 'string',
              description: 'Professional job title / role',
              example: 'Software Engineer'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp',
              example: '2026-09-22T10:00:00.000Z'
            }
          }
        },
        UserInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: {
              type: 'string',
              description: 'Full name of the alumnus',
              example: 'Ali Vural'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Unique email address',
              example: 'ali@alumni.edu'
            },
            graduationYear: {
              type: 'integer',
              description: 'Year of graduation',
              example: 2023
            },
            department: {
              type: 'string',
              description: 'Academic department',
              example: 'Software Engineering'
            },
            company: {
              type: 'string',
              description: 'Current employer company',
              example: 'SAP'
            },
            role: {
              type: 'string',
              description: 'Professional job title / role',
              example: 'Backend Developer'
            }
          }
        },
        UserPatch: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Ahmet Yilmaz' },
            email: { type: 'string', format: 'email', example: 'ahmet@alumni.edu' },
            graduationYear: { type: 'integer', example: 2020 },
            department: { type: 'string', example: 'Computer Engineering' },
            company: { type: 'string', example: 'Google' },
            role: { type: 'string', example: 'Lead Software Engineer' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/User' }
          }
        },
        UsersListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            count: { type: 'integer', example: 6 },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message description' }
          }
        }
      }
    },
    paths: {
      '/api/users': {
        get: {
          tags: ['API Users'],
          summary: 'List all alumni users',
          description: 'Retrieves all registered alumni users with optional keyword search and filtering.',
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: false,
              description: 'Keyword search across name, email, company, and role',
              schema: { type: 'string', example: 'Google' }
            },
            {
              name: 'department',
              in: 'query',
              required: false,
              description: 'Filter alumni by academic department',
              schema: { type: 'string', example: 'Computer Engineering' }
            },
            {
              name: 'graduationYear',
              in: 'query',
              required: false,
              description: 'Filter alumni by graduation year',
              schema: { type: 'integer', example: 2020 }
            }
          ],
          responses: {
            '200': {
              description: 'Collection of alumni users retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UsersListResponse' }
                }
              }
            }
          }
        },
        post: {
          tags: ['API Users'],
          summary: 'Create a new alumnus user',
          description: 'Persists a new alumnus record into the data store. Mandatory fields are `name` and `email`. Duplicate emails are rejected.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserInput' }
              },
              'multipart/form-data': {
                schema: { $ref: '#/components/schemas/UserInput' }
              },
              'application/x-www-form-urlencoded': {
                schema: { $ref: '#/components/schemas/UserInput' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Alumnus created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User created successfully' },
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Missing required fields or invalid input payload',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            '409': {
              description: 'Email address is already registered',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/users/{id}': {
        get: {
          tags: ['API Users'],
          summary: 'Get alumnus by ID',
          description: 'Retrieves a single alumnus profile record matching the specified numeric ID.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '200': {
              description: 'Alumnus record found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } }
            },
            '404': {
              description: 'Alumnus not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        put: {
          tags: ['API Users'],
          summary: 'Fully replace an alumnus record',
          description: 'Replaces all attributes of the targeted user. Mandatory fields are `name` and `email`. Non-provided attributes will be set to null.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user identifier',
            schema: { type: 'integer', example: 1 }
          }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserInput' } },
              'multipart/form-data': { schema: { $ref: '#/components/schemas/UserInput' } },
              'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/UserInput' } }
            }
          },
          responses: {
            '200': {
              description: 'Alumnus record updated successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } }
            },
            '400': {
              description: 'Missing required fields or validation failure',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            '404': {
              description: 'Alumnus not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            '409': {
              description: 'Email conflict with another existing alumnus',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        patch: {
          tags: ['API Users'],
          summary: 'Partially update an alumnus record',
          description: 'Updates only the supplied fields on the target alumnus while preserving all other values.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user identifier',
            schema: { type: 'integer', example: 1 }
          }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserPatch' } },
              'multipart/form-data': { schema: { $ref: '#/components/schemas/UserPatch' } },
              'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/UserPatch' } }
            }
          },
          responses: {
            '200': {
              description: 'Alumnus record partially updated successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } }
            },
            '400': {
              description: 'Validation error',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            '404': {
              description: 'Alumnus not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            '409': {
              description: 'Email conflict with another existing alumnus',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        delete: {
          tags: ['API Users'],
          summary: 'Delete an alumnus record',
          description: 'Removes the alumnus record permanently by ID.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '200': {
              description: 'Alumnus record deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User deleted successfully' },
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Alumnus not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/users/{id}': {
        get: {
          tags: ['Web Users'],
          summary: 'Render alumnus HTML profile view',
          description: 'Dispatches to UserController.show() to render an HTML profile card for the target alumnus.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '200': { description: 'Rendered HTML profile page' },
            '404': { description: 'HTML error page when alumnus is not found' }
          }
        }
      },
      '/users': {
        post: {
          tags: ['Web Users'],
          summary: 'Submit web form to create an alumnus',
          description: 'Dispatches to UserController.store() to process browser form data and redirect to /alumni upon success.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': { schema: { $ref: '#/components/schemas/UserInput' } },
              'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/UserInput' } }
            }
          },
          responses: {
            '302': { description: 'Redirects to /alumni directory upon creation' },
            '400': { description: 'HTML error page on validation failure' }
          }
        }
      },
      '/users/{id}/update': {
        post: {
          tags: ['Web Users'],
          summary: 'Submit web form to update an alumnus',
          description: 'Dispatches to UserController.update() to process browser form updates and redirect to /users/{id}.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user identifier',
            schema: { type: 'integer', example: 1 }
          }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': { schema: { $ref: '#/components/schemas/UserPatch' } },
              'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/UserPatch' } }
            }
          },
          responses: {
            '302': { description: 'Redirects to /users/{id} profile view' },
            '400': { description: 'HTML error page on update failure' }
          }
        }
      },
      '/users/{id}/delete': {
        post: {
          tags: ['Web Users'],
          summary: 'Web form action to delete an alumnus',
          description: 'Dispatches to UserController.destroy() to delete the alumnus and redirect to /alumni directory.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '302': { description: 'Redirects to /alumni directory upon deletion' },
            '404': { description: 'HTML error page if alumnus not found' }
          }
        }
      },
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'System health and telemetry status',
          description: 'Returns real-time CPU per-core load, RAM usage, process metrics, OS telemetry, and server uptime. Classifies status as healthy, warning, or critical.',
          responses: {
            '200': {
              description: 'System health report',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', enum: ['healthy', 'warning', 'critical'], example: 'healthy' },
                      timestamp: { type: 'string', format: 'date-time' },
                      checks: { type: 'array', items: { type: 'object' } },
                      server: { type: 'object' },
                      system: { type: 'object' },
                      memory: { type: 'object' },
                      cpu: { type: 'object' },
                      runtime: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/hello/{name}': {
        get: {
          tags: ['Utility'],
          summary: 'Greeting endpoint',
          description: 'Returns a greeting string parameterized with the supplied name.',
          parameters: [{
            name: 'name',
            in: 'path',
            required: true,
            description: 'Name to greet',
            schema: { type: 'string', example: 'Mehmet' }
          }],
          responses: {
            '200': {
              description: 'Greeting response',
              content: { 'text/plain': { schema: { type: 'string', example: 'Hello,Mehmet!' } } }
            }
          }
        }
      },
      '/sum/{number1}/{number2}': {
        get: {
          tags: ['Utility'],
          summary: 'Addition utility',
          description: 'Returns the numerical sum of two numbers provided as path parameters.',
          parameters: [
            {
              name: 'number1',
              in: 'path',
              required: true,
              description: 'First number',
              schema: { type: 'number', example: 5 }
            },
            {
              name: 'number2',
              in: 'path',
              required: true,
              description: 'Second number',
              schema: { type: 'number', example: 3 }
            }
          ],
          responses: {
            '200': {
              description: 'Summation result',
              content: { 'text/plain': { schema: { type: 'string', example: '8' } } }
            }
          }
        }
      },
      '/': {
        get: {
          tags: ['Pages'],
          summary: 'Application landing page',
          description: 'Serves the Alumni Tracker landing page view (index.html).',
          responses: { '200': { description: 'Landing page HTML' } }
        }
      },
      '/about': {
        get: {
          tags: ['Pages'],
          summary: 'About information page',
          description: 'Serves the institutional academic about page view (about.html).',
          responses: { '200': { description: 'About page HTML' } }
        }
      },
      '/alumni': {
        get: {
          tags: ['Pages'],
          summary: 'Alumni directory dashboard',
          description: 'Serves the interactive alumni directory dashboard view (alumni.html).',
          responses: { '200': { description: 'Alumni directory HTML' } }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
