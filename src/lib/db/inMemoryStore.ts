// src/lib/db/inMemoryStore.ts
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

export const db = {
  users: new Map<string, User>(),
  sessions: new Map<string, Session>(),
};

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