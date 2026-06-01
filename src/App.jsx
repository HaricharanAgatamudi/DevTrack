import { useEffect, useRef, useState } from 'react'

// ─── Storage keys ─────────────────────────────────────────────────────────────
const USERS_KEY = 'devtrack_users_v4'
const SESSION_KEY = 'devtrack_session_v4'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayKey = (d = new Date()) => d.toISOString().split('T')[0]
const readUsers = () => {
  try {
    const current = JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
    if (Object.keys(current).length) return current
    const legacy = JSON.parse(localStorage.getItem('dt_users') || '{}')
    if (Object.keys(legacy).length) {
      localStorage.setItem(USERS_KEY, JSON.stringify(legacy))
      const legacySession = localStorage.getItem('dt_session')
      if (legacySession && !localStorage.getItem(SESSION_KEY)) localStorage.setItem(SESSION_KEY, legacySession)
      return legacy
    }
    return {}
  } catch { return {} }
}
const saveUsers = u => localStorage.setItem(USERS_KEY, JSON.stringify(u))
const clone = value => JSON.parse(JSON.stringify(value))

// ─── Track config ─────────────────────────────────────────────────────────────
const TRACKS = {
  DSA: { color: '#F5C842', bg: 'rgba(245,200,66,.12)', label: 'DSA' },
  SQL: { color: '#4ADE80', bg: 'rgba(74,222,128,.12)', label: 'SQL' },
  FS:  { color: '#FF8C5A', bg: 'rgba(255,140,90,.12)', label: 'FS' },
  ML:  { color: '#5AB4FF', bg: 'rgba(90,180,255,.12)', label: 'ML' },
  DS:  { color: '#C084FC', bg: 'rgba(192,132,252,.12)', label: 'DS' },
  REV: { color: '#FF7070', bg: 'rgba(255,112,112,.12)', label: 'REV' },
  PROJ:{ color: '#8B85FF', bg: 'rgba(139,133,255,.12)', label: 'PROJ' },
  Project:{ color: '#8B85FF', bg: 'rgba(139,133,255,.12)', label: 'PROJ' },
}

// ─── Must-do tasks per DSA topic (for auto-task injection) ────────────────────
const DAILY_TASKS = {
  'Arrays': [
    'LeetCode: Two Sum (#1)', 'LeetCode: Best Time to Buy & Sell Stock (#121)',
    'LeetCode: Maximum Subarray (#53)', 'LeetCode: Contains Duplicate (#217)',
  ],
  'Strings': [
    'LeetCode: Valid Anagram (#242)', 'LeetCode: Longest Substring Without Repeating (#3)',
    'LeetCode: Valid Palindrome (#125)',
  ],
  'Binary search': ['LeetCode: Binary Search (#704)', 'LeetCode: Search in Rotated Sorted Array (#33)', 'LeetCode: Find Minimum in Rotated Array (#153)'],
  'Linked lists': ['LeetCode: Reverse Linked List (#206)', 'LeetCode: Merge Two Sorted Lists (#21)', 'LeetCode: Linked List Cycle (#141)'],
  'Stacks': ['LeetCode: Valid Parentheses (#20)', 'LeetCode: Min Stack (#155)', 'LeetCode: Daily Temperatures (#739)'],
  'Queues': ['LeetCode: Implement Queue using Stacks (#232)'],
  'Hashing': ['LeetCode: Two Sum (#1)', 'LeetCode: Group Anagrams (#49)', 'LeetCode: Top K Frequent Elements (#347)'],
  'Backtracking': ['LeetCode: Subsets (#78)', 'LeetCode: Permutations (#46)', 'LeetCode: Combination Sum (#39)'],
  'Binary trees': ['LeetCode: Invert Binary Tree (#226)', 'LeetCode: Maximum Depth of Binary Tree (#104)', 'LeetCode: Same Tree (#100)'],
  'BST': ['LeetCode: Validate BST (#98)', 'LeetCode: Lowest Common Ancestor BST (#235)'],
  'Heaps': ['LeetCode: Kth Largest Element (#215)', 'LeetCode: Top K Frequent Elements (#347)'],
  'Graphs': ['LeetCode: Number of Islands (#200)', 'LeetCode: Clone Graph (#133)', 'LeetCode: Course Schedule (#207)'],
  'DP': ['LeetCode: Climbing Stairs (#70)', 'LeetCode: Coin Change (#322)', 'LeetCode: Longest Common Subsequence (#1143)'],
  'SQL': ['HackerRank: Revising Queries', 'LeetCode SQL: Employees Earning More Than Managers (#181)', 'DataLemur: Histogram of Tweets'],
  'ML': ['Practice: NumPy array operations', 'Practice: Pandas groupby & pivot', 'Implement: Linear regression from scratch'],
}

function getAutoTasks(title, track) {
  const key = Object.keys(DAILY_TASKS).find(k => title.toLowerCase().includes(k.toLowerCase()))
  if (!key) return []
  return DAILY_TASKS[key].map((t, i) => ({
    id: Date.now() + i + Math.random(),
    title: t, track: track || 'DSA',
    pri: i === 0 ? 'high' : 'med',
    phase: 'Daily Must-Do', due: todayKey(),
    notes: `Auto-generated from Day schedule: ${title}`, done: false, auto: true,
  }))
}

// ─── Curriculum (55 days, then loops) ────────────────────────────────────────
const S = (title, track, est = 120, must = false) => ({ title, track, est, must })
const CUR = [
  { m: S('Arrays - traversal, prefix sum, two pointers','DSA',120,true), e: S('FS - project setup, Git, Vite, React scaffold','FS') },
  { m: S('Arrays - sliding window, Kadane, Dutch flag','DSA',120,true), e: S('SQL - SELECT, WHERE, ORDER BY, LIMIT','SQL') },
  { m: S('Arrays - 2D arrays, spiral, rotate, practice set','DSA',120,true), e: S('FS - React components, JSX, props, state','FS') },
  { m: S('Strings - frequency count, two pointers, hashing','DSA',120,true), e: S('SQL - aggregates, GROUP BY, HAVING','SQL') },
  { m: S('Strings - palindrome, anagram, KMP, Rabin-Karp','DSA',120,true), e: S('FS - React hooks: effect, ref, context','FS') },
  { m: S('Sorting - bubble, selection, insertion, merge, quick','DSA'), e: S('SQL - joins: inner, left, right, self','SQL') },
  { m: S('DSA revision - arrays and strings timed practice','REV'), e: S('Project - DevHive backend with Express and MongoDB','PROJ') },
  { m: S('Binary search - basics, lower bound, upper bound','DSA'), e: S('ML - Python OOP, files, comprehensions','ML') },
  { m: S('Binary search - search on answer, rotated array, peak','DSA',120,true), e: S('SQL - subqueries, CTEs, WITH clause','SQL') },
  { m: S('Recursion - base cases, call stack, recursion trees','DSA'), e: S('FS - Tailwind CSS, responsive layouts','FS') },
  { m: S('Linked lists - singly, doubly, circular, operations','DSA',120,true), e: S('ML - NumPy arrays, broadcasting, matrix ops','ML') },
  { m: S('Linked lists - fast/slow pointers, cycle, reverse, merge','DSA',120,true), e: S('SQL - window functions: rank, lag, lead','SQL') },
  { m: S('Stacks - monotonic stack, next greater, min stack','DSA'), e: S('FS - React Router and protected routes','FS') },
  { m: S('DSA revision - linked lists and stacks','REV'), e: S('Project - JWT register, login, refresh flow','PROJ') },
  { m: S('Queues and deques - circular queue, priority queue','DSA'), e: S('ML - Pandas cleaning, groupby, merge','ML') },
  { m: S('Hashing - maps, sets, frequency patterns, two sum','DSA'), e: S('SQL - string functions, date functions, CASE','SQL') },
  { m: S('DS - statistics: mean, variance, distributions','DS'), e: S('ML - linear algebra: vectors, matrices, dot product','ML') },
  { m: S('Backtracking - subsets, combinations, permutations','DSA',120,true), e: S('FS - Redux Toolkit, React Query, forms','FS') },
  { m: S('Backtracking - N Queens, Sudoku, word search','DSA',120,true), e: S('SQL - self joins, recursive CTEs, analytics','SQL') },
  { m: S('ML - probability, Bayes, expected value','ML'), e: S('Project - posts, feed, markdown editor','PROJ') },
  { m: S('DSA revision - hashing and backtracking','REV'), e: S('DS - EDA and data cleaning with Pandas','DS') },
  { m: S('Binary trees - traversals, height, diameter','DSA',120,true), e: S('FS - Node.js, Express REST API, middleware','FS') },
  { m: S('Binary trees - LCA, path sum, views, balanced tree','DSA',120,true), e: S('SQL - LeetCode SQL 50 practice batch 1','SQL') },
  { m: S('BST - insert, delete, validate, kth smallest','DSA',120,true), e: S('ML - preprocessing, scaling, encoding','ML') },
  { m: S('Heaps - heapify, top K, merge K sorted lists','DSA'), e: S('FS - MongoDB, Mongoose schemas, aggregation','FS') },
  { m: S('Greedy - activity selection, intervals, knapsack','DSA'), e: S('SQL - window function practice batch','SQL') },
  { m: S('ML - linear regression, gradient descent, Ridge, Lasso','ML',120,true), e: S('Project - comments and nested replies','PROJ') },
  { m: S('DSA revision - trees, heaps, greedy','REV'), e: S('DS - visualization with Matplotlib and Seaborn','DS') },
  { m: S('Graphs - representation, BFS, DFS, components','DSA',120,true), e: S('FS - JWT, bcrypt, role based access control','FS') },
  { m: S('Graphs - topological sort and cycle detection','DSA',120,true), e: S('SQL - LeetCode SQL 50 practice batch 2','SQL') },
  { m: S('Graphs - Dijkstra, Bellman-Ford, shortest paths','DSA',120,true), e: S('ML - logistic regression, KNN, Naive Bayes','ML') },
  { m: S('Graphs - union find, Kruskal, Prim MST','DSA'), e: S('Project - real-time notifications with Socket.io','PROJ') },
  { m: S('ML - decision trees, entropy, Gini, pruning','ML',120,true), e: S('FS - real-time chat with Socket.io','FS') },
  { m: S('ML - random forest, bagging, ensemble methods','ML',120,true), e: S('SQL - DataLemur medium practice batch','SQL') },
  { m: S('DSA revision - full graph contest simulation','REV'), e: S('DS - hypothesis testing and confidence intervals','DS') },
  { m: S('DP - memoization, tabulation, 1D patterns','DSA',120,true), e: S('FS - Redis cache, email, file uploads','FS') },
  { m: S('DP - 2D grids, edit distance, coin change','DSA',120,true), e: S('ML - SVM, kernels, XGBoost overview','ML') },
  { m: S('DP - knapsack variants and subset sum','DSA',120,true), e: S('Project - search and tag filters','PROJ') },
  { m: S('DP - LIS, LCS, DP on strings','DSA',120,true), e: S('SQL - cohort analysis and retention queries','SQL') },
  { m: S('DP - trees, graphs, bitmask DP','DSA',120,true), e: S('ML - metrics: precision, recall, F1, ROC-AUC','ML') },
  { m: S('DSA revision - DP timed contest','REV'), e: S('DS - A/B testing and significance','DS') },
  { m: S('Tries - prefix tree, autocomplete, word search','DSA'), e: S('FS - payments with Razorpay or Stripe','FS') },
  { m: S('Segment trees - range queries and lazy propagation','DSA'), e: S('Project - subscriptions and webhook handling','PROJ') },
  { m: S('Bit manipulation - XOR tricks, masks, counting bits','DSA'), e: S('ML - clustering: K-means, hierarchy, DBSCAN','ML') },
  { m: S('ML - PCA, dimensionality reduction, feature importance','ML'), e: S('SQL - full mock interview practice','SQL') },
  { m: S('DS - business metrics, funnels, retention, revenue','DS'), e: S('Project - admin dashboard and moderation','PROJ') },
  { m: S('ML - neural networks, activations, backprop','ML',120,true), e: S('FS - deployment: Vercel, Railway, MongoDB Atlas','FS') },
  { m: S('ML - TensorFlow or PyTorch first model','ML'), e: S('Project - DevHive public API and documentation','PROJ') },
  { m: S('DSA mock interview - 2 medium plus 1 hard','REV'), e: S('ML - NLP basics: tokenization, TF-IDF, embeddings','ML') },
  { m: S('SQL - HR dataset joins and aggregations','SQL'), e: S('DS - storytelling and stakeholder insights','DS') },
  { m: S('DSA mixed mock - arrays plus DP combo','REV'), e: S('ML - XGBoost tuning and grid search','ML') },
  { m: S('SQL - e-commerce dataset CTEs and windows','SQL'), e: S('Project - DevHive reports, feedback, and analytics','PROJ') },
  { m: S('ML - model serving with FastAPI and Docker','ML'), e: S('DS - Plotly and dashboard basics','DS') },
  { m: S('DSA company-style mock interview','REV'), e: S('FS - performance, testing, code review','FS') },
  { m: S('SQL - pivot, recursive CTE, query tuning','SQL'), e: S('ML - MLOps pipeline and experiment tracking','ML') },
  { m: S('DS - end-to-end case study','DS'), e: S('Project - portfolio polish, chatbot demo, and live deployment','PROJ') },
]

// ─── SQL Datasets (expanded) ──────────────────────────────────────────────────
const SQL_DATA = {
  hr: {
    name: 'HR Database', desc: 'Employees, departments, salaries, projects',
    tables: {
      employees: [
        {emp_id:1,name:'Alice Johnson',dept_id:1,salary:90000,hire_date:'2020-01-15',manager_id:null,job:'Manager'},
        {emp_id:2,name:'Bob Smith',dept_id:2,salary:75000,hire_date:'2019-03-10',manager_id:1,job:'Analyst'},
        {emp_id:3,name:'Carol Lee',dept_id:1,salary:85000,hire_date:'2021-07-22',manager_id:1,job:'Engineer'},
        {emp_id:4,name:'David Park',dept_id:3,salary:60000,hire_date:'2022-02-01',manager_id:2,job:'Support'},
        {emp_id:5,name:'Eve Wang',dept_id:2,salary:95000,hire_date:'2018-11-05',manager_id:1,job:'Lead'},
        {emp_id:6,name:'Frank M',dept_id:3,salary:55000,hire_date:'2023-04-18',manager_id:2,job:'Intern'},
        {emp_id:7,name:'Grace Patel',dept_id:1,salary:72000,hire_date:'2020-09-30',manager_id:3,job:'Engineer'},
        {emp_id:8,name:'Hiro Tanaka',dept_id:4,salary:110000,hire_date:'2017-06-12',manager_id:null,job:'Director'},
        {emp_id:9,name:'Ivy Chen',dept_id:4,salary:98000,hire_date:'2019-08-25',manager_id:8,job:'Scientist'},
        {emp_id:10,name:'Jack Wilson',dept_id:2,salary:67000,hire_date:'2022-12-01',manager_id:5,job:'Analyst'},
        {emp_id:11,name:'Karan Shah',dept_id:1,salary:81000,hire_date:'2021-03-15',manager_id:3,job:'Engineer'},
        {emp_id:12,name:'Lisa Brown',dept_id:4,salary:92000,hire_date:'2020-07-01',manager_id:8,job:'Scientist'},
      ],
      departments: [
        {dept_id:1,dept_name:'Engineering',budget:500000,location:'Hyderabad'},
        {dept_id:2,dept_name:'Marketing',budget:200000,location:'Bangalore'},
        {dept_id:3,dept_name:'Operations',budget:150000,location:'Chennai'},
        {dept_id:4,dept_name:'Data Science',budget:350000,location:'Pune'},
      ],
      salaries: [
        {emp_id:1,year:2022,salary:85000},{emp_id:1,year:2023,salary:90000},
        {emp_id:2,year:2022,salary:70000},{emp_id:2,year:2023,salary:75000},
        {emp_id:3,year:2022,salary:80000},{emp_id:3,year:2023,salary:85000},
        {emp_id:4,year:2022,salary:58000},{emp_id:4,year:2023,salary:60000},
        {emp_id:5,year:2022,salary:90000},{emp_id:5,year:2023,salary:95000},
        {emp_id:8,year:2022,salary:105000},{emp_id:8,year:2023,salary:110000},
        {emp_id:9,year:2022,salary:93000},{emp_id:9,year:2023,salary:98000},
      ],
      projects: [
        {proj_id:1,name:'Phoenix',dept_id:1,budget:120000,status:'active'},
        {proj_id:2,name:'Atlas',dept_id:4,budget:200000,status:'active'},
        {proj_id:3,name:'Orion',dept_id:2,budget:80000,status:'completed'},
        {proj_id:4,name:'Nexus',dept_id:1,budget:150000,status:'planning'},
        {proj_id:5,name:'Sigma',dept_id:3,budget:60000,status:'completed'},
      ],
    },
    samples: [
      'SELECT name, salary FROM employees WHERE salary > 80000 ORDER BY salary DESC',
      'SELECT d.dept_name, COUNT(*) AS headcount, AVG(e.salary) AS avg_salary FROM employees e JOIN departments d ON e.dept_id = d.dept_id GROUP BY d.dept_name',
      'SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS salary_rank FROM employees',
      'SELECT e.name, e.salary, d.dept_name FROM employees e JOIN departments d ON e.dept_id = d.dept_id WHERE e.salary > 80000',
      'SELECT dept_name, MAX(salary) AS max_sal, MIN(salary) AS min_sal FROM employees e JOIN departments d ON e.dept_id = d.dept_id GROUP BY dept_name',
      'SELECT e.name, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.emp_id',
      'UPDATE employees SET salary = salary * 1.1 WHERE dept_id = 1',
      'INSERT INTO employees VALUES (13, "New Dev", 1, 70000, "2024-01-01", 3, "Engineer")',
      'DELETE FROM employees WHERE salary < 60000',
    ],
  },
  ecommerce: {
    name: 'E-Commerce', desc: 'Orders, products, customers, reviews',
    tables: {
      customers: [
        {customer_id:1,name:'Priya Sharma',city:'Delhi',joined:'2021-01-10',tier:'Gold'},
        {customer_id:2,name:'Rahul Gupta',city:'Mumbai',joined:'2021-03-22',tier:'Silver'},
        {customer_id:3,name:'Sneha Nair',city:'Bangalore',joined:'2020-11-05',tier:'Gold'},
        {customer_id:4,name:'Arjun Reddy',city:'Hyderabad',joined:'2022-06-15',tier:'Bronze'},
        {customer_id:5,name:'Meera Iyer',city:'Chennai',joined:'2021-09-01',tier:'Silver'},
        {customer_id:6,name:'Vikram Singh',city:'Pune',joined:'2020-07-20',tier:'Gold'},
        {customer_id:7,name:'Anjali Das',city:'Kolkata',joined:'2023-01-05',tier:'Bronze'},
      ],
      orders: [
        {order_id:101,customer_id:1,product_id:1,quantity:2,order_date:'2023-01-15',status:'delivered'},
        {order_id:102,customer_id:2,product_id:3,quantity:1,order_date:'2023-01-20',status:'delivered'},
        {order_id:103,customer_id:1,product_id:2,quantity:1,order_date:'2023-02-05',status:'shipped'},
        {order_id:104,customer_id:3,product_id:1,quantity:3,order_date:'2023-02-10',status:'delivered'},
        {order_id:105,customer_id:4,product_id:4,quantity:1,order_date:'2023-03-01',status:'pending'},
        {order_id:106,customer_id:2,product_id:2,quantity:2,order_date:'2023-03-15',status:'delivered'},
        {order_id:107,customer_id:5,product_id:3,quantity:1,order_date:'2023-04-01',status:'cancelled'},
        {order_id:108,customer_id:6,product_id:5,quantity:4,order_date:'2023-04-10',status:'delivered'},
        {order_id:109,customer_id:3,product_id:4,quantity:2,order_date:'2023-04-20',status:'shipped'},
        {order_id:110,customer_id:1,product_id:5,quantity:1,order_date:'2023-05-01',status:'delivered'},
        {order_id:111,customer_id:6,product_id:1,quantity:1,order_date:'2023-05-10',status:'delivered'},
        {order_id:112,customer_id:7,product_id:3,quantity:2,order_date:'2023-06-01',status:'delivered'},
      ],
      products: [
        {product_id:1,name:'Laptop',category:'Electronics',price:55000,stock:15},
        {product_id:2,name:'Phone',category:'Electronics',price:25000,stock:40},
        {product_id:3,name:'Headphones',category:'Electronics',price:3500,stock:100},
        {product_id:4,name:'T-Shirt',category:'Apparel',price:800,stock:200},
        {product_id:5,name:'Running Shoes',category:'Footwear',price:4500,stock:60},
        {product_id:6,name:'Backpack',category:'Accessories',price:2200,stock:30},
      ],
      reviews: [
        {review_id:1,product_id:1,customer_id:1,rating:5,comment:'Excellent laptop!',date:'2023-02-01'},
        {review_id:2,product_id:3,customer_id:2,rating:4,comment:'Good sound',date:'2023-02-05'},
        {review_id:3,product_id:1,customer_id:3,rating:4,comment:'Great value',date:'2023-03-01'},
        {review_id:4,product_id:5,customer_id:6,rating:5,comment:'Super comfortable',date:'2023-05-15'},
        {review_id:5,product_id:2,customer_id:1,rating:3,comment:'Average camera',date:'2023-03-10'},
      ],
    },
    samples: [
      'SELECT c.name, COUNT(o.order_id) AS total_orders, SUM(p.price * o.quantity) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN products p ON o.product_id = p.product_id GROUP BY c.name ORDER BY total_spent DESC',
      'SELECT p.category, SUM(o.quantity * p.price) AS revenue FROM orders o JOIN products p ON o.product_id = p.product_id WHERE o.status = "delivered" GROUP BY p.category',
      'SELECT name, price, AVG(price) OVER (PARTITION BY category) AS category_avg FROM products',
      'SELECT * FROM customers WHERE tier = "Gold"',
      'SELECT p.name, AVG(r.rating) AS avg_rating FROM products p JOIN reviews r ON p.product_id = r.product_id GROUP BY p.name ORDER BY avg_rating DESC',
      'UPDATE products SET stock = stock - 1 WHERE product_id = 1',
      'INSERT INTO customers VALUES (8, "Test User", "Pune", "2024-01-01", "Bronze")',
      'DELETE FROM reviews WHERE rating < 3',
    ],
  },
  school: {
    name: 'School Database', desc: 'Students, courses, grades, teachers',
    tables: {
      students: [
        {student_id:1,name:'Aarav Kumar',grade:10,city:'Delhi',dob:'2008-05-12'},
        {student_id:2,name:'Diya Sharma',grade:11,city:'Mumbai',dob:'2007-08-22'},
        {student_id:3,name:'Rohan Gupta',grade:10,city:'Bangalore',dob:'2008-02-14'},
        {student_id:4,name:'Siya Patel',grade:12,city:'Pune',dob:'2006-11-30'},
        {student_id:5,name:'Veer Singh',grade:11,city:'Hyderabad',dob:'2007-03-25'},
        {student_id:6,name:'Tara Nair',grade:12,city:'Chennai',dob:'2006-07-17'},
      ],
      courses: [
        {course_id:1,name:'Mathematics',teacher_id:1,credits:4},
        {course_id:2,name:'Physics',teacher_id:2,credits:3},
        {course_id:3,name:'Computer Science',teacher_id:3,credits:4},
        {course_id:4,name:'English',teacher_id:4,credits:3},
        {course_id:5,name:'Chemistry',teacher_id:2,credits:3},
      ],
      grades: [
        {grade_id:1,student_id:1,course_id:1,score:88,semester:'2023-1'},
        {grade_id:2,student_id:1,course_id:3,score:95,semester:'2023-1'},
        {grade_id:3,student_id:2,course_id:1,score:76,semester:'2023-1'},
        {grade_id:4,student_id:2,course_id:2,score:82,semester:'2023-1'},
        {grade_id:5,student_id:3,course_id:3,score:91,semester:'2023-1'},
        {grade_id:6,student_id:4,course_id:1,score:97,semester:'2023-1'},
        {grade_id:7,student_id:4,course_id:2,score:85,semester:'2023-1'},
        {grade_id:8,student_id:5,course_id:3,score:78,semester:'2023-1'},
        {grade_id:9,student_id:6,course_id:4,score:92,semester:'2023-1'},
      ],
      teachers: [
        {teacher_id:1,name:'Mr. Arun',subject:'Mathematics',exp_years:12},
        {teacher_id:2,name:'Ms. Kavya',subject:'Sciences',exp_years:8},
        {teacher_id:3,name:'Mr. Ravi',subject:'Computer Science',exp_years:5},
        {teacher_id:4,name:'Ms. Priya',subject:'English',exp_years:15},
      ],
    },
    samples: [
      'SELECT s.name, c.name AS course, g.score FROM students s JOIN grades g ON s.student_id = g.student_id JOIN courses c ON g.course_id = c.course_id ORDER BY g.score DESC',
      'SELECT s.name, AVG(g.score) AS avg_score FROM students s JOIN grades g ON s.student_id = g.student_id GROUP BY s.name ORDER BY avg_score DESC',
      'SELECT c.name AS course, MAX(g.score) AS top_score, MIN(g.score) AS low_score FROM courses c JOIN grades g ON c.course_id = g.course_id GROUP BY c.name',
      'SELECT * FROM students WHERE grade = 11',
    ],
  },
}

// ─── SQL Engine ───────────────────────────────────────────────────────────────
function runSQL(query, dsKey, sourceTables) {
  try {
    const tables = clone(sourceTables || SQL_DATA[dsKey]?.tables || {})
    return executeSQL(query.trim(), tables)
  } catch(e) { return { error: e.message } }
}

function executeSQL(q, tables) {
  const up = q.toUpperCase().replace(/\s+/g,' ').trim()
  
  // INSERT
  if (up.startsWith('INSERT INTO')) {
    const m = q.match(/INSERT\s+INTO\s+(\w+)\s+VALUES\s*\((.+)\)/i)
    if (!m) return { error: 'Invalid INSERT syntax' }
    const tbl = m[1].toLowerCase()
    if (!tables[tbl]) return { error: `Table "${tbl}" not found` }
    const keys = Object.keys(tables[tbl][0])
    const vals = m[2].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
    const row = {}
    keys.forEach((k,i) => { const n = Number(vals[i]); row[k] = isNaN(n) ? vals[i] : n })
    tables[tbl].push(row)
    return { message: `1 row inserted into ${tbl}`, rows: tables[tbl], columns: keys, affected: 1, tables }
  }
  
  // UPDATE
  if (up.startsWith('UPDATE')) {
    const m = q.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i)
    if (!m) return { error: 'Invalid UPDATE syntax' }
    const tbl = m[1].toLowerCase()
    if (!tables[tbl]) return { error: `Table "${tbl}" not found` }
    const setParts = m[2].split(',').map(s => s.trim())
    let where = m[3] || null
    let count = 0
    tables[tbl].forEach(row => {
      if (where && !evalWhere(row, where)) return
      setParts.forEach(part => {
        const sm = part.match(/(\w+)\s*=\s*(.+)/)
        if (sm) {
          const col = sm[1], expr = sm[2].trim()
          if (expr.includes(col)) {
            const op = expr.match(/(\w+)\s*(\*|\/|\+|-)\s*(.+)/)
            if (op) row[col] = op[2]==='*' ? row[col]*Number(op[3]) : op[2]==='/' ? row[col]/Number(op[3]) : op[2]==='+' ? row[col]+Number(op[3]) : row[col]-Number(op[3])
          } else { row[col] = isNaN(Number(expr)) ? expr.replace(/["']/g,'') : Number(expr) }
        }
      })
      count++
    })
    return { message: `${count} rows updated in ${tbl}`, rows: tables[tbl], columns: Object.keys(tables[tbl][0] || {}), affected: count, tables }
  }
  
  // DELETE
  if (up.startsWith('DELETE FROM')) {
    const m = q.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i)
    if (!m) return { error: 'Invalid DELETE syntax' }
    const tbl = m[1].toLowerCase()
    if (!tables[tbl]) return { error: `Table "${tbl}" not found` }
    const where = m[2] || null
    const before = tables[tbl].length
    if (where) tables[tbl] = tables[tbl].filter(r => !evalWhere(r, where))
    else tables[tbl] = []
    const del = before - tables[tbl].length
    return { message: `${del} rows deleted from ${tbl}`, rows: tables[tbl], columns: Object.keys(tables[tbl][0] || {}), affected: del, tables }
  }
  
  // SELECT
  if (!up.startsWith('SELECT')) return { error: 'Only SELECT, INSERT, UPDATE, DELETE are supported' }
  
  const fromM = q.match(/\bFROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/i)
  if (!fromM) return { error: 'Missing FROM clause' }
  const tblName = fromM[1].toLowerCase()
  if (!tables[tblName]) return { error: `Table "${tblName}" not found. Available: ${Object.keys(tables).join(', ')}` }
  
  let rows = [...tables[tblName]]
  
  // JOIN
  const joinMatches = [...q.matchAll(/\b(LEFT\s+)?(?:INNER\s+)?JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+(.+?)(?=\s+(?:LEFT\s+)?(?:INNER\s+)?JOIN|\s+WHERE|\s+GROUP|\s+ORDER|\s+LIMIT|$)/gi)]
  for (const joinM of joinMatches) {
    const isLeft = !!joinM[1]
    const jTbl = joinM[2].toLowerCase()
    if (!tables[jTbl]) return { error: `Table "${jTbl}" not found` }
    const on = joinM[4].trim()
    const [l, r] = on.split('=').map(s => s.trim())
    const lk = l.split('.').pop(), rk = r.split('.').pop()
    rows = rows.flatMap(row => {
      const matches = tables[jTbl].filter(jr => String(row[lk]) === String(jr[rk]))
      return matches.length ? matches.map(jr => ({...row,...jr})) : (isLeft ? [row] : [])
    })
  }
  
  // WHERE
  const whereM = q.match(/\bWHERE\s+(.+?)(?:\s+GROUP|\s+ORDER|\s+LIMIT|$)/i)
  if (whereM) rows = rows.filter(row => evalWhere(row, whereM[1].trim()))
  
  // GROUP BY
  const groupM = q.match(/\bGROUP\s+BY\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i)
  let isGrouped = false
  if (groupM) {
    const gCols = groupM[1].split(',').map(s => s.trim().split('.').pop())
    rows = groupRows(rows, gCols, q)
    isGrouped = true
  }
  
  // SELECT cols
  const selM = q.match(/^SELECT\s+(.+?)\s+FROM/i)
  if (selM) rows = selectCols(rows, selM[1], isGrouped)
  
  // WINDOW RANK()
  if (q.toUpperCase().includes('RANK() OVER') || q.toUpperCase().includes('ROW_NUMBER() OVER')) {
    const wnM = q.match(/(RANK|ROW_NUMBER)\s*\(\s*\)\s*OVER\s*\(\s*(?:PARTITION\s+BY\s+(\w+)\s+)?ORDER\s+BY\s+(\w+)(?:\s+(DESC|ASC))?\s*\)(?:\s+AS\s+(\w+))?/i)
    if (wnM) {
      const [,fn,,orderCol,dir,alias] = wnM
      const outKey = alias || fn.toLowerCase()
      rows.sort((a,b) => { const v=a[orderCol]-b[orderCol]; return dir?.toUpperCase()==='DESC'?-v:v })
      rows = rows.map((r,i) => ({...r,[outKey]:i+1}))
    }
  }
  
  // ORDER BY
  const orderM = q.match(/\bORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i)
  if (orderM) {
    const parts = orderM[1].trim().split(/\s+/)
    const col = parts[0].split('.').pop(), dir = parts[1]
    rows.sort((a,b) => { const va=a[col],vb=b[col]; const cmp=isNaN(va)?String(va).localeCompare(String(vb)):va-vb; return dir?.toUpperCase()==='DESC'?-cmp:cmp })
  }
  
  // LIMIT
  const limitM = q.match(/\bLIMIT\s+(\d+)/i)
  if (limitM) rows = rows.slice(0, parseInt(limitM[1]))
  
  return { rows, columns: rows.length ? Object.keys(rows[0]) : [] }
}

function evalWhere(row, cond) {
  try {
    const likeM = cond.match(/(\w+)\s+LIKE\s+'([^']+)'/i)
    if (likeM) { const [,col,pat]=likeM; return new RegExp('^'+pat.replace(/%/g,'.*').replace(/_/g,'.')+'$','i').test(String(row[col]||'')) }
    const betweenM = cond.match(/(\w+)\s+BETWEEN\s+(\S+)\s+AND\s+(\S+)/i)
    if (betweenM) { const [,col,lo,hi]=betweenM; return row[col]>=Number(lo)&&row[col]<=Number(hi) }
    const inM = cond.match(/(\w+)\s+IN\s*\(([^)]+)\)/i)
    if (inM) { const [,col,list]=inM; const vals=list.split(',').map(v=>v.trim().replace(/["']/g,'')); return vals.includes(String(row[col])) }
    let expr = cond.replace(/(\w+\.)?\b(\w+)\b/g,(m,_,col)=>{
      if (['AND','OR','NOT','NULL','TRUE','FALSE','IS','LIKE'].includes(col.toUpperCase())) return m
      const v=row[col]; if(v===undefined) return m
      return typeof v==='string'?`"${v}"`:v
    }).replace(/\s*=\s*/g,'===').replace(/\s+AND\s+/gi,' && ').replace(/\s+OR\s+/gi,' || ').replace(/!===/g,'!==').replace(/>===/g,'>=').replace(/<===/g,'<=')
    return Function(`"use strict";return(${expr})`)()
  } catch { return true }
}

function groupRows(rows, gCols, query) {
  const groups = {}
  rows.forEach(r => {
    const key = gCols.map(c=>r[c]).join('|')
    if (!groups[key]) groups[key] = { _rows:[], ...Object.fromEntries(gCols.map(c=>[c,r[c]])) }
    groups[key]._rows.push(r)
  })
  return Object.values(groups).map(g => {
    const res = {...g}; delete res._rows
    const selM = query.match(/^SELECT\s+(.+?)\s+FROM/i)
    if (selM) selM[1].split(',').forEach(col => {
      const t = col.trim()
      const am = t.match(/(COUNT|SUM|AVG|MAX|MIN)\s*\(\s*\*?\s*(\w+)?\s*\)(?:\s+(?:AS\s+)?(\w+))?/i)
      if (am) {
        const [,fn,field,alias]=am
        const vals = g._rows.map(r=>field?r[field]:1).filter(v=>v!=null)
        const k = alias||`${fn.toLowerCase()}${field?'_'+field:''}`
        if (fn==='COUNT') res[k]=vals.length
        else if (fn==='SUM') res[k]=Math.round(vals.reduce((a,b)=>a+Number(b),0))
        else if (fn==='AVG') res[k]=Math.round(vals.reduce((a,b)=>a+Number(b),0)/vals.length)
        else if (fn==='MAX') res[k]=Math.max(...vals.map(Number))
        else if (fn==='MIN') res[k]=Math.min(...vals.map(Number))
      }
    })
    return res
  })
}

function selectCols(rows, sel) {
  if (sel.trim()==='*') return rows
  const cols = sel.split(',').map(s=>s.trim())
  return rows.map(row => {
    const out = {}
    cols.forEach(col => {
      const cl = col.replace(/\w+\./g,'').trim()
      const asM = cl.match(/^(\w+)\s+(?:AS\s+)?(\w+)$/i)
      const aggM = cl.match(/(COUNT|SUM|AVG|MAX|MIN)\s*\(/i)
      if (aggM) { Object.keys(row).forEach(k=>{ if(!Object.keys(out).some(ok=>ok===k)) out[k]=row[k] }) }
      else if (asM && !asM[1].match(/^(COUNT|SUM|AVG|MAX|MIN)$/i)) { if (asM[1] in row) out[asM[2]] = row[asM[1]] }
      else { const bare = cl.split(' ')[0]; if (bare in row) out[bare]=row[bare] }
    })
    return Object.keys(out).length ? out : row
  })
}

// ─── Streak helper ────────────────────────────────────────────────────────────
function nextStreak(user) {
  const today = new Date().toDateString()
  if (user.lastActive === today) return { streak: user.streak||0, lastActive: today }
  const yest = new Date(Date.now()-86400000).toDateString()
  return { streak: user.lastActive===yest ? (user.streak||0)+1 : 1, lastActive: today }
}

// ─── Schedule day logic ───────────────────────────────────────────────────────
// Days advance only when BOTH sessions of the current day are marked done.
// If not done, the day stays "current" and can be completed even days later.
function getActiveDay(user) {
  // Find the first day index where morning OR evening is not done
  const prog = user.progress || {}
  for (let d = 0; d < CUR.length * 20; d++) {
    const mk = `d${d}_morning`
    const ek = `d${d}_evening`
    if (!prog[mk] || !prog[ek]) return d
  }
  return 0
}

function isDayDone(prog, d) {
  return !!(prog[`d${d}_morning`] && prog[`d${d}_evening`])
}

function getTrackSessionStats(user, activeDay = getActiveDay(user)) {
  const tracks = ['DSA','SQL','FS','ML','DS']
  return tracks.reduce((acc, track) => {
    let done = 0
    let total = 0
    for (let day = 0; day <= activeDay; day++) {
      ;[['morning','m'], ['evening','e']].forEach(([slot, key]) => {
        if (CUR[day % CUR.length]?.[key]?.track !== track) return
        total += 1
        if (user.progress?.[`d${day}_${slot}`]) done += 1
      })
    }
    acc[track] = { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
    return acc
  }, {})
}

// ─── Empty user ───────────────────────────────────────────────────────────────
const emptyUser = {
  progress: {}, tasks: [], notes: [], focusLog: [],
  heatmap: {}, streak: 0, lastActive: null, modProgress: {},
  sqlAttempts: [], devhiveChat: [], completedDays: [],
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [users, setUsers] = useState(readUsers)
  const [session, setSession] = useState(() => localStorage.getItem(SESSION_KEY) || '')
  const [view, setView] = useState('dashboard')
  const [sidebar, setSidebar] = useState(false)
  const [toast, setToast] = useState({ msg:'', type:'ok' })

  const storedUser = session ? users[session] : null
  const user = storedUser ? { ...emptyUser, ...storedUser } : null

  function persist(next) { setUsers(next); saveUsers(next) }

  function updateUser(fn) {
    if (!user) return
    const next = { ...user, ...fn(user) }
    persist({ ...users, [user.email]: next })
  }

  function showToast(msg, type='ok') {
    setToast({ msg, type })
    clearTimeout(showToast._t)
    showToast._t = setTimeout(() => setToast({ msg:'', type:'ok' }), 2600)
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setSession('')
    setView('dashboard')
  }

  if (!user) return <Auth users={users} persist={persist} setSession={setSession} showToast={showToast} toast={toast} />

  const activeDay = getActiveDay(user)
  const daySchedule = CUR[activeDay % CUR.length]
  const pendingTasks = user.tasks.filter(t => !t.done).length

  const NAV = [
    { sec: 'Overview' },
    { id:'dashboard', label:'Dashboard', icon:'⊞' },
    { id:'schedule', label:'Daily Schedule', icon:'📅' },
    { id:'timer', label:'Focus Timer', icon:'⏱' },
    { sec: 'Learning' },
    { id:'roadmap', label:'Roadmap', icon:'🗺' },
    { id:'tasks', label:'Tasks', icon:'✓', badge: pendingTasks },
    { id:'sql', label:'SQL Playground', icon:'🗄' },
    { id:'project', label:'FS Project', icon:'⚙' },
    { sec: 'Insights' },
    { id:'progress', label:'Progress', icon:'📊' },
    { id:'notes', label:'Notes', icon:'📝', badge: user.notes.length },
  ]

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#0E0E16',color:'#E0E0F0',fontFamily:'system-ui,sans-serif'}}>
      {sidebar && <div onClick={()=>setSidebar(false)} style={{position:'fixed',inset:0,zIndex:40,background:'rgba(0,0,0,.6)'}} />}
      
      {/* Sidebar */}
      <aside style={{
        position:'fixed',inset:'0 auto 0 0',zIndex:50,width:220,display:'flex',flexDirection:'column',
        background:'#13131E',borderRight:'1px solid rgba(255,255,255,.07)',
        transform: sidebar ? 'translateX(0)' : undefined,
        transition:'transform .2s',
      }} className="dt-sidebar">
        <div style={{padding:'20px 16px 12px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{fontFamily:'monospace',fontSize:20,fontWeight:700,color:'#8B85FF',letterSpacing:-1}}>DevTrack</div>
          <div style={{fontSize:10,color:'#666',marginTop:2,textTransform:'uppercase',letterSpacing:2}}>Learning OS</div>
        </div>
        
        <div style={{padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{background:'#1A1A2E',borderRadius:10,padding:'10px 12px',marginBottom:8}}>
            <div style={{fontFamily:'monospace',fontSize:10,color:'#8B85FF',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Day {activeDay+1}</div>
            <div style={{fontFamily:'monospace',fontSize:24,fontWeight:700,color:'#fff',lineHeight:1.1}}>{new Date().getDate()}</div>
            <div style={{fontSize:11,color:'#666'}}>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][new Date().getMonth()]} {new Date().getFullYear()}</div>
          </div>
          <div style={{background:'#1A1A2E',borderRadius:10,padding:'8px 12px',display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:18}}>🔥</span>
            <div><div style={{fontFamily:'monospace',fontSize:18,fontWeight:700,color:'#FF8C5A',lineHeight:1}}>{user.streak||0}</div><div style={{fontSize:10,color:'#666'}}>day streak</div></div>
          </div>
        </div>
        
        <nav style={{flex:1,overflowY:'auto',padding:'8px 8px'}}>
          {NAV.map((item,i) => {
            if (item.sec) return <div key={i} style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:1.5,padding:'12px 8px 4px',fontWeight:600}}>{item.sec}</div>
            return (
              <button key={item.id} onClick={()=>{setView(item.id);setSidebar(false)}} style={{
                display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 10px',borderRadius:8,
                background: view===item.id ? 'rgba(139,133,255,.15)' : 'transparent',
                color: view===item.id ? '#8B85FF' : '#999',
                border:'none',cursor:'pointer',fontSize:13,fontWeight: view===item.id?600:400,
                transition:'all .15s',textAlign:'left',
              }}>
                <span style={{fontSize:14}}>{item.icon}</span>
                {item.label}
                {item.badge > 0 && <span style={{marginLeft:'auto',background:'#8B85FF',color:'#fff',borderRadius:10,padding:'1px 6px',fontSize:10,fontWeight:700}}>{item.badge}</span>}
              </button>
            )
          })}
        </nav>
        
        <div style={{padding:'8px 12px 16px',borderTop:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Today's Plan</div>
          <button onClick={()=>setView('schedule')} style={{width:'100%',background:'#1A1A2E',border:'none',borderRadius:8,padding:'8px 10px',textAlign:'left',cursor:'pointer',marginBottom:4}}>
            <div style={{fontSize:10,color:'#F5C842',fontWeight:700,textTransform:'uppercase'}}>Morning</div>
            <div style={{fontSize:12,color:'#fff',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{daySchedule.m.title}</div>
          </button>
          <button onClick={()=>setView('schedule')} style={{width:'100%',background:'#1A1A2E',border:'none',borderRadius:8,padding:'8px 10px',textAlign:'left',cursor:'pointer'}}>
            <div style={{fontSize:10,color:'#FF8C5A',fontWeight:700,textTransform:'uppercase'}}>Evening</div>
            <div style={{fontSize:12,color:'#fff',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{daySchedule.e.title}</div>
          </button>
        </div>
      </aside>
      
      {/* Main */}
      <main style={{flex:1,marginLeft:220,minHeight:'100vh'}} className="dt-main">
        {/* Mobile header */}
        <div style={{display:'none',position:'fixed',top:0,left:0,right:0,zIndex:40,background:'#13131E',borderBottom:'1px solid rgba(255,255,255,.07)',padding:'10px 16px',alignItems:'center',justifyContent:'space-between'}} className="dt-mhdr">
          <button onClick={()=>setSidebar(true)} style={{background:'none',border:'none',color:'#999',cursor:'pointer',fontSize:20}}>☰</button>
          <span style={{fontFamily:'monospace',fontWeight:700,color:'#8B85FF'}}>DevTrack</span>
          <button onClick={logout} style={{background:'none',border:'none',color:'#666',cursor:'pointer',fontSize:12}}>Logout</button>
        </div>
        
        <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 24px 60px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:8}}>
            <div style={{fontSize:12,color:'#555'}}>Signed in as <span style={{color:'#ccc',fontWeight:600}}>{user.name}</span></div>
            <button onClick={logout} style={{background:'none',border:'1px solid rgba(255,112,112,.3)',color:'#FF7070',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12}}>Logout</button>
          </div>
          
          {view==='dashboard' && <Dashboard user={user} updateUser={updateUser} setView={setView} activeDay={activeDay} />}
          {view==='schedule' && <Schedule user={user} updateUser={updateUser} showToast={showToast} activeDay={activeDay} />}
          {view==='timer' && <Timer user={user} updateUser={updateUser} showToast={showToast} />}
          {view==='roadmap' && <Roadmap user={user} updateUser={updateUser} showToast={showToast} />}
          {view==='tasks' && <Tasks user={user} updateUser={updateUser} showToast={showToast} />}
          {view==='sql' && <SqlPlayground user={user} updateUser={updateUser} showToast={showToast} />}
          {view==='project' && <Project user={user} updateUser={updateUser} showToast={showToast} />}
          {view==='progress' && <Progress user={user} setView={setView} />}
          {view==='notes' && <Notes user={user} updateUser={updateUser} showToast={showToast} />}
        </div>
      </main>
      
      {/* Toast */}
      <div style={{
        position:'fixed',bottom:24,right:24,zIndex:999,
        background: toast.type==='err' ? '#C0392B' : '#8B85FF',
        color:'#fff',borderRadius:10,padding:'10px 18px',fontSize:13,fontWeight:600,
        transition:'all .25s',opacity:toast.msg?1:0,transform:toast.msg?'translateY(0)':'translateY(16px)',
        pointerEvents:'none',
      }}>{toast.msg}</div>
      
      <style>{`
        @media(max-width:768px){.dt-sidebar{transform:translateX(-100%)!important}.dt-main{margin-left:0!important;padding-top:52px}.dt-mhdr{display:flex!important}}
        .dt-sidebar.open{transform:translateX(0)!important}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#333;border-radius:4px}
        .inp{width:100%;background:#1A1A2E;border:1px solid rgba(255,255,255,.1);color:#E0E0F0;border-radius:8px;padding:9px 12px;font-size:13px;outline:none;font-family:inherit}
        .inp:focus{border-color:#8B85FF}
        .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all .15s}
        .btn-p{background:#8B85FF;color:#fff}.btn-p:hover{background:#7A74FF}
        .btn-g{background:#1A1A2E;color:#999;border:1px solid rgba(255,255,255,.1)}.btn-g:hover{color:#fff;border-color:#8B85FF}
        .btn-r{background:rgba(255,112,112,.15);color:#FF7070;border:1px solid rgba(255,112,112,.2)}.btn-r:hover{background:rgba(255,112,112,.25)}
        .card{background:#13131E;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:18px}
        .tag{display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
        .note-card{background:#13131E;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px;transition:border-color .2s}.note-card:hover{border-color:rgba(139,133,255,.4)}
        .prog-bar{background:#1A1A2E;border-radius:4px;height:6px;overflow:hidden}
        .prog-fill{height:100%;border-radius:4px;transition:width .3s}
        .task-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.06);margin-bottom:6px;background:#13131E;transition:border-color .15s}.task-row:hover{border-color:rgba(139,133,255,.3)}
        .task-row.done{opacity:.5}
        .chk{width:18px;height:18px;border-radius:5px;border:2px solid rgba(255,255,255,.2);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
        .chk.on{background:#8B85FF;border-color:#8B85FF}
        .sesh-block{padding:14px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:#1A1A2E;cursor:pointer;width:100%;text-align:left;transition:all .2s}.sesh-block:hover{border-color:rgba(139,133,255,.5)}.sesh-block.done{background:rgba(139,133,255,.08);border-color:rgba(139,133,255,.3)}
        .topic-chip{background:#1A1A2E;border:1px solid rgba(255,255,255,.1);color:#999;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;transition:all .15s}.topic-chip:hover{background:rgba(139,133,255,.15);color:#8B85FF;border-color:#8B85FF}
        .wday-btn{padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:#1A1A2E;color:#666;cursor:pointer;text-align:center;transition:all .2s;min-width:56px}.wday-btn.active{border-color:#8B85FF;color:#8B85FF;background:rgba(139,133,255,.1)}.wday-btn.done-d{border-color:rgba(74,222,128,.3);color:#4ADE80;background:rgba(74,222,128,.05)}
        select.inp option{background:#1A1A2E;color:#E0E0F0}
        textarea.inp{resize:vertical;min-height:100px}
        .hcell{width:100%;aspect-ratio:1;border-radius:2px;background:#1A1A2E}.h1{background:#3B2D8A}.h2{background:#5B45CC}.h3{background:#7B65EE}.h4{background:#8B85FF}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
        .running{animation:pulse 2s infinite}
      `}</style>
    </div>
  )
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function Auth({ users, persist, setSession, showToast, toast }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'', startDate: todayKey() })

  function submit(e) {
    e.preventDefault()
    const email = form.email.trim().toLowerCase()
    if (!email || !form.password) return showToast('Fill all required fields','err')
    if (mode==='register') {
      if (!form.name.trim()) return showToast('Enter your name','err')
      if (users[email]) return showToast('Email already registered','err')
      const user = { ...emptyUser, name:form.name, email, passwordHash:btoa(form.password), registrationDate:form.startDate||todayKey(), createdAt:new Date().toISOString() }
      persist({ ...users, [email]: user })
      localStorage.setItem(SESSION_KEY, email)
      setSession(email)
      return
    }
    if (!users[email]) return showToast('No account found','err')
    if (users[email].passwordHash !== btoa(form.password)) return showToast('Wrong password','err')
    localStorage.setItem(SESSION_KEY, email)
    setSession(email)
  }

  const renderField = (label, k, type='text', placeholder='') => (
    <label style={{display:'block',marginBottom:12}}>
      <div style={{fontSize:11,color:'#666',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>{label}</div>
      <input className="inp" type={type} value={form[k]} placeholder={placeholder} onChange={e=>setForm({...form,[k]:e.target.value})} />
    </label>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0E0E16',color:'#E0E0F0',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:'system-ui,sans-serif'}}>
      <div style={{width:'100%',maxWidth:960,display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'center'}}>
        <div>
          <div style={{fontFamily:'monospace',fontSize:28,fontWeight:700,color:'#8B85FF',letterSpacing:-1,marginBottom:16}}>DevTrack</div>
          <h1 style={{fontSize:42,fontWeight:800,color:'#fff',lineHeight:1.1,margin:'0 0 16px'}}>Placement prep, structured from Day 1.</h1>
          <p style={{color:'#666',lineHeight:1.7,marginBottom:24}}>Every session, task, SQL drill, and focus log is stored locally — no backend needed. Your schedule advances only when you complete sessions, so no progress is lost.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {['Schedule-based day progression','SQL with CRUD operations','Accurate track analytics','Rich notes with search'].map(f=>(
              <div key={f} style={{background:'#13131E',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'10px 12px',display:'flex',alignItems:'center',gap:8,fontSize:13,fontWeight:600,color:'#ccc'}}>
                <span style={{color:'#4ADE80'}}>✓</span>{f}
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={submit} style={{background:'#13131E',border:'1px solid rgba(255,255,255,.07)',borderRadius:16,padding:28}}>
          <div style={{display:'flex',background:'#0E0E16',borderRadius:10,padding:4,marginBottom:20,gap:4}}>
            {['login','register'].map(m=>(
              <button key={m} type="button" onClick={()=>setMode(m)} style={{flex:1,padding:'8px',borderRadius:7,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,background:mode===m?'#8B85FF':'transparent',color:mode===m?'#fff':'#666',transition:'all .15s',textTransform:'capitalize'}}>{m}</button>
            ))}
          </div>
          {mode==='register' && renderField('Full Name', 'name')}
          {renderField('Email', 'email', 'email')}
          {renderField('Password', 'password', 'password')}
          {mode==='register' && renderField('Start Date', 'startDate', 'date')}
          <button className="btn btn-p" type="submit" style={{width:'100%',justifyContent:'center',marginTop:4}}>
            {mode==='register' ? '✚ Create Account' : '→ Login'}
          </button>
          <p style={{fontSize:11,color:'#444',marginTop:12,lineHeight:1.5}}>All data stored locally in your browser. Session persists until you manually logout.</p>
        </form>
      </div>
      {toast.msg && <div style={{position:'fixed',bottom:24,right:24,background:toast.type==='err'?'#C0392B':'#8B85FF',color:'#fff',borderRadius:10,padding:'10px 18px',fontSize:13,fontWeight:600}}>{toast.msg}</div>}
      <style>{`*{box-sizing:border-box}.inp{width:100%;background:#1A1A2E;border:1px solid rgba(255,255,255,.1);color:#E0E0F0;border-radius:8px;padding:9px 12px;font-size:13px;outline:none;font-family:inherit}.inp:focus{border-color:#8B85FF}`}</style>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user, updateUser, setView, activeDay }) {
  const now = new Date()
  const hour = now.getHours()
  const schedule = CUR[activeDay % CUR.length]
  const mKey = `d${activeDay}_morning`, eKey = `d${activeDay}_evening`
  const mDone = !!user.progress[mKey], eDone = !!user.progress[eKey]
  const todayMins = user.focusLog.filter(l=>l.dstr===now.toDateString()).reduce((s,l)=>s+l.mins,0)
  const doneTasks = user.tasks.filter(t=>t.done).length
  
  const trackStats = getTrackSessionStats(user, activeDay)

  function completeSession(slot) {
    const key = slot==='morning' ? mKey : eKey
    const val = !user.progress[key]
    const streak = nextStreak(user)
    updateUser(u => ({
      progress: {...u.progress, [key]: val},
      heatmap: {...(u.heatmap||{}), [todayKey()]: Math.max(0, (u.heatmap?.[todayKey()]||0)+(val?1:-1))},
      streak: val ? streak.streak : u.streak,
      lastActive: val ? streak.lastActive : u.lastActive,
    }))
  }

  return (
    <>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:32,fontWeight:800,color:'#fff',margin:0}}>{hour<12?'Good morning':hour<17?'Good afternoon':'Good evening'} {user.name.split(' ')[0]}!</h1>
        <p style={{color:'#666',marginTop:4,fontSize:14}}>Day {activeDay+1} of your preparation journey.</p>
      </div>
      
      {/* Stat row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[
          {l:"Focus Today",v:`${(todayMins/60).toFixed(1)}h`,s:"of 4h goal",c:'#8B85FF'},
          {l:"Tasks Done",v:doneTasks,s:`${user.tasks.length} total`,c:'#4ADE80'},
          {l:"Streak",v:`${user.streak||0}🔥`,s:"days active",c:'#FF8C5A'},
          {l:"Current Day",v:`Day ${activeDay+1}`,s:"in progress",c:'#F5C842'},
        ].map(s=>(
          <div key={s.l} className="card" style={{padding:'14px 16px'}}>
            <div style={{fontSize:11,color:'#555',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>{s.l}</div>
            <div style={{fontFamily:'monospace',fontSize:26,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:'#555',marginTop:2}}>{s.s}</div>
          </div>
        ))}
      </div>
      
      {/* Today sessions + quick actions */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:20}}>
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{fontSize:12,color:'#666',textTransform:'uppercase',letterSpacing:1}}>Today's Sessions — Day {activeDay+1}</div>
            <button onClick={()=>setView('schedule')} style={{background:'none',border:'none',color:'#8B85FF',cursor:'pointer',fontSize:12,fontWeight:600}}>View All →</button>
          </div>
          <button className={`sesh-block ${mDone?'done':''}`} onClick={()=>completeSession('morning')} style={{display:'block',width:'100%',marginBottom:8}}>
            <div style={{fontSize:10,color:'#F5C842',fontWeight:700,marginBottom:4}}>☀ MORNING {mDone?'· DONE ✓':''}</div>
            <div style={{fontWeight:700,color:'#fff',fontSize:14}}>{schedule.m.title}</div>
            <div style={{marginTop:6,display:'flex',gap:6,flexWrap:'wrap'}}>
              <TrackTag t={schedule.m.track} />
              {schedule.m.must && <span style={{fontSize:10,background:'rgba(255,112,112,.15)',color:'#FF7070',padding:'2px 8px',borderRadius:5,fontWeight:700}}>MUST DO</span>}
              <span style={{fontSize:11,color:'#555'}}>{schedule.m.est}min</span>
            </div>
          </button>
          <button className={`sesh-block ${eDone?'done':''}`} onClick={()=>completeSession('evening')} style={{display:'block',width:'100%'}}>
            <div style={{fontSize:10,color:'#FF8C5A',fontWeight:700,marginBottom:4}}>🌙 EVENING {eDone?'· DONE ✓':''}</div>
            <div style={{fontWeight:700,color:'#fff',fontSize:14}}>{schedule.e.title}</div>
            <div style={{marginTop:6,display:'flex',gap:6,flexWrap:'wrap'}}>
              <TrackTag t={schedule.e.track} />
              <span style={{fontSize:11,color:'#555'}}>{schedule.e.est}min</span>
            </div>
          </button>
          {mDone && eDone && (
            <div style={{marginTop:10,background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:8,padding:'8px 12px',fontSize:13,color:'#4ADE80',fontWeight:600}}>
              ✅ Day {activeDay+1} complete! Day {activeDay+2} unlocked.
            </div>
          )}
        </div>
        
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[
            {l:'Start Focus Timer',icon:'⏱',v:'timer',c:'#8B85FF'},
            {l:'Open Schedule',icon:'D',v:'schedule',c:'#F5C842'},
            {l:'Daily Tasks',icon:'✓',v:'tasks',c:'#4ADE80'},
            {l:'SQL Playground',icon:'🗄',v:'sql',c:'#4ADE80'},
            {l:'Learning Notes',icon:'N',v:'notes',c:'#C084FC'},
            {l:'View Progress',icon:'📊',v:'progress',c:'#F5C842'},
          ].map(a=>(
            <button key={a.v} onClick={()=>setView(a.v)} style={{background:'#13131E',border:`1px solid ${a.c}22`,borderRadius:10,padding:'12px',textAlign:'left',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:10}} onMouseEnter={e=>e.currentTarget.style.borderColor=a.c+'66'} onMouseLeave={e=>e.currentTarget.style.borderColor=a.c+'22'}>
              <span style={{fontSize:18}}>{a.icon}</span>
              <span style={{fontSize:13,fontWeight:600,color:'#ccc'}}>{a.l}</span>
              <span style={{marginLeft:'auto',color:'#555'}}>→</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Track analytics */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
        <div className="card">
          <div style={{fontSize:12,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:14}}>Track Progress</div>
          {Object.entries(trackStats).map(([track, ts])=>{
            const pct = Math.min(100, ts.pct)
            return (
              <div key={track} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:600,color:TRACKS[track]?.color||'#8B85FF'}}>{track}</span>
                  <span style={{fontFamily:'monospace',fontSize:11,color:'#555'}}>{ts.done}/{ts.total} ({pct}%)</span>
                </div>
                <div className="prog-bar"><div className="prog-fill" style={{width:`${pct}%`,background:TRACKS[track]?.color||'#8B85FF'}} /></div>
              </div>
            )
          })}
        </div>
        
        <div className="card">
          <div style={{fontSize:12,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:14}}>Pending Tasks</div>
          {user.tasks.filter(t=>!t.done).slice(0,5).map(task=>(
            <div key={task.id} className="task-row" style={{marginBottom:6}}>
              <TrackTag t={task.track} />
              <span style={{fontSize:13,color:'#ccc',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{task.title}</span>
            </div>
          ))}
          {!user.tasks.filter(t=>!t.done).length && <div style={{color:'#444',fontSize:13,textAlign:'center',padding:'20px 0'}}>No pending tasks 🎉</div>}
          <button onClick={()=>setView('tasks')} style={{width:'100%',marginTop:8,background:'none',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'8px',color:'#666',cursor:'pointer',fontSize:12}}>Manage All Tasks →</button>
        </div>
      </div>
      
      {/* Weekly activity */}
      <div className="card">
        <div style={{fontSize:12,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:14}}>Weekly Focus Activity</div>
        <WeekBars user={user} />
      </div>
    </>
  )
}

// ─── Schedule ─────────────────────────────────────────────────────────────────
function Schedule({ user, updateUser, showToast, activeDay }) {
  const [selected, setSelected] = useState(activeDay)
  const [daysToShow, setDaysToShow] = useState(14)
  const prog = user.progress || {}
  
  const visibleDays = Math.max(daysToShow, activeDay + 8)
  const days = Array.from({length:visibleDays},(_,i)=>i)
  const sched = CUR[selected % CUR.length]
  const mKey = `d${selected}_morning`, eKey = `d${selected}_evening`
  const mDone = !!prog[mKey], eDone = !!prog[eKey]
  const isFuture = selected > activeDay

  function toggle(slot) {
    if (isFuture) return showToast(`Complete Day ${activeDay+1} before unlocking this day`, 'err')
    const key = slot==='morning' ? mKey : eKey
    const val = !prog[key]
    const streak = nextStreak(user)
    const topic = slot==='morning' ? sched.m.title : sched.e.title
    const track = slot==='morning' ? sched.m.track : sched.e.track
    
    // Auto-inject must-do tasks when completing a session
    let newTasks = user.tasks
    if (val) {
      const autoT = getAutoTasks(topic, track)
      const existing = user.tasks.map(t=>t.title)
      const fresh = autoT.filter(t=>!existing.includes(t.title))
      if (fresh.length) { newTasks = [...fresh, ...user.tasks]; showToast(`${fresh.length} must-do tasks added!`) }
    }
    
    updateUser(u=>({
      progress:{...u.progress,[key]:val},
      tasks: newTasks,
      heatmap:{...u.heatmap,[todayKey()]:(u.heatmap?.[todayKey()]||0)+(val?1:0)},
      streak: val ? streak.streak : u.streak,
      lastActive: val ? streak.lastActive : u.lastActive,
    }))
    if (!newTasks.length || newTasks===user.tasks) showToast(val?'Session complete!':'Session reopened')
  }

  return (
    <>
      <h1 style={{fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Daily Schedule</h1>
      <p style={{color:'#666',fontSize:14,margin:'0 0 20px'}}>Complete both sessions to unlock the next day. You can complete any previous day's pending sessions.</p>
      
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
        {days.map(d=>{
          const done = isDayDone(prog,d)
          const isActive = d===activeDay
          const isPast = d<activeDay
          return (
            <button key={d} onClick={()=>setSelected(d)} className={`wday-btn ${selected===d?'active':''} ${done?'done-d':''}`}>
              <div style={{fontSize:10,color:'inherit',fontWeight:600}}>D{d+1}</div>
              <div style={{fontFamily:'monospace',fontSize:16,fontWeight:700,color:'inherit'}}>{done?'✓':isActive?'▶':isPast?'!':'○'}</div>
            </button>
          )
        })}
        <button onClick={()=>setDaysToShow(d=>d+14)} style={{background:'#1A1A2E',border:'1px dashed rgba(255,255,255,.1)',borderRadius:8,padding:'8px 12px',color:'#555',cursor:'pointer',fontSize:12}}>+14 →</button>
      </div>
      
      {isFuture && <div style={{background:'rgba(245,200,66,.08)',border:'1px solid rgba(245,200,66,.2)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#F5C842'}}>⚡ Future day — complete Day {activeDay+1} first to unlock it in sequence.</div>}
      
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {[['morning','☀','Morning 7-9 AM','m',mDone],['evening','🌙','Evening 6-8 PM','e',eDone]].map(([slot,icon,label,key,done])=>(
          <div key={slot} className="card">
            <div style={{fontSize:12,color:'#666',marginBottom:12,textTransform:'uppercase',letterSpacing:1}}>{icon} {label}</div>
            <div style={{background:done?'rgba(74,222,128,.06)':'#1A1A2E',border:`1px solid ${done?'rgba(74,222,128,.3)':'rgba(255,255,255,.08)'}`,borderRadius:10,padding:14,marginBottom:12}}>
              <div style={{fontWeight:700,color:'#fff',fontSize:15,marginBottom:8}}>{sched[key].title}</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                <TrackTag t={sched[key].track} />
                {sched[key].must && <span style={{fontSize:10,background:'rgba(255,112,112,.15)',color:'#FF7070',padding:'2px 8px',borderRadius:5,fontWeight:700}}>MUST DO</span>}
                <span style={{fontSize:11,color:'#555'}}>{sched[key].est} min</span>
              </div>
            </div>
            <button className={`btn ${done?'btn-g':'btn-p'}`} onClick={()=>toggle(slot)} style={{width:'100%',justifyContent:'center'}}>
              {done ? '↺ Mark Incomplete' : `✓ Mark ${slot.charAt(0).toUpperCase()+slot.slice(1)} Complete`}
            </button>
          </div>
        ))}
      </div>
      
      {mDone && eDone && (
        <div style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.25)',borderRadius:10,padding:'12px 16px',fontSize:14,color:'#4ADE80',fontWeight:600,textAlign:'center'}}>
          🎉 Day {selected+1} complete! Great work — keep the streak alive!
        </div>
      )}
    </>
  )
}

// ─── Timer (fixed: uses ref for interval, no stale closure) ──────────────────
function Timer({ user, updateUser, showToast }) {
  const [preset, setPreset] = useState(25)
  const [remaining, setRemaining] = useState(25*60)
  const [running, setRunning] = useState(false)
  const [topic, setTopic] = useState('DSA - Arrays Practice')
  const intervalRef = useRef(null)
  const remainRef = useRef(25*60)
  const presetRef = useRef(25)
  const endAtRef = useRef(null)
  const startedAtRef = useRef(null)

  function clearTimer() { if(intervalRef.current){clearInterval(intervalRef.current);intervalRef.current=null} }

  function startTimer() {
    clearTimer()
    startedAtRef.current = Date.now()
    endAtRef.current = Date.now() + remainRef.current * 1000
    setRunning(true)
    const tick = () => {
      const nextRemaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))
      remainRef.current = nextRemaining
      setRemaining(nextRemaining)
      if (nextRemaining <= 0) {
        clearTimer()
        setRunning(false)
        doLog(presetRef.current)
        remainRef.current = presetRef.current * 60
        setRemaining(presetRef.current * 60)
      }
    }
    tick()
    intervalRef.current = setInterval(tick, 1000)
  }

  function pauseTimer() {
    if (endAtRef.current) remainRef.current = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))
    clearTimer()
    setRemaining(remainRef.current)
    setRunning(false)
  }

  function resetTimer(min) {
    clearTimer()
    setRunning(false)
    const m = min ?? preset
    presetRef.current = m
    setPreset(m)
    remainRef.current = m * 60
    endAtRef.current = null
    startedAtRef.current = null
    setRemaining(m * 60)
  }

  function doLog(mins) {
    const minsToLog = mins || Math.max(1, Math.round((presetRef.current*60 - remainRef.current)/60))
    const now = new Date()
    const streak = nextStreak(user)
    const hk = todayKey()
    updateUser(u=>({
      focusLog:[{topic,mins:minsToLog,date:now.toISOString(),dstr:now.toDateString()},...u.focusLog],
      heatmap:{...u.heatmap,[hk]:(u.heatmap?.[hk]||0)+Math.max(1,Math.floor(minsToLog/30))},
      streak:streak.streak, lastActive:streak.lastActive,
    }))
    showToast(`✅ ${minsToLog} minutes logged!`)
  }

  useEffect(() => {
    if (!running) return undefined
    const sync = () => {
      if (!endAtRef.current) return
      const nextRemaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))
      remainRef.current = nextRemaining
      setRemaining(nextRemaining)
    }
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
    }
  }, [running])

  useEffect(() => () => clearTimer(), [])

  const mm = String(Math.floor(remaining/60)).padStart(2,'0')
  const ss = String(remaining%60).padStart(2,'0')
  const todayLogs = user.focusLog.filter(l=>l.dstr===new Date().toDateString())
  const todayTotal = todayLogs.reduce((s,l)=>s+l.mins,0)

  return (
    <>
      <h1 style={{fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Focus Timer</h1>
      <p style={{color:'#666',fontSize:14,margin:'0 0 20px'}}>Pomodoro presets, manual minutes, and automatic session logging.</p>
      
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          {/* Circle */}
          <div style={{position:'relative',width:200,height:200,borderRadius:'50%',border:'8px solid #1A1A2E',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>
            <div style={{textAlign:'center'}}>
              <div className={running?'running':''} style={{fontFamily:'monospace',fontSize:42,fontWeight:700,color:running?'#8B85FF':'#fff'}}>{mm}:{ss}</div>
              <div style={{fontSize:12,color:'#555',marginTop:4}}>{running?'● Focusing':'○ Ready'}</div>
            </div>
          </div>
          
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            <button className="btn btn-p" onClick={running?pauseTimer:startTimer}>{running?'⏸ Pause':'▶ Start'}</button>
            <button className="btn btn-g" onClick={()=>resetTimer()}>↺ Reset</button>
            <button className="btn btn-g" onClick={()=>doLog()}>💾 Log</button>
          </div>
          
          <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap',justifyContent:'center'}}>
            {[25,50,90,120].map(m=>(
              <button key={m} className={`btn ${preset===m?'btn-p':'btn-g'}`} onClick={()=>resetTimer(m)} style={{padding:'6px 12px',fontSize:12}}>{m}m</button>
            ))}
          </div>
          
          <div style={{width:'100%'}}>
            <label style={{display:'block',marginBottom:10}}>
              <div style={{fontSize:11,color:'#666',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>Custom minutes</div>
              <input className="inp" type="number" min="1" value={preset} onChange={e=>{const v=Number(e.target.value)||1;resetTimer(v)}} />
            </label>
            <label style={{display:'block'}}>
              <div style={{fontSize:11,color:'#666',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>Topic</div>
              <input className="inp" value={topic} onChange={e=>setTopic(e.target.value)} />
            </label>
          </div>
        </div>
        
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:12,color:'#666',textTransform:'uppercase',letterSpacing:1}}>Today's Log</div>
            <span style={{fontFamily:'monospace',fontSize:13,fontWeight:700,color:'#8B85FF'}}>{todayTotal} min</span>
          </div>
          {todayLogs.map((l,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,.05)',padding:'8px 0',fontSize:13}}>
              <span style={{color:'#ccc',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.topic}</span>
              <span style={{fontFamily:'monospace',color:'#8B85FF',marginLeft:12}}>{l.mins}m</span>
            </div>
          ))}
          {!todayLogs.length && <div style={{color:'#444',textAlign:'center',padding:'20px 0',fontSize:13}}>No sessions logged yet.</div>}
          <WeekBars user={user} />
        </div>
      </div>
    </>
  )
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────
function Roadmap({ updateUser, showToast }) {
  const [open, setOpen] = useState(0)
  const RM = [
    { track:'DSA', color:'#F5C842', dur:'26 weeks', phases:[
      { name:'Phase 1 — Foundation', weeks:'Weeks 1-3', topics:['Complexity analysis','Arrays: prefix sum, sliding window','Strings: hashing, palindromes','Sorting & binary search'], target:'60+ problems' },
      { name:'Phase 2 — Core Structures', weeks:'Weeks 4-7', topics:['Linked lists','Stacks & queues','Hashing patterns','Priority queues'], target:'50+ problems' },
      { name:'Phase 3 — Recursion & Backtracking', weeks:'Weeks 8-9', topics:['Recursion trees','Subsets & permutations','N Queens & Sudoku'], target:'20+ problems' },
      { name:'Phase 4 — Trees & Graphs', weeks:'Weeks 10-18', topics:['Binary trees','BST','BFS & DFS','Shortest paths','Union-find & MST'], target:'65+ problems' },
      { name:'Phase 5 — Dynamic Programming', weeks:'Weeks 19-23', topics:['1D DP','2D DP','Knapsack','LIS & LCS','DP on trees & bitmask'], target:'50+ problems' },
    ]},
    { track:'SQL & DS', color:'#4ADE80', dur:'8 weeks', phases:[
      { name:'SQL Core', weeks:'Weeks 1-3', topics:['SELECT & filters','Aggregates & GROUP BY','JOINs','Subqueries & CTEs'], target:'50 SQL problems' },
      { name:'Advanced SQL', weeks:'Weeks 4-5', topics:['Window functions','Recursive CTEs','Date & string functions','Cohort analysis'], target:'50 DataLemur' },
      { name:'Statistics', weeks:'Weeks 6-7', topics:['Descriptive stats','Probability','Hypothesis testing','A/B testing'], target:'Interview core' },
    ]},
    { track:'Full Stack', color:'#FF8C5A', dur:'12 weeks', phases:[
      { name:'Frontend', weeks:'Weeks 1-2', topics:['HTML/CSS','JS ES6+','React fundamentals','Tailwind CSS'], target:'' },
      { name:'Backend & DB', weeks:'Weeks 5-8', topics:['Express REST APIs','MongoDB & Mongoose','JWT auth','OAuth & RBAC'], target:'' },
      { name:'Advanced', weeks:'Weeks 9-12', topics:['Socket.io','Cloudinary','Payments','CI/CD & deployment'], target:'' },
    ]},
    { track:'Machine Learning', color:'#5AB4FF', dur:'10 weeks', phases:[
      { name:'Python for ML', weeks:'Weeks 1-2', topics:['NumPy','Pandas cleaning','Data visualization'], target:'' },
      { name:'Supervised Learning', weeks:'Weeks 6-8', topics:['Regression','Classification','Trees & forests','Metrics'], target:'Core ML' },
      { name:'Advanced ML', weeks:'Weeks 9-10', topics:['Clustering','PCA','XGBoost','MLOps basics'], target:'' },
    ]},
  ]

  function addTask(track, title) {
    const task = { id:`roadmap-${track}-${title}`, title, track:track.split(' ')[0].split('&')[0].trim()||'DSA', pri:'med', phase:'Roadmap', due:todayKey(), notes:'', done:false }
    updateUser(u=>({tasks:[task,...u.tasks]}))
    showToast(`Added: ${title}`)
  }

  return (
    <>
      <h1 style={{fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Learning Roadmap</h1>
      <p style={{color:'#666',fontSize:14,margin:'0 0 20px'}}>Click any topic to instantly add it as a task. Priority: DSA → SQL → Full Stack → ML.</p>
      
      <div className="card" style={{marginBottom:16,borderLeft:'3px solid #8B85FF'}}>
        <div style={{fontSize:11,color:'#666',marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>Priority Order</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {['DSA','SQL','Full Stack','ML','DS'].map(t=><TrackTag key={t} t={t} />)}
        </div>
      </div>
      
      {RM.map((r,i)=>(
        <div key={r.track} className="card" style={{marginBottom:12,borderLeft:`3px solid ${r.color}`}}>
          <button onClick={()=>setOpen(open===i?-1:i)} style={{display:'flex',width:'100%',alignItems:'center',justifyContent:'space-between',background:'none',border:'none',cursor:'pointer',textAlign:'left',padding:0}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:8,background:`${r.color}22`,color:r.color,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace',fontWeight:700,fontSize:13}}>0{i+1}</div>
              <div><div style={{fontWeight:700,color:'#fff'}}>{r.track}</div><div style={{fontSize:12,color:'#555'}}>{r.dur}</div></div>
            </div>
            <span style={{color:'#555',fontSize:16}}>{open===i?'▲':'▼'}</span>
          </button>
          {open===i && (
            <div style={{marginTop:16,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10}}>
              {r.phases.map(ph=>(
                <div key={ph.name} style={{background:'#1A1A2E',borderRadius:10,padding:12}}>
                  <div style={{fontWeight:700,color:'#fff',fontSize:13,marginBottom:4}}>{ph.name}</div>
                  {ph.target && <div style={{fontSize:11,color:'#8B85FF',marginBottom:8}}>🎯 {ph.target}</div>}
                  <div style={{fontSize:11,color:'#555',marginBottom:8}}>{ph.weeks}</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                    {ph.topics.map(tp=><button key={tp} onClick={()=>addTask(r.track,tp)} className="topic-chip">{tp}</button>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  )
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
function Tasks({ user, updateUser, showToast }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState({ title:'', track:'DSA', pri:'med', phase:'', due:todayKey(), notes:'' })
  
  const filtered = user.tasks.filter(t=>{
    const matchFilter = filter==='all'||(filter==='pending'?!t.done:filter==='done'?t.done:t.track===filter)
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })
  const pending = user.tasks.filter(t=>!t.done).length
  const done = user.tasks.filter(t=>t.done).length

  function add(e) {
    e.preventDefault()
    if (!draft.title.trim()) return showToast('Enter a task title','err')
    updateUser(u=>({tasks:[{...draft,id:Date.now(),done:false},...u.tasks]}))
    setDraft({...draft,title:'',phase:'',notes:''})
    showToast('Task added')
  }

  function patch(id, p) {
    const next = user.tasks.map(t=>t.id===id?{...t,...p}:t)
    const streak = p.done ? nextStreak(user) : user
    updateUser(()=>({tasks:next,streak:streak.streak||user.streak,lastActive:streak.lastActive||user.lastActive}))
  }

  function del(id) { updateUser(u=>({tasks:u.tasks.filter(t=>t.id!==id)})) }

  return (
    <>
      <h1 style={{fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Task Board</h1>
      <p style={{color:'#666',fontSize:14,margin:'0 0 16px'}}>Auto-tasks are injected when you complete schedule sessions. Must-do LeetCode problems appear here.</p>
      
      {/* Stats */}
      <div style={{display:'flex',gap:12,marginBottom:16}}>
        {[{l:'Pending',v:pending,c:'#F5C842'},{l:'Done',v:done,c:'#4ADE80'},{l:'Total',v:user.tasks.length,c:'#8B85FF'}].map(s=>(
          <div key={s.l} style={{background:'#13131E',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'10px 14px',flex:1,textAlign:'center'}}>
            <div style={{fontFamily:'monospace',fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:'#555',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
      
      {/* Add form */}
      <form onSubmit={add} className="card" style={{marginBottom:16}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:10,marginBottom:10}}>
          <input className="inp" placeholder="Task title" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} />
          <select className="inp" value={draft.track} onChange={e=>setDraft({...draft,track:e.target.value})}>
            {['DSA','SQL','ML','DS','FS','Project'].map(t=><option key={t}>{t}</option>)}
          </select>
          <select className="inp" value={draft.pri} onChange={e=>setDraft({...draft,pri:e.target.value})}>
            <option value="high">High</option><option value="med">Medium</option><option value="low">Low</option>
          </select>
          <input className="inp" type="date" value={draft.due} onChange={e=>setDraft({...draft,due:e.target.value})} />
        </div>
        <input className="inp" style={{marginBottom:10}} placeholder="Phase or context (optional)" value={draft.phase} onChange={e=>setDraft({...draft,phase:e.target.value})} />
        <button className="btn btn-p" type="submit" style={{width:'100%',justifyContent:'center'}}>+ Add Task</button>
      </form>
      
      {/* Filters + search */}
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16,alignItems:'center'}}>
        <input className="inp" style={{flex:'1 1 180px',maxWidth:240}} placeholder="🔍 Search tasks..." value={search} onChange={e=>setSearch(e.target.value)} />
        {['all','pending','done','DSA','SQL','ML','DS','FS','Project'].map(f=>(
          <button key={f} className={`btn ${filter===f?'btn-p':'btn-g'}`} style={{padding:'6px 12px',fontSize:12}} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>
      
      {filtered.map(task=>(
        <div key={task.id} className={`task-row ${task.done?'done':''}`} style={{
          borderLeft: task.pri==='high'?'3px solid #FF7070':task.pri==='low'?'3px solid #4ADE80':'3px solid #F5C842',
          marginBottom:6,
        }}>
          <button className={`chk ${task.done?'on':''}`} onClick={()=>patch(task.id,{done:!task.done})}>{task.done&&<span style={{color:'#fff',fontSize:10}}>✓</span>}</button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:task.done?'#555':'#fff',textDecoration:task.done?'line-through':'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{task.title}</div>
            <div style={{display:'flex',gap:6,marginTop:3,flexWrap:'wrap',alignItems:'center'}}>
              <TrackTag t={task.track} />
              {task.phase && <span style={{fontSize:10,color:'#555'}}>{task.phase}</span>}
              {task.due && <span style={{fontFamily:'monospace',fontSize:10,color:'#444'}}>{task.due}</span>}
              {task.auto && <span style={{fontSize:10,background:'rgba(245,200,66,.1)',color:'#F5C842',padding:'1px 6px',borderRadius:4}}>auto</span>}
            </div>
          </div>
          <span style={{fontSize:10,padding:'2px 8px',borderRadius:5,fontWeight:700,background:task.pri==='high'?'rgba(255,112,112,.15)':task.pri==='low'?'rgba(74,222,128,.12)':'rgba(245,200,66,.12)',color:task.pri==='high'?'#FF7070':task.pri==='low'?'#4ADE80':'#F5C842'}}>{task.pri}</span>
          <button onClick={()=>del(task.id)} style={{background:'none',border:'none',color:'#444',cursor:'pointer',fontSize:16,padding:4}} onMouseEnter={e=>e.currentTarget.style.color='#FF7070'} onMouseLeave={e=>e.currentTarget.style.color='#444'}>✕</button>
        </div>
      ))}
      {!filtered.length && <div style={{color:'#444',textAlign:'center',padding:'40px 0',fontSize:14}}>No tasks match this filter.</div>}
    </>
  )
}

// ─── SQL Playground ───────────────────────────────────────────────────────────
function SqlPlayground({ user, updateUser, showToast }) {
  const [ds, setDs] = useState('hr')
  const [query, setQuery] = useState(SQL_DATA.hr.samples[0])
  const [result, setResult] = useState(null)
  const data = SQL_DATA[ds]
  const liveTables = user.sqlData?.[ds] || data.tables

  function run() {
    const out = runSQL(query, ds, liveTables)
    setResult(out)
    updateUser(u=>({
      sqlAttempts:[{id:Date.now(),ds,query,ok:!out.error,date:new Date().toISOString()},...(u.sqlAttempts||[])].slice(0,50),
      ...(out.tables ? { sqlData:{...(u.sqlData||{}), [ds]:out.tables} } : {}),
    }))
    if (out.error) showToast('Query error — check syntax','err')
    else showToast(out.message || `${out.rows?.length||0} rows returned`)
  }

  function resetDataset() {
    updateUser(u => {
      const next = {...(u.sqlData||{})}
      delete next[ds]
      return { sqlData: next }
    })
    setResult(null)
    showToast(`${data.name} reset`)
  }

  return (
    <>
      <h1 style={{fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 4px'}}>SQL Playground</h1>
      <p style={{color:'#666',fontSize:14,margin:'0 0 20px'}}>Full CRUD support — SELECT, INSERT, UPDATE, DELETE. Changes apply to the in-memory session.</p>
      
      <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:16,alignItems:'start'}}>
        {/* Left panel */}
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Dataset</div>
            <div style={{display:'flex',gap:6,marginBottom:12}}>
              {Object.entries(SQL_DATA).map(([k,v])=>(
                <button key={k} className={`btn ${ds===k?'btn-p':'btn-g'}`} onClick={()=>{setDs(k);setQuery(v.samples[0]);setResult(null)}} style={{flex:1,justifyContent:'center',fontSize:12,padding:'6px 8px'}}>{v.name}</button>
              ))}
            </div>
            <p style={{fontSize:12,color:'#555',marginBottom:10}}>{data.desc}</p>
            <div style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Tables</div>
            {Object.entries(liveTables).map(([nm,rows])=>(
              <div key={nm} style={{background:'#0E0E16',borderRadius:8,padding:'8px 10px',marginBottom:6}}>
                <div style={{fontFamily:'monospace',fontSize:11,fontWeight:700,color:'#8B85FF',marginBottom:2}}>{nm}</div>
                <div style={{fontSize:10,color:'#444',lineHeight:1.6}}>{Object.keys(rows[0]).join(' · ')}</div>
                <div style={{fontSize:10,color:'#333',marginTop:2}}>{rows.length} rows</div>
              </div>
            ))}
          </div>
          
          <div className="card">
            <div style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Sample Queries</div>
            <button className="btn btn-g" onClick={resetDataset} style={{width:'100%',justifyContent:'center',fontSize:12,padding:'6px 8px',marginBottom:8}}>Reset dataset</button>
            <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:6}}>
              {['SELECT','JOIN','GROUP BY','RANK()','INSERT','UPDATE','DELETE'].map(t=>(
                <span key={t} style={{fontSize:10,background:'#1A1A2E',padding:'2px 8px',borderRadius:4,color:'#8B85FF',fontFamily:'monospace'}}>{t}</span>
              ))}
            </div>
            {data.samples.map((s,i)=>(
              <button key={i} onClick={()=>setQuery(s)} style={{display:'block',width:'100%',textAlign:'left',background:'#1A1A2E',border:'1px solid rgba(255,255,255,.06)',borderRadius:7,padding:'7px 10px',cursor:'pointer',fontSize:11,color:'#666',marginBottom:5,fontFamily:'monospace',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.color='#ccc';e.currentTarget.style.borderColor='rgba(139,133,255,.4)'}} onMouseLeave={e=>{e.currentTarget.style.color='#666';e.currentTarget.style.borderColor='rgba(255,255,255,.06)'}}>
                {s.length>60?s.slice(0,60)+'…':s}
              </button>
            ))}
          </div>
        </div>
        
        {/* Right panel */}
        <div>
          <div className="card" style={{marginBottom:12}}>
            <div style={{fontSize:11,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Query Editor</div>
            <textarea className="inp" style={{minHeight:140,fontFamily:'monospace',fontSize:12,lineHeight:1.6}} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();run()}}} />
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
              <span style={{fontSize:11,color:'#444'}}>Ctrl+Enter to run</span>
              <button className="btn btn-p" onClick={run}>▶ Run Query</button>
            </div>
          </div>
          
          {result && (
            <div className="card">
              {result.error && <div style={{background:'rgba(255,112,112,.1)',border:'1px solid rgba(255,112,112,.2)',borderRadius:8,padding:'10px 12px',color:'#FF7070',fontSize:13}}>{result.error}</div>}
              {result.message && <div style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:8,padding:'10px 12px',color:'#4ADE80',fontSize:13,marginBottom:result.rows?.length?10:0}}>✅ {result.message} {result.affected!=null?`(${result.affected} rows affected)`:''}</div>}
              {result.rows?.length > 0 && (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                    <thead>
                      <tr>{result.columns.map(c=><th key={c} style={{border:'1px solid rgba(255,255,255,.08)',background:'#1A1A2E',padding:'7px 10px',textAlign:'left',color:'#8B85FF',fontFamily:'monospace',textTransform:'uppercase',fontSize:10,letterSpacing:.5}}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row,i)=>(
                        <tr key={i} style={{background:i%2===0?'transparent':'rgba(255,255,255,.02)'}}>
                          {result.columns.map(c=><td key={c} style={{border:'1px solid rgba(255,255,255,.06)',padding:'7px 10px',color:'#ccc'}}>{String(row[c])}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{fontSize:11,color:'#444',marginTop:6}}>{result.rows.length} rows returned</div>
                </div>
              )}
              {result.rows?.length === 0 && !result.error && <div style={{color:'#444',textAlign:'center',padding:'20px 0',fontSize:13}}>Query returned 0 rows.</div>}
            </div>
          )}
          {!result && <div style={{color:'#444',textAlign:'center',padding:'40px 0',fontSize:13}}>Run a query to see results here.</div>}
        </div>
      </div>
    </>
  )
}

// ─── Project ──────────────────────────────────────────────────────────────────
const MODS = [
  { id:'auth', name:'1. Authentication System', time:'1 week', features:['JWT register/login','Refresh tokens','Google OAuth','Password reset','RBAC'] },
  { id:'feed', name:'2. Post & Feed Module', time:'1 week', features:['Post CRUD','Markdown editor','Tags','Infinite scroll','Bookmarks'] },
  { id:'comments', name:'3. Comments & Discussions', time:'4 days', features:['Nested comments','Votes','Mentions','Real-time updates'] },
  { id:'search', name:'4. Search & Discovery', time:'4 days', features:['Full-text search','Tag filters','Trending posts','Profiles'] },
  { id:'notifs', name:'5. Notifications', time:'3 days', features:['In-app alerts','Email digest','Real-time bell','Preferences'] },
  { id:'payment', name:'6. Payment Gateway', time:'1 week', features:['Checkout','Subscriptions','Webhooks','Invoices','Refunds'] },
  { id:'upload', name:'7. Media Uploads', time:'2 days', features:['Cloudinary','Profile photos','Cover images','Validation'] },
  { id:'admin', name:'8. Admin Dashboard', time:'5 days', features:['Users','Moderation','Analytics','Restrictions','Reports'] },
  { id:'api', name:'9. Public API and Docs', time:'3 days', features:['REST API','Swagger docs','Rate limits','API keys'] },
  { id:'deploy', name:'10. Deployment & DevOps', time:'2 days', features:['Vercel','Railway','MongoDB Atlas','GitHub Actions'] },
]

function Project({ user, updateUser, showToast }) {
  const done = Object.values(user.modProgress||{}).filter(s=>s==='done').length
  const pct = Math.round((done/MODS.length)*100)
  const nextMod = MODS.find(m=>(user.modProgress?.[m.id]||'not-started')!=='done')

  return (
    <>
      <h1 style={{fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Full Stack Project</h1>
      <p style={{color:'#666',fontSize:14,margin:'0 0 16px'}}>DevHive - developer Q&A platform with auth, posts, real-time discussions, payments, search, APIs, and deployment.</p>
      
      <div className="card" style={{marginBottom:16,borderLeft:'3px solid #8B85FF'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <span style={{fontWeight:700,color:'#fff',fontSize:16}}>DevHive Portfolio Build</span>
          <span style={{fontFamily:'monospace',fontSize:24,fontWeight:700,color:'#8B85FF'}}>{pct}%</span>
        </div>
        <div className="prog-bar"><div className="prog-fill" style={{width:`${pct}%`,background:'#8B85FF'}} /></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:12}}>
          {[{l:'Next Build',v:nextMod?.name||'All done!'},{l:'Backend',v:'Express + MongoDB + JWT'},{l:'Project Goal',v:'Production-ready Q&A platform'}].map(i=>(
            <div key={i.l} style={{background:'#1A1A2E',borderRadius:8,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:'#555',textTransform:'uppercase',marginBottom:4}}>{i.l}</div>
              <div style={{fontSize:12,fontWeight:600,color:'#ccc'}}>{i.v}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:12}}>
        {MODS.map(mod=>{
          const status = user.modProgress?.[mod.id]||'not-started'
          const statusColors = { done:['rgba(74,222,128,.08)','rgba(74,222,128,.25)','#4ADE80'], 'in-progress':['rgba(245,200,66,.06)','rgba(245,200,66,.2)','#F5C842'], 'not-started':['transparent','rgba(255,255,255,.07)','#555'] }
          const [bg,border,col] = statusColors[status]
          return (
            <div key={mod.id} className="card" style={{background:bg,borderColor:border}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{mod.name}</div>
                <span style={{fontSize:10,padding:'2px 8px',borderRadius:5,background:border,color:col,fontWeight:700,whiteSpace:'nowrap',marginLeft:8}}>{status}</span>
              </div>
              <div style={{fontSize:11,color:'#555',marginBottom:8}}>{mod.time}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                {mod.features.map(f=><span key={f} className="topic-chip" style={{cursor:'default'}}>{f}</span>)}
              </div>
              <div style={{display:'flex',gap:6}}>
                {['in-progress','done','not-started'].map(s=>(
                  <button key={s} className="btn btn-g" style={{flex:1,justifyContent:'center',padding:'5px 6px',fontSize:10}} onClick={()=>{updateUser(u=>({modProgress:{...u.modProgress,[mod.id]:s}}));showToast(`Set to ${s}`)}}>{s==='in-progress'?'▶':s==='done'?'✓':'○'} {s}</button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ─── Progress ─────────────────────────────────────────────────────────────────
function Progress({ user }) {
  const trackColors = { DSA:'#F5C842', SQL:'#4ADE80', FS:'#FF8C5A', ML:'#5AB4FF', DS:'#C084FC', REV:'#FF7070', PROJ:'#8B85FF' }
  const totalDays = getActiveDay(user)
  const sessionStats = getTrackSessionStats(user, totalDays)
  
  const taskStats = ['DSA','SQL','ML','FS','DS','Project'].reduce((acc,t)=>{
    const all = user.tasks.filter(t2=>t2.track===t)
    acc[t] = { done:all.filter(t2=>t2.done).length, total:all.length }
    return acc
  },{})
  
  const totalFocus = user.focusLog.reduce((s,l)=>s+l.mins,0)
  const totalSessions = Object.values(user.progress).filter(Boolean).length
  
  return (
    <>
      <h1 style={{fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Progress & Analytics</h1>
      <p style={{color:'#666',fontSize:14,margin:'0 0 20px'}}>Heatmap, track completion, task stats, and weekly activity.</p>
      
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:20}}>
        {[{l:'Current Day',v:totalDays+1,c:'#8B85FF'},{l:'Sessions Done',v:totalSessions,c:'#4ADE80'},{l:'Total Focus',v:`${Math.round(totalFocus/60)}h`,c:'#F5C842'},{l:'Tasks Done',v:user.tasks.filter(t=>t.done).length,c:'#5AB4FF'}].map(s=>(
          <div key={s.l} className="card" style={{textAlign:'center',padding:'14px 10px'}}>
            <div style={{fontFamily:'monospace',fontSize:28,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:'#555',marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
      
      {/* Heatmap */}
      <div className="card" style={{marginBottom:16}}>
        <div style={{fontSize:12,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Activity Heatmap</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(52,minmax(0,1fr))',gap:2}}>
          {Array.from({length:364},(_,i)=>{
            const d=new Date(); d.setDate(d.getDate()-(363-i))
            const v=user.heatmap?.[todayKey(d)]||0
            return <div key={i} className={`hcell ${v>=4?'h4':v===3?'h3':v===2?'h2':v===1?'h1':''}`} title={`${todayKey(d)}: ${v}`} style={{aspectRatio:1,borderRadius:2}} />
          })}
        </div>
        <div style={{display:'flex',gap:6,marginTop:8,alignItems:'center'}}>
          <span style={{fontSize:11,color:'#444'}}>Less</span>
          {['#1A1A2E','#3B2D8A','#5B45CC','#7B65EE','#8B85FF'].map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:2,background:c}} />)}
          <span style={{fontSize:11,color:'#444'}}>More</span>
        </div>
      </div>
      
      {/* Track progress */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div className="card">
          <div style={{fontSize:12,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:14}}>Session Completion by Track</div>
          {Object.entries(sessionStats).filter(([t])=>t!=='REV'&&t!=='PROJ').map(([track,s])=>(
            <div key={track} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:600,color:trackColors[track]||'#8B85FF'}}>{track}</span>
                <span style={{fontFamily:'monospace',fontSize:11,color:'#555'}}>{s.done}/{s.total} ({s.pct}%)</span>
              </div>
              <div className="prog-bar"><div className="prog-fill" style={{width:`${s.pct}%`,background:trackColors[track]||'#8B85FF'}} /></div>
            </div>
          ))}
        </div>
        
        <div className="card">
          <div style={{fontSize:12,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:14}}>Task Stats by Track</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {Object.entries(taskStats).map(([t,s])=>(
              <div key={t} style={{background:'#1A1A2E',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:12,fontWeight:700,color:trackColors[t]||'#8B85FF',marginBottom:4}}>{t}</div>
                <div style={{fontFamily:'monospace',fontSize:20,fontWeight:700,color:'#fff'}}>{s.done}<span style={{fontSize:13,color:'#444'}}>/{s.total}</span></div>
                {s.total>0&&<div className="prog-bar" style={{marginTop:6}}><div className="prog-fill" style={{width:`${Math.round(s.done/s.total*100)}%`,background:trackColors[t]||'#8B85FF'}} /></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="card">
        <div style={{fontSize:12,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Weekly Focus (last 7 days)</div>
        <WeekBars user={user} />
      </div>
    </>
  )
}

// ─── Notes ────────────────────────────────────────────────────────────────────
const NOTE_TEMPLATES = [
  { label:'Problem Solved', icon:'⚡', text:'Problem: \nApproach:\nComplexity: O() time, O() space\nEdge cases:\nKey insight:' },
  { label:'Concept Note', icon:'📖', text:'Topic: \nDefinition:\nWhen to use:\nExample:\nCommon mistakes:' },
  { label:'Interview Prep', icon:'💼', text:'Question: \nBrute force:\nOptimal approach:\nCode:\nFollow-ups:' },
  { label:'Daily Summary', icon:'📋', text:`${new Date().toLocaleDateString()} Summary\n\nCompleted:\n- \n\nStruggled with:\n- \n\nTomorrow's focus:` },
]

function Notes({ user, updateUser, showToast }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState({ track:'DSA', title:'', text:'', tags:'', pinned:false })
  const [editing, setEditing] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const filtered = user.notes.filter(n=>{
    const mF = filter==='all'||(filter==='pinned'?n.pinned:n.track===filter)
    const mS = !search||`${n.title} ${n.text} ${n.tags}`.toLowerCase().includes(search.toLowerCase())
    return mF && mS
  })

  function save(e) {
    e.preventDefault()
    if (!draft.text.trim()) return showToast('Write something first','err')
    if (editing!=null) {
      updateUser(u=>({notes:u.notes.map(n=>n.id===editing?{...n,...draft,updated:new Date().toISOString()}:n)}))
      setEditing(null)
      showToast('Note updated')
    } else {
      updateUser(u=>({notes:[{...draft,id:Date.now(),date:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),created:new Date().toISOString()},...u.notes]}))
      showToast('Note saved')
    }
    setDraft({track:'DSA',title:'',text:'',tags:'',pinned:false})
  }

  function editNote(n) {
    setDraft({track:n.track,title:n.title,text:n.text,tags:n.tags||'',pinned:n.pinned||false})
    setEditing(n.id)
    window.scrollTo({top:0,behavior:'smooth'})
  }

  function togglePin(id) {
    updateUser(u=>({notes:u.notes.map(n=>n.id===id?{...n,pinned:!n.pinned}:n)}))
  }

  return (
    <>
      <h1 style={{fontSize:28,fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Learning Notes</h1>
      <p style={{color:'#666',fontSize:14,margin:'0 0 16px'}}>Capture notes with templates, pin important ones, search across all, and tag by track.</p>
      
      {/* Templates */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <span style={{fontSize:11,color:'#555',alignSelf:'center',textTransform:'uppercase',letterSpacing:1}}>Templates:</span>
        {NOTE_TEMPLATES.map(t=>(
          <button key={t.label} className="btn btn-g" style={{fontSize:12,padding:'6px 12px'}} onClick={()=>setDraft(d=>({...d,text:t.text,title:t.label}))}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      
      {/* Editor */}
      <form onSubmit={save} className="card" style={{marginBottom:16}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr 1fr',gap:10,marginBottom:10}}>
          <select className="inp" value={draft.track} onChange={e=>setDraft({...draft,track:e.target.value})}>
            {['DSA','SQL','ML','DS','FS','General'].map(t=><option key={t}>{t}</option>)}
          </select>
          <input className="inp" placeholder="Title" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} />
          <input className="inp" placeholder="Tags: arrays, dp, hard" value={draft.tags} onChange={e=>setDraft({...draft,tags:e.target.value})} />
        </div>
        <textarea className="inp" style={{minHeight:130,fontFamily:'monospace',fontSize:12,lineHeight:1.7}} placeholder="Use code blocks, bullet points, formulas, observations..." value={draft.text} onChange={e=>setDraft({...draft,text:e.target.value})} />
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:10}}>
          <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:13,color:'#666'}}>
            <input type="checkbox" checked={draft.pinned} onChange={e=>setDraft({...draft,pinned:e.target.checked})} /> 📌 Pin this note
          </label>
          <div style={{display:'flex',gap:8}}>
            {editing!=null && <button type="button" className="btn btn-r" onClick={()=>{setEditing(null);setDraft({track:'DSA',title:'',text:'',tags:'',pinned:false})}}>Cancel</button>}
            <button className="btn btn-p" type="submit">{editing!=null?'💾 Update':'+ Save Note'}</button>
          </div>
        </div>
      </form>
      
      {/* Filters */}
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16,alignItems:'center'}}>
        <input className="inp" style={{flex:'1 1 180px',maxWidth:240}} placeholder="🔍 Search notes..." value={search} onChange={e=>setSearch(e.target.value)} />
        {['all','pinned','DSA','SQL','ML','DS','FS','General'].map(f=>(
          <button key={f} className={`btn ${filter===f?'btn-p':'btn-g'}`} style={{padding:'6px 12px',fontSize:12}} onClick={()=>setFilter(f)}>
            {f==='pinned'?'📌 ':''}{f}
          </button>
        ))}
      </div>
      
      {/* Notes grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
        {filtered.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)).map(note=>(
          <div key={note.id} className="note-card" style={{position:'relative',borderColor:note.pinned?'rgba(245,200,66,.3)':'rgba(255,255,255,.07)'}}>
            {note.pinned && <div style={{position:'absolute',top:10,right:10,fontSize:14}}>📌</div>}
            <div style={{display:'flex',gap:6,marginBottom:6,alignItems:'center',flexWrap:'wrap'}}>
              <TrackTag t={note.track} />
              <span style={{fontSize:10,color:'#444'}}>{note.date}</span>
            </div>
            {note.title && <div style={{fontWeight:700,color:'#fff',fontSize:13,marginBottom:6}}>{note.title}</div>}
            <pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit',fontSize:12,color:'#999',lineHeight:1.6,margin:0,maxHeight: expanded===note.id?'none':'120px',overflow:'hidden'}}>
              {note.text}
            </pre>
            {note.text.length>200 && (
              <button onClick={()=>setExpanded(expanded===note.id?null:note.id)} style={{background:'none',border:'none',color:'#8B85FF',cursor:'pointer',fontSize:11,marginTop:4,padding:0}}>
                {expanded===note.id?'▲ Show less':'▼ Show more'}
              </button>
            )}
            {note.tags && <div style={{fontSize:10,color:'#555',marginTop:6}}>#{note.tags}</div>}
            <div style={{display:'flex',gap:6,marginTop:10}}>
              <button onClick={()=>editNote(note)} style={{flex:1,background:'rgba(139,133,255,.1)',border:'1px solid rgba(139,133,255,.2)',borderRadius:6,padding:'5px',cursor:'pointer',color:'#8B85FF',fontSize:11}}>✏ Edit</button>
              <button onClick={()=>togglePin(note.id)} style={{background:'rgba(245,200,66,.08)',border:'1px solid rgba(245,200,66,.15)',borderRadius:6,padding:'5px 8px',cursor:'pointer',color:'#F5C842',fontSize:11}}>{note.pinned?'Unpin':'📌 Pin'}</button>
              <button onClick={()=>{updateUser(u=>({notes:u.notes.filter(n=>n.id!==note.id)}));showToast('Note deleted')}} style={{background:'rgba(255,112,112,.08)',border:'1px solid rgba(255,112,112,.15)',borderRadius:6,padding:'5px 8px',cursor:'pointer',color:'#FF7070',fontSize:11}}>✕</button>
            </div>
          </div>
        ))}
      </div>
      {!filtered.length && <div style={{color:'#444',textAlign:'center',padding:'40px 0',fontSize:14}}>No notes yet. Use a template above to get started!</div>}
    </>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────
function TrackTag({ t }) {
  const tr = TRACKS[t] || TRACKS.DSA
  return <span className="tag" style={{background:tr.bg,color:tr.color}}>{t}</span>
}

function WeekBars({ user }) {
  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i))
    const mins=user.focusLog.filter(l=>l.dstr===d.toDateString()).reduce((s,l)=>s+l.mins,0)
    return { day:['S','M','T','W','T','F','S'][d.getDay()], mins }
  })
  const max = Math.max(1,...days.map(d=>d.mins))
  return (
    <div style={{marginTop:16}}>
      <div style={{display:'flex',alignItems:'flex-end',height:70,gap:4}}>
        {days.map((d,i)=>(
          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
            <div style={{width:'100%',borderRadius:'3px 3px 0 0',background:'#8B85FF',opacity:d.mins?1:.2,height:`${Math.max(4,(d.mins/max)*62)}px`,transition:'height .3s'}} title={`${d.mins}min`} />
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:4,marginTop:4}}>
        {days.map((d,i)=><div key={i} style={{flex:1,textAlign:'center',fontSize:10,color:'#444'}}>{d.day}</div>)}
      </div>
    </div>
  )
}
