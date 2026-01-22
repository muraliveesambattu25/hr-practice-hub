# Glacier - Selenium Automation Practice App

A full-stack HRMS application designed specifically for Selenium automation testing practice, featuring realistic UI delays, proper test attributes (`data-testid`), and comprehensive CRUD operations.

## 🚀 Quick Start

### Option 1: Frontend Only (Lovable Preview)
The frontend is already running in Lovable with mock API. Use the demo credentials to login.

### Option 2: Full Stack with Docker
```bash
# Clone the exported code
git clone <your-repo-url>
cd glacier

# Start everything
docker-compose up --build

# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

## 🔐 Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| manager | manager123 | Manager |
| employee | employee123 | Employee |

## 📁 Project Structure

```
glacier/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   ├── Dockerfile
│   └── package.json
├── backend/                  # Node.js + Express + SQLite
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── database/
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

# 🖥️ Backend Implementation

## Directory Structure

Create the following structure for the backend:

```
backend/
├── src/
│   ├── index.js
│   ├── config.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── delay.js
│   └── database/
│       ├── init.js
│       └── seed.js
├── package.json
├── Dockerfile
└── .env.example
```

---

## package.json

```json
{
  "name": "glacier-backend",
  "version": "1.0.0",
  "description": "Glacier Backend API for Selenium Practice",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "seed": "node src/database/seed.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^9.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

---

## src/config.js

```javascript
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'glacier-super-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  DB_PATH: process.env.DB_PATH || './data/glacier.db',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  // Random delay range for Selenium wait practice (ms)
  MIN_DELAY: 300,
  MAX_DELAY: 1200,
  LOGIN_MIN_DELAY: 1000,
  LOGIN_MAX_DELAY: 2000,
};
```

---

## src/index.js

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { initDatabase } = require('./database/init');

// Routes
const authRoutes = require('./routes/auth');
const employeesRoutes = require('./routes/employees');
const usersRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize database
initDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    statusCode: err.status || 500,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found', statusCode: 404 });
});

app.listen(config.PORT, () => {
  console.log(`🚀 Glacier API running on http://localhost:${config.PORT}`);
});
```

---

## src/middleware/auth.js

```javascript
const jwt = require('jsonwebtoken');
const config = require('../config');
const { getDb } = require('../database/init');

// Authenticate JWT token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided', statusCode: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', statusCode: 401 });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated', statusCode: 401 });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.', 
        statusCode: 403 
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
```

---

## src/middleware/delay.js

```javascript
const config = require('../config');

// Add random delay to simulate real API latency (for Selenium wait practice)
const randomDelay = (min = config.MIN_DELAY, max = config.MAX_DELAY) => {
  return (req, res, next) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(next, delay);
  };
};

const loginDelay = randomDelay(config.LOGIN_MIN_DELAY, config.LOGIN_MAX_DELAY);
const apiDelay = randomDelay(config.MIN_DELAY, config.MAX_DELAY);

module.exports = { randomDelay, loginDelay, apiDelay };
```

---

## src/database/init.js

```javascript
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

let db = null;

const initDatabase = () => {
  // Ensure data directory exists
  const dataDir = path.dirname(config.DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(config.DB_PATH);
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    -- Users table (for login)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'Manager', 'Employee')),
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Employees table
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT,
      department TEXT NOT NULL CHECK(department IN ('IT', 'HR', 'Finance', 'Sales')),
      role TEXT NOT NULL CHECK(role IN ('Employee', 'Manager')),
      join_date TEXT NOT NULL,
      salary REAL DEFAULT 0,
      address TEXT,
      status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
      profile_picture TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
    CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
    CREATE INDEX IF NOT EXISTS idx_employees_join_date ON employees(join_date);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  console.log('✅ Database initialized');
  return db;
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

module.exports = { initDatabase, getDb };
```

---

## src/database/seed.js

```javascript
const bcrypt = require('bcryptjs');
const { initDatabase, getDb } = require('./init');

const seedDatabase = async () => {
  initDatabase();
  const db = getDb();

  console.log('🌱 Seeding database...');

  // Clear existing data
  db.exec('DELETE FROM employees');
  db.exec('DELETE FROM users');

  // Reset auto-increment
  db.exec("DELETE FROM sqlite_sequence WHERE name='employees'");
  db.exec("DELETE FROM sqlite_sequence WHERE name='users'");

  // Seed Users
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedManagerPassword = await bcrypt.hash('manager123', 10);
  const hashedEmployeePassword = await bcrypt.hash('employee123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (username, password, role, full_name, email, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('admin', hashedAdminPassword, 'Admin', 'System Administrator', 'admin@glacier.com', 'Active', '2024-01-01');
  insertUser.run('manager', hashedManagerPassword, 'Manager', 'John Manager', 'manager@glacier.com', 'Active', '2024-01-15');
  insertUser.run('employee', hashedEmployeePassword, 'Employee', 'Jane Employee', 'employee@glacier.com', 'Active', '2024-02-01');

  console.log('✅ Users seeded');

  // Seed Employees
  const departments = ['IT', 'HR', 'Finance', 'Sales'];
  const roles = ['Employee', 'Manager'];
  const statuses = ['Active', 'Inactive'];
  
  const firstNames = [
    'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
    'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen'
  ];

  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco', 'Boston'];
  const streets = ['Main St', 'Oak Ave', 'Pine Blvd', 'Maple Rd', 'Cedar Dr'];

  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomDate = (start, end) => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  };
  const randomSalary = () => Math.floor(Math.random() * (150000 - 35000) + 35000);
  const randomMobile = () => `${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000000 + 1000000)}`;

  const insertEmployee = db.prepare(`
    INSERT INTO employees (first_name, last_name, email, mobile, department, role, join_date, salary, address, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Generate 38 random employees
  for (let i = 0; i < 38; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const department = randomItem(departments);
    const role = i < 5 ? 'Manager' : randomItem(roles); // First 5 are managers
    const status = Math.random() > 0.15 ? 'Active' : 'Inactive'; // 15% inactive
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? i : ''}@company.com`;
    const address = `${Math.floor(Math.random() * 9999) + 1} ${randomItem(streets)}, ${randomItem(cities)}`;

    insertEmployee.run(
      firstName,
      lastName,
      email,
      randomMobile(),
      department,
      role,
      randomDate(new Date('2020-01-01'), new Date('2025-12-31')),
      randomSalary(),
      address,
      status
    );
  }

  // Add duplicate-ish names for search testing
  insertEmployee.run('James', 'Smith', 'james.smith.senior@company.com', '5559876543', 'IT', 'Manager', '2019-06-15', 125000, '100 Tech Park, San Francisco', 'Active');
  insertEmployee.run('James', 'Smithson', 'james.smithson@company.com', '5551234567', 'Sales', 'Employee', '2023-03-20', 55000, '200 Commerce St, Boston', 'Active');

  console.log('✅ Employees seeded (40 records)');
  console.log('🎉 Database seeding complete!');
};

seedDatabase().catch(console.error);
```

---

## src/routes/auth.js

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database/init');
const { authenticate } = require('../middleware/auth');
const { loginDelay } = require('../middleware/delay');
const config = require('../config');

const router = express.Router();

// POST /api/auth/login
router.post('/login',
  loginDelay,
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err) => {
          acc[err.path] = acc[err.path] || [];
          acc[err.path].push(err.msg);
          return acc;
        }, {}),
        statusCode: 400,
      });
    }

    const { username, password } = req.body;
    const db = getDb();

    try {
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password', statusCode: 401 });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid username or password', statusCode: 401 });
      }

      if (user.status === 'Inactive') {
        return res.status(403).json({ 
          message: 'Account is inactive. Please contact administrator.', 
          statusCode: 403 
        });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.full_name,
          email: user.email,
          status: user.status,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error', statusCode: 500 });
    }
  }
);

// GET /api/me - Get current user
router.get('/me', authenticate, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found', statusCode: 404 });
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.full_name,
    email: user.email,
    status: user.status,
    createdAt: user.created_at,
  });
});

module.exports = router;
```

---

## src/routes/employees.js

```javascript
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { getDb } = require('../database/init');
const { authenticate } = require('../middleware/auth');
const { apiDelay } = require('../middleware/delay');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Apply authentication and delay to all routes
router.use(authenticate);
router.use(apiDelay);

// GET /api/employees - List with pagination, search, filters, sorting
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['fullName', 'joinDate']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
], (req, res) => {
  const db = getDb();
  const {
    page = 1,
    limit = 10,
    search,
    department,
    status,
    joinDateFrom,
    joinDateTo,
    sortBy = 'id',
    sortOrder = 'asc',
  } = req.query;

  let whereClause = '1=1';
  const params = [];

  if (search) {
    whereClause += ` AND (first_name || ' ' || last_name LIKE ? OR email LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (department) {
    whereClause += ' AND department = ?';
    params.push(department);
  }

  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }

  if (joinDateFrom) {
    whereClause += ' AND join_date >= ?';
    params.push(joinDateFrom);
  }

  if (joinDateTo) {
    whereClause += ' AND join_date <= ?';
    params.push(joinDateTo);
  }

  // Map sortBy to actual column
  const sortColumn = sortBy === 'fullName' 
    ? "first_name || ' ' || last_name" 
    : sortBy === 'joinDate' 
      ? 'join_date' 
      : 'id';

  const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM employees WHERE ${whereClause}`;
  const { total } = db.prepare(countQuery).get(...params);

  // Get paginated data
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT * FROM employees 
    WHERE ${whereClause} 
    ORDER BY ${sortColumn} ${order}
    LIMIT ? OFFSET ?
  `;

  const employees = db.prepare(dataQuery).all(...params, limit, offset);

  res.json({
    data: employees.map(emp => ({
      id: emp.id,
      firstName: emp.first_name,
      lastName: emp.last_name,
      email: emp.email,
      mobile: emp.mobile,
      department: emp.department,
      role: emp.role,
      joinDate: emp.join_date,
      salary: emp.salary,
      address: emp.address,
      status: emp.status,
      profilePicture: emp.profile_picture,
    })),
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  });
});

// GET /api/employees/:id - Get single employee
router.get('/:id', (req, res) => {
  const db = getDb();
  const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);

  if (!employee) {
    return res.status(404).json({ message: 'Employee not found', statusCode: 404 });
  }

  res.json({
    id: employee.id,
    firstName: employee.first_name,
    lastName: employee.last_name,
    email: employee.email,
    mobile: employee.mobile,
    department: employee.department,
    role: employee.role,
    joinDate: employee.join_date,
    salary: employee.salary,
    address: employee.address,
    status: employee.status,
    profilePicture: employee.profile_picture,
  });
});

// POST /api/employees - Create employee
router.post('/',
  upload.single('profilePicture'),
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('mobile').optional().matches(/^\d{10}$/).withMessage('Mobile must be 10 digits'),
    body('department').isIn(['IT', 'HR', 'Finance', 'Sales']).withMessage('Invalid department'),
    body('role').isIn(['Employee', 'Manager']).withMessage('Invalid role'),
    body('joinDate').notEmpty().withMessage('Join date is required'),
    body('salary').optional().isNumeric().withMessage('Salary must be numeric'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err) => {
          acc[err.path] = acc[err.path] || [];
          acc[err.path].push(err.msg);
          return acc;
        }, {}),
        statusCode: 400,
      });
    }

    const db = getDb();
    const { firstName, lastName, email, mobile, department, role, joinDate, salary, address, status } = req.body;

    // Check for duplicate email
    const existing = db.prepare('SELECT id FROM employees WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: { email: ['Email already exists'] },
        statusCode: 400,
      });
    }

    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO employees (first_name, last_name, email, mobile, department, role, join_date, salary, address, status, profile_picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(firstName, lastName, email, mobile || '', department, role, joinDate, salary || 0, address || '', status || 'Active', profilePicture);

    const newEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      id: newEmployee.id,
      firstName: newEmployee.first_name,
      lastName: newEmployee.last_name,
      email: newEmployee.email,
      mobile: newEmployee.mobile,
      department: newEmployee.department,
      role: newEmployee.role,
      joinDate: newEmployee.join_date,
      salary: newEmployee.salary,
      address: newEmployee.address,
      status: newEmployee.status,
      profilePicture: newEmployee.profile_picture,
    });
  }
);

// PUT /api/employees/:id - Update employee
router.put('/:id',
  upload.single('profilePicture'),
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('mobile').optional().matches(/^\d{10}$/).withMessage('Mobile must be 10 digits'),
    body('department').optional().isIn(['IT', 'HR', 'Finance', 'Sales']),
    body('role').optional().isIn(['Employee', 'Manager']),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err) => {
          acc[err.path] = acc[err.path] || [];
          acc[err.path].push(err.msg);
          return acc;
        }, {}),
        statusCode: 400,
      });
    }

    const db = getDb();
    const { id } = req.params;

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found', statusCode: 404 });
    }

    const { firstName, lastName, email, mobile, department, role, joinDate, salary, address, status } = req.body;

    // Check for duplicate email (excluding current employee)
    if (email) {
      const existing = db.prepare('SELECT id FROM employees WHERE email = ? AND id != ?').get(email, id);
      if (existing) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: { email: ['Email already exists'] },
          statusCode: 400,
        });
      }
    }

    const profilePicture = req.file ? `/uploads/${req.file.filename}` : employee.profile_picture;

    db.prepare(`
      UPDATE employees SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        mobile = COALESCE(?, mobile),
        department = COALESCE(?, department),
        role = COALESCE(?, role),
        join_date = COALESCE(?, join_date),
        salary = COALESCE(?, salary),
        address = COALESCE(?, address),
        status = COALESCE(?, status),
        profile_picture = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(firstName, lastName, email, mobile, department, role, joinDate, salary, address, status, profilePicture, id);

    const updated = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);

    res.json({
      id: updated.id,
      firstName: updated.first_name,
      lastName: updated.last_name,
      email: updated.email,
      mobile: updated.mobile,
      department: updated.department,
      role: updated.role,
      joinDate: updated.join_date,
      salary: updated.salary,
      address: updated.address,
      status: updated.status,
      profilePicture: updated.profile_picture,
    });
  }
);

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;

  const employee = db.prepare('SELECT id FROM employees WHERE id = ?').get(id);
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found', statusCode: 404 });
  }

  db.prepare('DELETE FROM employees WHERE id = ?').run(id);

  res.status(204).send();
});

module.exports = router;
```

---

## src/routes/users.js

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database/init');
const { authenticate, authorize } = require('../middleware/auth');
const { apiDelay } = require('../middleware/delay');

const router = express.Router();

// Apply authentication, authorization, and delay to all routes
router.use(authenticate);
router.use(authorize('Admin'));
router.use(apiDelay);

// GET /api/users - List all users
router.get('/', (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, username, role, full_name, email, status, created_at FROM users').all();

  res.json(users.map(user => ({
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.full_name,
    email: user.email,
    status: user.status,
    createdAt: user.created_at,
  })));
});

// POST /api/users - Create user
router.post('/',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['Admin', 'Manager', 'Employee']).withMessage('Invalid role'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err) => {
          acc[err.path] = acc[err.path] || [];
          acc[err.path].push(err.msg);
          return acc;
        }, {}),
        statusCode: 400,
      });
    }

    const db = getDb();
    const { username, password, role, fullName, email } = req.body;

    // Check for duplicate username
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: { username: ['Username already exists'] },
        statusCode: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db.prepare(`
      INSERT INTO users (username, password, role, full_name, email, status)
      VALUES (?, ?, ?, ?, ?, 'Active')
    `).run(username, hashedPassword, role, fullName, email);

    const newUser = db.prepare('SELECT id, username, role, full_name, email, status, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      fullName: newUser.full_name,
      email: newUser.email,
      status: newUser.status,
      createdAt: newUser.created_at,
    });
  }
);

// PATCH /api/users/:id/status - Update user status
router.patch('/:id/status',
  [body('status').isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err) => {
          acc[err.path] = acc[err.path] || [];
          acc[err.path].push(err.msg);
          return acc;
        }, {}),
        statusCode: 400,
      });
    }

    const db = getDb();
    const { id } = req.params;
    const { status } = req.body;

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found', statusCode: 404 });
    }

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);

    const updated = db.prepare('SELECT id, username, role, full_name, email, status, created_at FROM users WHERE id = ?').get(id);

    res.json({
      id: updated.id,
      username: updated.username,
      role: updated.role,
      fullName: updated.full_name,
      email: updated.email,
      status: updated.status,
      createdAt: updated.created_at,
    });
  }
);

// POST /api/users/:id/reset-password - Reset user password
router.post('/:id/reset-password',
  [body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err) => {
          acc[err.path] = acc[err.path] || [];
          acc[err.path].push(err.msg);
          return acc;
        }, {}),
        statusCode: 400,
      });
    }

    const db = getDb();
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found', statusCode: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);

    res.json({ message: 'Password reset successfully' });
  }
);

module.exports = router;
```

---

## Backend Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create uploads and data directories
RUN mkdir -p uploads data

EXPOSE 3001

CMD ["npm", "start"]
```

---

## .env.example

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h
DB_PATH=./data/glacier.db
CORS_ORIGIN=http://localhost:5173
```

---

# 🐳 Docker Setup

## docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3001/api
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - JWT_SECRET=glacier-docker-secret-change-in-production
      - DB_PATH=/app/data/glacier.db
      - CORS_ORIGIN=http://localhost:5173
    volumes:
      - backend-data:/app/data
      - backend-uploads:/app/uploads

volumes:
  backend-data:
  backend-uploads:
```

## Frontend Dockerfile (for Docker setup)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

---

# 📚 API Reference

## Authentication

### POST /api/auth/login
Login and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "Admin",
    "fullName": "System Administrator",
    "email": "admin@glacier.com",
    "status": "Active"
  }
}
```

### GET /api/auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

---

## Employees

### GET /api/employees
List employees with pagination, search, and filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| search | string | Search by name or email |
| department | string | Filter by department |
| status | string | Filter by status (Active/Inactive) |
| joinDateFrom | string | Filter by join date (from) |
| joinDateTo | string | Filter by join date (to) |
| sortBy | string | Sort by: fullName, joinDate |
| sortOrder | string | asc or desc |

**Response (200):**
```json
{
  "data": [...],
  "total": 40,
  "page": 1,
  "limit": 10,
  "totalPages": 4
}
```

### GET /api/employees/:id
Get single employee by ID.

### POST /api/employees
Create new employee.

### PUT /api/employees/:id
Update existing employee.

### DELETE /api/employees/:id
Delete employee.

---

## Users (Admin Only)

### GET /api/users
List all system users.

### POST /api/users
Create new user.

### PATCH /api/users/:id/status
Update user status (activate/deactivate).

### POST /api/users/:id/reset-password
Reset user password.

---

# 🔧 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (Delete success) |
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

# 🧪 Selenium Test Attributes

All interactive elements have `data-testid` attributes for reliable locator targeting:

## Login Page
- `login-page`, `login-username`, `login-password`, `login-submit`, `login-spinner`

## Navigation
- `navbar`, `sidebar`, `nav-dashboard`, `nav-employees`, `nav-users`, etc.

## Employees
- `employee-table`, `employee-add-btn`, `employee-search`
- `employee-row-{id}`, `edit-employee-{id}`, `delete-employee-{id}`
- `pagination-prev`, `pagination-next`, `pagination-page-{n}`

## Forms
- `input-firstName`, `input-lastName`, `input-email`, `select-department`, etc.
- `submit-btn`, `cancel-btn`, `save-spinner`

## Modals
- `modal-dialog`, `modal-confirm`, `modal-cancel`

## Automation Lab
- `checkbox-{id}`, `radio-{id}`, `single-select`, `multi-select`
- `tooltip-trigger`, `drag-source`, `drop-target`
- `file-input`, `upload-progress`, `alert-btn`, `confirm-btn`, `prompt-btn`
- `single-date-picker`, `date-range-picker`, `single-slider`, `range-slider`
- `autocomplete-trigger`, `autocomplete-input`, `selectable-table`
- `infinite-scroll-container`, `start-loading-btn`, `dynamic-content`

---

# 🚀 Running Locally (without Docker)

## Backend
```bash
cd backend
npm install
npm run seed  # Seed the database
npm run dev   # Start development server
```

## Frontend
```bash
cd frontend
npm install
npm run dev
```

---

# 📝 License

MIT License - Free for educational and testing purposes.
