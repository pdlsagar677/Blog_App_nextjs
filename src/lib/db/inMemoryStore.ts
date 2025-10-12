// src/lib/db/inMemoryStore.ts
import bcryptjs from 'bcryptjs';
import fs from 'fs';
import path from 'path';

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

// Data file path - use relative path instead of process.cwd()
const DATA_FILE = path.join(process.cwd(), 'data', 'users-data.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load data from file
const loadData = () => {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Convert date strings back to Date objects for users
      const users = new Map<string, User>();
      Object.entries(parsed.users || {}).forEach(([id, userData]: [string, any]) => {
        users.set(id, {
          ...userData,
          createdAt: new Date(userData.createdAt)
        });
      });
      
      // Convert sessions
      const sessions = new Map<string, Session>();
      Object.entries(parsed.sessions || {}).forEach(([token, sessionData]: [string, any]) => {
        sessions.set(token, sessionData as Session);
      });
      
      return { users, sessions };
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  
  return { users: new Map<string, User>(), sessions: new Map<string, Session>() };
};

// Save data to file
const saveData = () => {
  try {
    ensureDataDirectory();
    
    // Convert Maps to plain objects for JSON serialization
    const usersObj: Record<string, any> = {};
    db.users.forEach((user, id) => {
      usersObj[id] = {
        ...user,
        createdAt: user.createdAt.toISOString() // Convert Date to string
      };
    });
    
    const sessionsObj: Record<string, Session> = {};
    db.sessions.forEach((session, token) => {
      sessionsObj[token] = session;
    });
    
    const dataToSave = {
      users: usersObj,
      sessions: sessionsObj,
      lastSaved: new Date().toISOString()
    };
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    console.log('💾 Users data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Initialize database with loaded data
const loadedData = loadData();
export const db = {
  users: loadedData.users,
  sessions: loadedData.sessions,
};

// Save data automatically every 30 seconds (only in Node.js environment)
if (typeof window === 'undefined') {
  setInterval(saveData, 30000);
}

// Function to initialize admin user from environment variables
const initializeAdminUser = (): User | null => {
  if (
    process.env.ADMIN_USERNAME &&
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_PHONE &&
    process.env.ADMIN_GENDER
  ) {
    try {
      const passwordHash = bcryptjs.hashSync(process.env.ADMIN_PASSWORD, 12);
      
      const adminUser: User = {
        id: 'admin-1',
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        phoneNumber: process.env.ADMIN_PHONE,
        gender: process.env.ADMIN_GENDER as 'male' | 'female' | 'other',
        passwordHash: passwordHash,
        isAdmin: true,
        createdAt: new Date()
      };

      // Only add admin user if it doesn't exist
      if (!db.users.has('admin-1')) {
        db.users.set('admin-1', adminUser);
        saveData(); // Save after adding admin user
        console.log('✅ Admin user initialized from environment variables');
      } else {
        console.log('✅ Admin user already exists');
      }
      
      return adminUser;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return null;
    }
  }
  
  console.warn('❌ Admin credentials not found in environment variables. Please check your .env.local file.');
  return null;
};

// Initialize admin user when the module loads
const adminUser = initializeAdminUser();

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
  saveData(); // Save after creating user
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
  const result = db.users.delete(userId);
  if (result) saveData(); // Save after deletion
  return result;
};

// Make user admin
export const makeUserAdmin = (userId: string): boolean => {
  const user = db.users.get(userId);
  if (user) {
    user.isAdmin = true;
    db.users.set(userId, user);
    saveData(); // Save after update
    return true;
  }
  return false;
};

// Remove admin privileges
export const removeUserAdmin = (userId: string): boolean => {
  const user = db.users.get(userId);
  if (user && user.id !== 'admin-1') {
    user.isAdmin = false;
    db.users.set(userId, user);
    saveData(); // Save after update
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

// ==================== ADMIN-SPECIFIC USER MANAGEMENT FUNCTIONS ====================

// Get all users without password hash (for admin purposes)
export const adminGetAllUsers = (): Omit<User, 'passwordHash'>[] => {
  return [...db.users.values()].map(user => {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

// Update user with validation (for admin purposes)
export const adminUpdateUser = (userId: string, updates: Partial<Omit<User, 'id' | 'passwordHash' | 'createdAt'>>): { success: boolean; user?: Omit<User, 'passwordHash'>; error?: string } => {
  const user = db.users.get(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Check if username is taken by another user
  if (updates.username && updates.username !== user.username) {
    if (isUsernameTaken(updates.username)) {
      return { success: false, error: 'Username already taken' };
    }
  }

  // Check if email is taken by another user
  if (updates.email && updates.email !== user.email) {
    if (isEmailTaken(updates.email)) {
      return { success: false, error: 'Email already taken' };
    }
  }

  // Check if phone number is taken by another user
  if (updates.phoneNumber && updates.phoneNumber !== user.phoneNumber) {
    if (isPhoneNumberTaken(updates.phoneNumber)) {
      return { success: false, error: 'Phone number already taken' };
    }
  }

  const updatedUser = {
    ...user,
    ...updates
  };

  db.users.set(userId, updatedUser);
  saveData(); // Save after update
  
  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return { success: true, user: userWithoutPassword };
};

// Delete user with safety checks (for admin purposes)
export const adminDeleteUser = (userId: string, currentAdminId: string): { success: boolean; error?: string } => {
  const user = db.users.get(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Prevent self-deletion
  if (userId === currentAdminId) {
    return { success: false, error: 'Cannot delete your own account' };
  }

  // Prevent deleting the main admin user
  if (userId === 'admin-1') {
    return { success: false, error: 'Cannot delete the main admin user' };
  }

  db.users.delete(userId);
  
  // Also delete user's sessions
  for (const [token, session] of db.sessions.entries()) {
    if (session.userId === userId) {
      db.sessions.delete(token);
    }
  }
  
  saveData(); // Save after deletion

  return { success: true };
};

// Toggle admin status with safety checks
export const adminToggleAdminStatus = (userId: string, currentAdminId: string): { success: boolean; user?: Omit<User, 'passwordHash'>; error?: string } => {
  const user = db.users.get(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Prevent modifying own admin status
  if (userId === currentAdminId) {
    return { success: false, error: 'Cannot modify your own admin status' };
  }

  // Prevent modifying the main admin user
  if (userId === 'admin-1') {
    return { success: false, error: 'Cannot modify the main admin user' };
  }

  const updatedUser = {
    ...user,
    isAdmin: !user.isAdmin
  };

  db.users.set(userId, updatedUser);
  saveData(); // Save after update
  
  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return { success: true, user: userWithoutPassword };
};

// Get user by ID without password hash
export const adminGetUserById = (userId: string): Omit<User, 'passwordHash'> | undefined => {
  const user = db.users.get(userId);
  if (!user) return undefined;
  
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Search users by username or email
export const adminSearchUsers = (query: string): Omit<User, 'passwordHash'>[] => {
  const lowerQuery = query.toLowerCase();
  return adminGetAllUsers().filter(user => 
    user.username.toLowerCase().includes(lowerQuery) ||
    user.email.toLowerCase().includes(lowerQuery)
  );
};

// Get user statistics
export const adminGetUserStats = () => {
  const users = adminGetAllUsers();
  return {
    total: users.length,
    admins: users.filter(user => user.isAdmin).length,
    regular: users.filter(user => !user.isAdmin).length,
    male: users.filter(user => user.gender === 'male').length,
    female: users.filter(user => user.gender === 'female').length,
    other: users.filter(user => user.gender === 'other').length,
  };
};

// Session management functions
export const createSession = (userId: string): Session => {
  const session: Session = {
    token: generateId(),
    userId,
    createdAt: Date.now(),
  };
  
  db.sessions.set(session.token, session);
  saveData(); // Save after creating session
  return session;
};

export const getSession = (token: string): Session | undefined => {
  return db.sessions.get(token);
};

export const deleteSession = (token: string): boolean => {
  const result = db.sessions.delete(token);
  if (result) saveData(); // Save after deleting session
  return result;
};

// Add this function to delete user and their posts
export const deleteUserAndPosts = (userId: string): boolean => {
  const user = db.users.get(userId);
  if (!user) return false;

  // Delete user from database
  const userDeleted = db.users.delete(userId);
  
  if (userDeleted) {
    // Delete user's sessions
    for (const [token, session] of db.sessions.entries()) {
      if (session.userId === userId) {
        db.sessions.delete(token);
      }
    }
    
    saveData();
    return true;
  }
  
  return false;
};
