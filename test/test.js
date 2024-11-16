import request from 'supertest'; 
import app from '../app'; 
import User from '../app/model/index.js';

describe('User API Test Cases', () => {

  let createdUserEmail = 'ssa@gmail.com';
  let createdUserPassword = '123';

  // Clean up database before running tests
  beforeAll(async () => {
    await User.sync({ force: true }); // Clear the database for a fresh start
  });

 

  it('should return 400 if fields are missing (POST /user)', async () => {
    const response = await request(app)
      .post('/v2/user')
      .send({
        email: createdUserEmail, // Missing password, first_name, last_name
      });
    expect(response.statusCode).toBe(400);
  });



  it('should return 401 if credentials are incorrect (GET /v2/user/self)', async () => {
    const response = await request(app)
      .get('/v2/user/self')
      .auth('wronguser@example.com', 'wrongpassword');
    expect(response.statusCode).toBe(401);
  });


});
