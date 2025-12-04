/**
 * Script to create a test user
 * Run with: npx tsx src/scripts/create-test-user.ts
 */

import 'dotenv/config';
import { userService } from '../services/user.service';

async function createTestUser() {
  try {
    const user = await userService.createUser({
      email: 'test@llatria.com',
      password: 'test1234',
      name: 'Test User',
    });

    console.log('✅ Test user created successfully!');
    console.log('Email:', user.email);
    console.log('ID:', user.id);
    console.log('\nYou can now login with:');
    console.log('Email: test@llatria.com');
    console.log('Password: test1234');
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Test user already exists');
      console.log('Email: test@llatria.com');
      console.log('Password: test1234');
    } else {
      console.error('❌ Error creating test user:', error.message);
      process.exit(1);
    }
  }
}

createTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

