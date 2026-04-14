// tests/auth.test.js
const request = require('supertest');
const { app, initApp } = require('../src/app');
const db = require('../src/config/database');

beforeAll(async () => {
  await initApp();
});

afterAll(async () => {
  const pool = db.getPool();
  if (pool) {
    await pool.end();
  }
});

describe('Authentication API', () => {
  let authToken;
  let userId;
  
  test('POST /api/auth/register - should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('test@example.com');
    
    userId = res.body.data.user.id;
    authToken = res.body.data.token;
  });
  
  test('POST /api/auth/login - should login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });
  
  test('GET /api/auth/profile - should get user profile', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@example.com');
  });
  
  test('POST /api/auth/logout - should logout user', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});