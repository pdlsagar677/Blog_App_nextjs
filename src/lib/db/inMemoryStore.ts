// src/lib/db/inMemoryStore.ts
import bcryptjs from 'bcryptjs';

type User = {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: 'male' | 'female' | 'other';
  passwordHash: string;
  isAdmin: boolean;
  createdAt: Date;
};

type Session = {
  token: string;
  userId: string;
  createdAt: number;
};

// Function to initialize admin user from environment variables
const initializeAdminUser = (): User | null => {
  // Only create admin user if all required env variables are present
  if (
    process.env.ADMIN_USERNAME &&
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_PHONE &&
    process.env.ADMIN_GENDER
  ) {
    try {
      // For development, use a simple approach. In production, use proper hashing
      // Note: In a real app, you should hash this asynchronously
      const passwordHash = bcryptjs.hashSync(process.env.ADMIN_PASSWORD, 12);
      
      return {
        id: 'admin-1',
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        phoneNumber: process.env.ADMIN_PHONE,
        gender: process.env.ADMIN_GENDER as 'male' | 'female' | 'other',
        passwordHash: passwordHash,
        isAdmin: true,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating admin user:', error);
      return null;
    }
  }
  
  console.warn('Admin credentials not found in environment variables. Please check your .env.local file.');
  return null;
};

export const db = {
  users: new Map<string, User>(),
  sessions: new Map<string, Session>(),
};

// Initialize admin user when the module loads
const adminUser = initializeAdminUser();
if (adminUser) {
  db.users.set(adminUser.id, adminUser);
  console.log('✅ Admin user initialized from environment variables');
} else {
  console.warn('❌ No admin user created. Please check your environment variables in .env.local');
}

// Helper to create UUIDs (simple version)
export const generateId = () => Math.random().toString(36).slice(2);

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

export const isUsernameTaken = (username: string): boolean => {
  return [...db.users.values()].some(user => 
    user.username.toLowerCase() === username.toLowerCase()
  );
};

export const isEmailTaken = (email: string): boolean => {
  return [...db.users.values()].some(user => 
    user.email.toLowerCase() === email.toLowerCase()
  );
};

export const isPhoneNumberTaken = (phoneNumber: string): boolean => {
  return [...db.users.values()].some(user => 
    user.phoneNumber === phoneNumber
  );
};

// User creation with validation
export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): { success: boolean; user?: User; error?: string } => {
  // Validate email format
  if (!validateEmail(userData.email)) {
    return { success: false, error: 'Invalid email format' };
  }

  // Validate phone number format
  if (!validatePhoneNumber(userData.phoneNumber)) {
    return { success: false, error: 'Phone number must be exactly 10 digits' };
  }

  // Check if username already exists
  if (isUsernameTaken(userData.username)) {
    return { success: false, error: 'Username already exists' };
  }

  // Check if email already exists
  if (isEmailTaken(userData.email)) {
    return { success: false, error: 'Email already exists' };
  }

  // Check if phone number already exists
  if (isPhoneNumberTaken(userData.phoneNumber)) {
    return { success: false, error: 'Phone number already exists' };
  }

  // Create new user
  const newUser: User = {
    ...userData,
    id: generateId(),
    createdAt: new Date(),
  };

  db.users.set(newUser.id, newUser);
  return { success: true, user: newUser };
};

// Find user by various fields
export const findUserByUsername = (username: string): User | undefined => {
  return [...db.users.values()].find(user => 
    user.username.toLowerCase() === username.toLowerCase()
  );
};

export const findUserByEmail = (email: string): User | undefined => {
  return [...db.users.values()].find(user => 
    user.email.toLowerCase() === email.toLowerCase()
  );
};

export const findUserByPhone = (phoneNumber: string): User | undefined => {
  return [...db.users.values()].find(user => 
    user.phoneNumber === phoneNumber
  );
};

// Get all users (for admin purposes)
export const getAllUsers = (): User[] => {
  return [...db.users.values()];
};

// Delete user (for admin purposes)
export const deleteUser = (userId: string): boolean => {
  return db.users.delete(userId);
};

// Make user admin
export const makeUserAdmin = (userId: string): boolean => {
  const user = db.users.get(userId);
  if (user) {
    user.isAdmin = true;
    db.users.set(userId, user);
    return true;
  }
  return false;
};

// Remove admin privileges
export const removeUserAdmin = (userId: string): boolean => {
  const user = db.users.get(userId);
  if (user && user.id !== 'admin-1') { // Prevent removing main admin
    user.isAdmin = false;
    db.users.set(userId, user);
    return true;
  }
  return false;
};

// Get admin users
export const getAdminUsers = (): User[] => {
  return [...db.users.values()].filter(user => user.isAdmin);
};

// Verify password
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return bcryptjs.compareSync(password, hashedPassword);
};

// Check if user is admin
export const isUserAdmin = (userId: string): boolean => {
  const user = db.users.get(userId);
  return user ? user.isAdmin : false;
};