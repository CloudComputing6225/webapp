import request from 'supertest'; 
import app from '../app'; 
import User from '../app/model/index.js';

describe('User API Test Cases', () => {

  let createdUserEmail = 'ssa';
  let createdUserPassword = '123';

  // Clean up database before running tests
  beforeAll(async () => {
    await User.sync({ force: true }); // Clear the database for a fresh start
  });

  /** USER CREATION TESTS **/
  
  it('should create a new user (POST /v1/user)', async () => {
    const response = await request(app)
      .post('/v1/user')
      .send({
        email: createdUserEmail,
        password: createdUserPassword,
        first_name: 'John',
        last_name: 'Doe'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('email', createdUserEmail);
  });

  it('should return 400 if fields are missing (POST /user)', async () => {
    const response = await request(app)
      .post('/v1/user')
      .send({
        email: createdUserEmail, // Missing password, first_name, last_name
      });
    expect(response.statusCode).toBe(400);
  });

  /** USER AUTHENTICATION TESTS **/

  it('should return user information (GET /v1/user/self)', async () => {
    const response = await request(app)
      .get('/v1/user/self')
      .auth('ssa@gmail.com', '123');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('email', createdUserEmail);
  });

  it('should return 401 if credentials are incorrect (GET /v1/user/self)', async () => {
    const response = await request(app)
      .get('/v1/user/self')
      .auth('wronguser@example.com', 'wrongpassword');
    expect(response.statusCode).toBe(401);
  });

  /** USER UPDATE TESTS **/

  it('should update user information (PUT /v1/user/self)', async () => {
    const response = await request(app)
      .put('/v1/user/self')
      .auth('ssa@gmail.com', '123')
      .send({
        first_name: 'Jane',
        last_name: 'Doe',
        password: 'newpassword123'
      });
    expect(response.statusCode).toBe(204);
  });

  it('should return 400 if no fields are provided for update (PUT /v1/user/self)', async () => {
    const response = await request(app)
      .put('/v1/user/self')
      .auth('ssa@gmail.com', 'newpassword123')
      .send({});
    expect(response.statusCode).toBe(400);
  });

});
