const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alumni Tracker API',
      version: '1.0.0',
      description: `
## 🎓 Alumni Tracker — RESTful API Dokümantasyonu

İstanbul Yeni Yüzyıl Üniversitesi mezun takip ve yönetim platformu API'si.

### Özellikler
- **Kullanıcı Yönetimi**: CRUD işlemleri (GET, POST, PUT, PATCH, DELETE)
- **Sistem Sağlığı**: Sunucu durumu, CPU, bellek ve çalışma süresi bilgileri
- **Yardımcı Araçlar**: Hello ve toplama endpoint'leri

### Veri Formatı
- Tüm yanıtlar **JSON** formatındadır
- POST/PUT/PATCH istekleri **JSON**, **form-data** veya **x-www-form-urlencoded** kabul eder

### Durum Kodları
| Kod | Açıklama |
|-----|----------|
| 200 | Başarılı |
| 201 | Oluşturuldu |
| 400 | Geçersiz istek |
| 404 | Bulunamadı |
| 409 | Çakışma (duplicate) |
      `,
      contact: {
        name: 'Mehmet Raşid',
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
      { name: 'Health', description: 'Sistem sağlık kontrol endpoint\'leri' },
      { name: 'Users', description: 'Kullanıcı CRUD işlemleri' },
      { name: 'Utility', description: 'Yardımcı araçlar' },
      { name: 'Pages', description: 'HTML sayfa endpoint\'leri' }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'Otomatik artan kullanıcı ID',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Kullanıcının ad soyad bilgisi',
              example: 'Ahmet Yılmaz'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Benzersiz email adresi',
              example: 'ahmet@alumni.edu'
            },
            graduationYear: {
              type: 'integer',
              description: 'Mezuniyet yılı',
              example: 2020
            },
            department: {
              type: 'string',
              description: 'Bölüm adı',
              example: 'Bilgisayar Mühendisliği'
            },
            company: {
              type: 'string',
              description: 'Çalıştığı şirket',
              example: 'Google'
            },
            role: {
              type: 'string',
              description: 'İş pozisyonu',
              example: 'Software Engineer'
            }
          }
        },
        UserInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: {
              type: 'string',
              description: 'Kullanıcının ad soyad bilgisi',
              example: 'Ali Vural'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Benzersiz email adresi',
              example: 'ali@alumni.edu'
            },
            graduationYear: {
              type: 'integer',
              description: 'Mezuniyet yılı',
              example: 2023
            },
            department: {
              type: 'string',
              description: 'Bölüm adı',
              example: 'Yazılım Mühendisliği'
            },
            company: {
              type: 'string',
              description: 'Çalıştığı şirket',
              example: 'SAP'
            },
            role: {
              type: 'string',
              description: 'İş pozisyonu',
              example: 'Backend Developer'
            }
          }
        },
        UserPatch: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Ahmet Yılmaz' },
            email: { type: 'string', format: 'email', example: 'ahmet@alumni.edu' },
            graduationYear: { type: 'integer', example: 2020 },
            department: { type: 'string', example: 'Bilgisayar Mühendisliği' },
            company: { type: 'string', example: 'Google' },
            role: { type: 'string', example: 'Software Engineer' }
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
            error: { type: 'string', example: 'Hata mesajı' }
          }
        }
      }
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Sistem sağlık durumu',
          description: 'Sunucu, CPU, bellek, işletim sistemi ve Node.js runtime bilgilerini döndürür. Bellek kullanımına göre healthy/warning/critical durumu belirler.',
          responses: {
            '200': {
              description: 'Sistem sağlık bilgileri',
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
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Tüm kullanıcıları listele',
          description: 'Sistemdeki tüm kayıtlı kullanıcıları döndürür.',
          responses: {
            '200': {
              description: 'Kullanıcı listesi',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UsersListResponse' }
                }
              }
            }
          }
        },
        post: {
          tags: ['Users'],
          summary: 'Yeni kullanıcı ekle',
          description: 'Yeni bir kullanıcı kaydı oluşturur. `name` ve `email` zorunludur. Aynı email ile tekrar kayıt yapılamaz.',
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
              description: 'Kullanıcı başarıyla oluşturuldu',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Kullanıcı başarıyla eklendi' },
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Zorunlu alanlar eksik',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            '409': {
              description: 'Email zaten kayıtlı',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Tek kullanıcı getir',
          description: 'Belirtilen ID\'ye sahip kullanıcıyı döndürür.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Kullanıcı ID',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '200': {
              description: 'Kullanıcı bulundu',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } }
            },
            '404': {
              description: 'Kullanıcı bulunamadı',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        put: {
          tags: ['Users'],
          summary: 'Kullanıcıyı tamamen güncelle',
          description: 'Tüm alanları yeniden göndermeniz gerekir. Gönderilmeyen alanlar `null` olur. `name` ve `email` zorunludur.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Kullanıcı ID',
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
              description: 'Kullanıcı güncellendi',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } }
            },
            '400': {
              description: 'Zorunlu alanlar eksik',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            '404': {
              description: 'Kullanıcı bulunamadı',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            '409': {
              description: 'Email çakışması',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        patch: {
          tags: ['Users'],
          summary: 'Kullanıcıyı kısmi güncelle',
          description: 'Sadece güncellemek istediğiniz alanları gönderin. Gönderilmeyen alanlar değişmez.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Kullanıcı ID',
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
              description: 'Kullanıcı kısmi güncellendi',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } }
            },
            '404': {
              description: 'Kullanıcı bulunamadı',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            '409': {
              description: 'Email çakışması',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        delete: {
          tags: ['Users'],
          summary: 'Kullanıcı sil',
          description: 'Belirtilen ID\'ye sahip kullanıcıyı kalıcı olarak siler.',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            description: 'Kullanıcı ID',
            schema: { type: 'integer', example: 1 }
          }],
          responses: {
            '200': {
              description: 'Kullanıcı silindi',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Ahmet Yılmaz başarıyla silindi' },
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Kullanıcı bulunamadı',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/hello/{name}': {
        get: {
          tags: ['Utility'],
          summary: 'Selamlama',
          description: 'Verilen isimle bir selamlama mesajı döndürür.',
          parameters: [{
            name: 'name',
            in: 'path',
            required: true,
            description: 'Selamlanacak isim',
            schema: { type: 'string', example: 'Mehmet' }
          }],
          responses: {
            '200': {
              description: 'Selamlama mesajı',
              content: { 'text/plain': { schema: { type: 'string', example: 'Hello,Mehmet!' } } }
            }
          }
        }
      },
      '/sum/{number1}/{number2}': {
        get: {
          tags: ['Utility'],
          summary: 'İki sayı topla',
          description: 'URL parametrelerinde verilen iki sayının toplamını döndürür.',
          parameters: [
            {
              name: 'number1',
              in: 'path',
              required: true,
              description: 'Birinci sayı',
              schema: { type: 'number', example: 5 }
            },
            {
              name: 'number2',
              in: 'path',
              required: true,
              description: 'İkinci sayı',
              schema: { type: 'number', example: 3 }
            }
          ],
          responses: {
            '200': {
              description: 'Toplam sonucu',
              content: { 'text/plain': { schema: { type: 'string', example: '8' } } }
            }
          }
        }
      },
      '/': {
        get: {
          tags: ['Pages'],
          summary: 'Ana sayfa',
          description: 'Alumni Tracker ana sayfasını (index.html) döndürür.',
          responses: { '200': { description: 'HTML ana sayfa' } }
        }
      },
      '/about': {
        get: {
          tags: ['Pages'],
          summary: 'Hakkında sayfası',
          description: 'Hakkında sayfasını (about.html) döndürür.',
          responses: { '200': { description: 'HTML hakkında sayfası' } }
        }
      },
      '/alumni': {
        get: {
          tags: ['Pages'],
          summary: 'Mezunlar arayüzü',
          description: 'Mezunları görsel kartlar halinde gösteren arayüz sayfasını döndürür.',
          responses: { '200': { description: 'HTML mezunlar sayfası' } }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
