const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alumni Tracker API',
      version: '1.0.0',
      description: `
## 🎓 Alumni Tracker — RESTful API Documentation

API for Istanbul University Alumni Tracking and Management Platform (Management Information Systems / YBS).

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
      { name: 'API Announcements', description: 'RESTful API Announcement CRUD endpoints (/api/announcements)' },
      { name: 'Web Announcements', description: 'Web Announcement Management Interface and form actions (/announcements)' },
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
        },
        Announcement: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-incremented unique announcement identifier',
              example: 1
            },
            title: {
              type: 'string',
              description: 'Title of the announcement',
              example: 'Annual Alumni Homecoming & Networking Gala 2026'
            },
            content: {
              type: 'string',
              description: 'Full body content and details of the announcement',
              example: 'Join us on the historic Beyazit Campus for the annual Istanbul University Alumni Reunion.'
            },
            category: {
              type: 'string',
              description: 'Classification category (Event, Career, Academic, Networking, General)',
              example: 'Event'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Priority urgency level',
              example: 'high'
            },
            status: {
              type: 'string',
              enum: ['published', 'draft', 'archived'],
              description: 'Publication state',
              example: 'published'
            },
            author: {
              type: 'string',
              description: 'Author or issuing university department',
              example: 'Istanbul University Alumni Office'
            },
            targetAudience: {
              type: 'string',
              description: 'Intended target audience',
              example: 'All Alumni & Faculty'
            },
            pinned: {
              type: 'boolean',
              description: 'Whether announcement is pinned to top of listings',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-09-15T09:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: null
            }
          }
        },
        AnnouncementInput: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: {
              type: 'string',
              example: 'Alumni Mentorship Applications Now Open'
            },
            content: {
              type: 'string',
              example: 'Apply now to mentor final-year students in Management Information Systems.'
            },
            category: {
              type: 'string',
              example: 'Networking'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'high'
            },
            status: {
              type: 'string',
              enum: ['published', 'draft', 'archived'],
              example: 'published'
            },
            author: {
              type: 'string',
              example: 'Istanbul University Alumni Office'
            },
            targetAudience: {
              type: 'string',
              example: 'Alumni with 2+ Years Experience'
            },
            pinned: {
              type: 'boolean',
              example: false
            }
          }
        },
        AnnouncementPatch: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Updated Title' },
            content: { type: 'string', example: 'Updated content body' },
            category: { type: 'string', example: 'Career' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'urgent' },
            status: { type: 'string', enum: ['published', 'draft', 'archived'], example: 'published' },
            author: { type: 'string', example: 'YBS Career Center' },
            targetAudience: { type: 'string', example: 'Graduating Students' },
            pinned: { type: 'boolean', example: true }
          }
        },
        AnnouncementSuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/Announcement' }
          }
        },
        AnnouncementListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            count: { type: 'integer', example: 5 },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Announcement' }
            }
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
      '/users/create': {
        get: {
          tags: ['Web Users'],
          summary: 'Render new alumnus creation form view',
          description: 'Dispatches to UserController.create() to render the HTML registration form for adding a new alumnus.',
          responses: {
            '200': { description: 'Rendered HTML form view for creating an alumnus' }
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
      '/users/{id}/edit': {
        get: {
          tags: ['Web Users'],
          summary: 'Render alumnus edit form view',
          description: 'Dispatches to UserController.edit() to render a pre-populated HTML form for modifying the specified alumnus.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '200': { description: 'Rendered HTML edit form pre-filled with current alumni details' },
            '404': { description: 'HTML error view if alumnus is not found' }
          }
        }
      },
      '/users': {
        get: {
          tags: ['Web Users'],
          summary: 'Display alumni directory view (Listing)',
          description: 'Dispatches to UserController.index() to serve the interactive alumni directory HTML view (View Layer).',
          responses: {
            '200': {
              description: 'Rendered HTML presentation view listing all alumni records'
            }
          }
        },
        post: {
          tags: ['Web Users'],
          summary: 'Submit web form to create an alumnus (Creating)',
          description: 'Dispatches to UserController.store() to process browser form data, persist via User Model, and redirect to /users (View Layer).',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': { schema: { $ref: '#/components/schemas/UserInput' } },
              'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/UserInput' } },
              'application/json': { schema: { $ref: '#/components/schemas/UserInput' } }
            }
          },
          responses: {
            '302': { description: 'Redirects to /users alumni directory view upon successful creation' },
            '400': { description: 'HTML error view on validation or missing required fields' },
            '409': { description: 'HTML error view on duplicate email conflict' }
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
          description: 'Dispatches to UserController.destroy() to delete the alumnus and redirect to /users directory.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '302': { description: 'Redirects to /users directory upon deletion' },
            '404': { description: 'HTML error page if alumnus not found' }
          }
        },
        get: {
          tags: ['Web Users'],
          summary: 'Direct link action to delete an alumnus',
          description: 'Dispatches to UserController.destroy() to delete the alumnus and redirect to /users directory.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '302': { description: 'Redirects to /users directory upon deletion' },
            '404': { description: 'HTML error page if alumnus not found' }
          }
        }
      },
      '/api/announcements': {
        get: {
          tags: ['API Announcements'],
          summary: 'List all announcements',
          description: 'Retrieves all campus and alumni announcements with optional keyword search and filtering by category, status, and priority.',
          parameters: [
            {
              name: 'query',
              in: 'query',
              required: false,
              description: 'Keyword search across title, content, author, and category',
              schema: { type: 'string', example: 'Career' }
            },
            {
              name: 'category',
              in: 'query',
              required: false,
              description: 'Filter by category (Event, Career, Academic, Networking, General)',
              schema: { type: 'string', example: 'Event' }
            },
            {
              name: 'priority',
              in: 'query',
              required: false,
              description: 'Filter by priority level (low, medium, high, urgent)',
              schema: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] }
            },
            {
              name: 'status',
              in: 'query',
              required: false,
              description: 'Filter by publication status (published, draft, archived)',
              schema: { type: 'string', enum: ['published', 'draft', 'archived'] }
            }
          ],
          responses: {
            '200': {
              description: 'List of announcements retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AnnouncementListResponse' }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        post: {
          tags: ['API Announcements'],
          summary: 'Create a new announcement',
          description: 'Creates and persists a new announcement record in-memory.',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AnnouncementInput' } },
              'multipart/form-data': { schema: { $ref: '#/components/schemas/AnnouncementInput' } },
              'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/AnnouncementInput' } }
            }
          },
          responses: {
            '201': {
              description: 'Announcement created successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/AnnouncementSuccessResponse' } }
              }
            },
            '400': {
              description: 'Validation failed or missing required fields',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/announcements/{id}': {
        get: {
          tags: ['API Announcements'],
          summary: 'Get announcement by ID',
          description: 'Retrieves a single announcement by its numeric identifier.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric announcement identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '200': {
              description: 'Announcement retrieved successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AnnouncementSuccessResponse' } } }
            },
            '404': {
              description: 'Announcement not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        put: {
          tags: ['API Announcements'],
          summary: 'Fully update an announcement',
          description: 'Replaces all attributes of the target announcement (requires title and content).',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric announcement identifier',
            schema: { type: 'integer', example: 1 }
          }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AnnouncementInput' } },
              'multipart/form-data': { schema: { $ref: '#/components/schemas/AnnouncementInput' } },
              'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/AnnouncementInput' } }
            }
          },
          responses: {
            '200': {
              description: 'Announcement updated successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AnnouncementSuccessResponse' } } }
            },
            '400': { description: 'Validation failed' },
            '404': { description: 'Announcement not found' }
          }
        },
        patch: {
          tags: ['API Announcements'],
          summary: 'Partially update an announcement',
          description: 'Modifies specific attributes of the target announcement.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric announcement identifier',
            schema: { type: 'integer', example: 1 }
          }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AnnouncementPatch' } },
              'multipart/form-data': { schema: { $ref: '#/components/schemas/AnnouncementPatch' } },
              'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/AnnouncementPatch' } }
            }
          },
          responses: {
            '200': {
              description: 'Announcement patched successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AnnouncementSuccessResponse' } } }
            },
            '400': { description: 'Invalid payload' },
            '404': { description: 'Announcement not found' }
          }
        },
        delete: {
          tags: ['API Announcements'],
          summary: 'Delete an announcement',
          description: 'Permanently removes the target announcement by numeric ID.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric announcement identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '200': {
              description: 'Announcement deleted successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AnnouncementSuccessResponse' } } }
            },
            '404': { description: 'Announcement not found' }
          }
        }
      },
      '/announcements': {
        get: {
          tags: ['Web Announcements'],
          summary: 'Render Announcement Management Interface',
          description: 'Dispatches to AnnouncementController.index() to serve the interactive web management dashboard (announcements.html).',
          responses: {
            '200': { description: 'Rendered HTML Announcement Management Interface' }
          }
        },
        post: {
          tags: ['Web Announcements'],
          summary: 'Submit web form to create an announcement',
          description: 'Dispatches to AnnouncementController.store() to process browser form data, create announcement, and redirect to /announcements.',
          requestBody: {
            required: true,
            content: {
              'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/AnnouncementInput' } },
              'multipart/form-data': { schema: { $ref: '#/components/schemas/AnnouncementInput' } },
              'application/json': { schema: { $ref: '#/components/schemas/AnnouncementInput' } }
            }
          },
          responses: {
            '302': { description: 'Redirects to /announcements upon creation' },
            '400': { description: 'HTML error page on validation failure' }
          }
        }
      },
      '/announcements/create': {
        get: {
          tags: ['Web Announcements'],
          summary: 'Render announcement creation form view',
          description: 'Dispatches to AnnouncementController.create() to render the HTML form view for authoring an announcement.',
          responses: {
            '200': { description: 'Rendered HTML authoring form view' }
          }
        }
      },
      '/announcements/{id}': {
        get: {
          tags: ['Web Announcements'],
          summary: 'Render announcement detail view',
          description: 'Dispatches to AnnouncementController.show() to render an HTML presentation card for the specified announcement.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric announcement identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '200': { description: 'Rendered HTML detail page' },
            '404': { description: 'HTML error page if announcement not found' }
          }
        }
      },
      '/announcements/{id}/edit': {
        get: {
          tags: ['Web Announcements'],
          summary: 'Render announcement edit form view',
          description: 'Dispatches to AnnouncementController.edit() to render a pre-populated HTML edit form for modifying the announcement.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric announcement identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '200': { description: 'Rendered HTML edit form view' },
            '404': { description: 'HTML error page if announcement not found' }
          }
        }
      },
      '/announcements/{id}/update': {
        post: {
          tags: ['Web Announcements'],
          summary: 'Submit web form to update an announcement',
          description: 'Dispatches to AnnouncementController.update() to process browser form updates and redirect to /announcements/{id}.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric announcement identifier',
            schema: { type: 'integer', example: 1 }
          }],
          requestBody: {
            required: true,
            content: {
              'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/AnnouncementPatch' } },
              'multipart/form-data': { schema: { $ref: '#/components/schemas/AnnouncementPatch' } }
            }
          },
          responses: {
            '302': { description: 'Redirects to /announcements/{id} detail view upon update' },
            '400': { description: 'HTML error page on update failure' }
          }
        }
      },
      '/announcements/{id}/delete': {
        post: {
          tags: ['Web Announcements'],
          summary: 'Web form action to delete an announcement',
          description: 'Dispatches to AnnouncementController.destroy() to delete the announcement and redirect to /announcements.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric announcement identifier',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '302': { description: 'Redirects to /announcements management interface upon deletion' },
            '404': { description: 'HTML error page if announcement not found' }
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
