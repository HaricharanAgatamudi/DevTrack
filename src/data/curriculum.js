export const TRACKS = {
  DSA: { color: '#F5C842', tag: 'dsa' },
  ML: { color: '#5AB4FF', tag: 'ml' },
  DS: { color: '#4ADE80', tag: 'ds' },
  FS: { color: '#FF8C5A', tag: 'fs' },
  SQL: { color: '#4ADE80', tag: 'sql' },
  PROJ: { color: '#8B85FF', tag: 'proj' },
  REV: { color: '#FF7070', tag: 'rev' },
  Project: { color: '#8B85FF', tag: 'proj' },
}

function session(title, track, est = 120, mustDo = false) {
  return { title, track, est, mustDo }
}

export const CURRICULUM = [
  { morning: session('Arrays - traversal, prefix sum, two pointers', 'DSA', 120, true), evening: session('FS - project setup, Git, Vite, React scaffold', 'FS') },
  { morning: session('Arrays - sliding window, Kadane, Dutch flag', 'DSA', 120, true), evening: session('SQL - SELECT, WHERE, ORDER BY, LIMIT', 'SQL') },
  { morning: session('Arrays - 2D arrays, spiral, rotate, practice set', 'DSA', 120, true), evening: session('FS - React components, JSX, props, state', 'FS') },
  { morning: session('Strings - frequency count, two pointers, hashing', 'DSA', 120, true), evening: session('SQL - aggregates, GROUP BY, HAVING', 'SQL') },
  { morning: session('Strings - palindrome, anagram, KMP, Rabin-Karp', 'DSA', 120, true), evening: session('FS - React hooks: effect, ref, context', 'FS') },
  { morning: session('Sorting - bubble, selection, insertion, merge, quick', 'DSA'), evening: session('SQL - joins: inner, left, right, self', 'SQL') },
  { morning: session('DSA revision - arrays and strings timed practice', 'REV'), evening: session('Project - DevHive backend with Express and MongoDB', 'PROJ') },
  { morning: session('Binary search - basics, lower bound, upper bound', 'DSA'), evening: session('ML - Python OOP, files, comprehensions', 'ML') },
  { morning: session('Binary search - search on answer, rotated array, peak', 'DSA', 120, true), evening: session('SQL - subqueries, CTEs, WITH clause', 'SQL') },
  { morning: session('Recursion - base cases, call stack, recursion trees', 'DSA'), evening: session('FS - Tailwind CSS, responsive layouts', 'FS') },
  { morning: session('Linked lists - singly, doubly, circular, operations', 'DSA', 120, true), evening: session('ML - NumPy arrays, broadcasting, matrix ops', 'ML') },
  { morning: session('Linked lists - fast/slow pointers, cycle, reverse, merge', 'DSA', 120, true), evening: session('SQL - window functions: rank, lag, lead', 'SQL') },
  { morning: session('Stacks - monotonic stack, next greater, min stack', 'DSA'), evening: session('FS - React Router and protected routes', 'FS') },
  { morning: session('DSA revision - linked lists and stacks', 'REV'), evening: session('Project - JWT register, login, refresh flow', 'PROJ') },
  { morning: session('Queues and deques - circular queue, priority queue', 'DSA'), evening: session('ML - Pandas cleaning, groupby, merge', 'ML') },
  { morning: session('Hashing - maps, sets, frequency patterns, two sum', 'DSA'), evening: session('SQL - string functions, date functions, CASE', 'SQL') },
  { morning: session('DS - statistics: mean, variance, distributions', 'DS'), evening: session('ML - linear algebra: vectors, matrices, dot product', 'ML') },
  { morning: session('Backtracking - subsets, combinations, permutations', 'DSA', 120, true), evening: session('FS - Redux Toolkit, React Query, forms', 'FS') },
  { morning: session('Backtracking - N Queens, Sudoku, word search', 'DSA', 120, true), evening: session('SQL - self joins, recursive CTEs, analytics', 'SQL') },
  { morning: session('ML - probability, Bayes, expected value', 'ML'), evening: session('Project - posts, feed, markdown editor', 'PROJ') },
  { morning: session('DSA revision - hashing and backtracking', 'REV'), evening: session('DS - EDA and data cleaning with Pandas', 'DS') },
  { morning: session('Binary trees - traversals, height, diameter', 'DSA', 120, true), evening: session('FS - Node.js, Express REST API, middleware', 'FS') },
  { morning: session('Binary trees - LCA, path sum, views, balanced tree', 'DSA', 120, true), evening: session('SQL - LeetCode SQL 50 practice batch 1', 'SQL') },
  { morning: session('BST - insert, delete, validate, kth smallest', 'DSA', 120, true), evening: session('ML - preprocessing, scaling, encoding', 'ML') },
  { morning: session('Heaps - heapify, top K, merge K sorted lists', 'DSA'), evening: session('FS - MongoDB, Mongoose schemas, aggregation', 'FS') },
  { morning: session('Greedy - activity selection, intervals, knapsack', 'DSA'), evening: session('SQL - window function practice batch', 'SQL') },
  { morning: session('ML - linear regression, gradient descent, Ridge, Lasso', 'ML', 120, true), evening: session('Project - comments and nested replies', 'PROJ') },
  { morning: session('DSA revision - trees, heaps, greedy', 'REV'), evening: session('DS - visualization with Matplotlib and Seaborn', 'DS') },
  { morning: session('Graphs - representation, BFS, DFS, components', 'DSA', 120, true), evening: session('FS - JWT, bcrypt, role based access control', 'FS') },
  { morning: session('Graphs - topological sort and cycle detection', 'DSA', 120, true), evening: session('SQL - LeetCode SQL 50 practice batch 2', 'SQL') },
  { morning: session('Graphs - Dijkstra, Bellman-Ford, shortest paths', 'DSA', 120, true), evening: session('ML - logistic regression, KNN, Naive Bayes', 'ML') },
  { morning: session('Graphs - union find, Kruskal, Prim MST', 'DSA'), evening: session('Project - real-time notifications with Socket.io', 'PROJ') },
  { morning: session('ML - decision trees, entropy, Gini, pruning', 'ML', 120, true), evening: session('FS - real-time chat with Socket.io', 'FS') },
  { morning: session('ML - random forest, bagging, ensemble methods', 'ML', 120, true), evening: session('SQL - DataLemur medium practice batch', 'SQL') },
  { morning: session('DSA revision - full graph contest simulation', 'REV'), evening: session('DS - hypothesis testing and confidence intervals', 'DS') },
  { morning: session('DP - memoization, tabulation, 1D patterns', 'DSA', 120, true), evening: session('FS - Redis cache, email, file uploads', 'FS') },
  { morning: session('DP - 2D grids, edit distance, coin change', 'DSA', 120, true), evening: session('ML - SVM, kernels, XGBoost overview', 'ML') },
  { morning: session('DP - knapsack variants and subset sum', 'DSA', 120, true), evening: session('Project - search and tag filters', 'PROJ') },
  { morning: session('DP - LIS, LCS, DP on strings', 'DSA', 120, true), evening: session('SQL - cohort analysis and retention queries', 'SQL') },
  { morning: session('DP - trees, graphs, bitmask DP', 'DSA', 120, true), evening: session('ML - metrics: precision, recall, F1, ROC-AUC', 'ML') },
  { morning: session('DSA revision - DP timed contest', 'REV'), evening: session('DS - A/B testing and significance', 'DS') },
  { morning: session('Tries - prefix tree, autocomplete, word search', 'DSA'), evening: session('FS - payments with Razorpay or Stripe', 'FS') },
  { morning: session('Segment trees - range queries and lazy propagation', 'DSA'), evening: session('Project - subscriptions and webhook handling', 'PROJ') },
  { morning: session('Bit manipulation - XOR tricks, masks, counting bits', 'DSA'), evening: session('ML - clustering: K-means, hierarchy, DBSCAN', 'ML') },
  { morning: session('ML - PCA, dimensionality reduction, feature importance', 'ML'), evening: session('SQL - full mock interview practice', 'SQL') },
  { morning: session('DS - business metrics, funnels, retention, revenue', 'DS'), evening: session('Project - admin dashboard and moderation', 'PROJ') },
  { morning: session('ML - neural networks, activations, backprop', 'ML', 120, true), evening: session('FS - deployment: Vercel, Railway, MongoDB Atlas', 'FS') },
  { morning: session('ML - TensorFlow or PyTorch first model', 'ML'), evening: session('Project - DevHive AI assistant chat UI and API design', 'PROJ') },
  { morning: session('DSA mock interview - 2 medium plus 1 hard', 'REV'), evening: session('ML - NLP basics: tokenization, TF-IDF, embeddings', 'ML') },
  { morning: session('SQL - HR dataset joins and aggregations', 'SQL'), evening: session('DS - storytelling and stakeholder insights', 'DS') },
  { morning: session('DSA mixed mock - arrays plus DP combo', 'REV'), evening: session('ML - XGBoost tuning and grid search', 'ML') },
  { morning: session('SQL - e-commerce dataset CTEs and windows', 'SQL'), evening: session('Project - DevHive AI RAG, feedback, and analytics', 'PROJ') },
  { morning: session('ML - model serving with FastAPI and Docker', 'ML'), evening: session('DS - Plotly and dashboard basics', 'DS') },
  { morning: session('DSA company-style mock interview', 'REV'), evening: session('FS - performance, testing, code review', 'FS') },
  { morning: session('SQL - pivot, recursive CTE, query tuning', 'SQL'), evening: session('ML - MLOps pipeline and experiment tracking', 'ML') },
  { morning: session('DS - end-to-end case study', 'DS'), evening: session('Project - portfolio polish, chatbot demo, and live deployment', 'PROJ') },
]

export function getDayNumber(registrationDate) {
  const start = new Date(registrationDate)
  const today = new Date()
  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((today - start) / 86400000))
}

export function getDaySchedule(dayIndex) {
  const index = Math.max(0, dayIndex) % CURRICULUM.length
  return { ...CURRICULUM[index], dayNumber: dayIndex + 1 }
}

export const ROADMAP = [
  {
    track: 'DSA',
    tag: 'dsa',
    color: '#F5C842',
    dur: '26 weeks',
    phases: [
      { name: 'Phase 1 - Foundation', weeks: 'Weeks 1-3', topics: ['Complexity analysis', 'Arrays: prefix sum and sliding window', 'Arrays: two pointers and Kadane', 'Strings: hashing and palindromes', 'Sorting and binary search'], target: '60+ problems' },
      { name: 'Phase 2 - Core structures', weeks: 'Weeks 4-7', topics: ['Linked lists', 'Stacks and queues', 'Hashing patterns', 'Priority queues'], target: '50+ problems' },
      { name: 'Phase 3 - Recursion and backtracking', weeks: 'Weeks 8-9', topics: ['Recursion trees', 'Subsets and permutations', 'N Queens and Sudoku'], target: '20+ problems' },
      { name: 'Phase 4 - Trees and graphs', weeks: 'Weeks 10-18', topics: ['Binary trees', 'BST', 'BFS and DFS', 'Shortest paths', 'Union find and MST'], target: '65+ problems' },
      { name: 'Phase 5 - Dynamic programming', weeks: 'Weeks 19-23', topics: ['1D DP', '2D DP', 'Knapsack', 'LIS and LCS', 'DP on trees and bitmask'], target: '50+ problems' },
    ],
  },
  {
    track: 'SQL & Data Science',
    tag: 'sql',
    color: '#4ADE80',
    dur: '8 weeks',
    phases: [
      { name: 'SQL Core', weeks: 'Weeks 1-3', topics: ['SELECT and filters', 'Aggregates and GROUP BY', 'JOINs', 'Subqueries and CTEs'], target: '50 SQL problems' },
      { name: 'Advanced SQL', weeks: 'Weeks 4-5', topics: ['Window functions', 'Recursive CTEs', 'Date and string functions', 'Cohort analysis'], target: '50 DataLemur problems' },
      { name: 'Statistics', weeks: 'Weeks 6-7', topics: ['Descriptive stats', 'Probability', 'Hypothesis testing', 'A/B testing'], target: 'Interview core' },
      { name: 'EDA and dashboards', weeks: 'Week 8', topics: ['Pandas EDA', 'Visualization', 'Power BI or Tableau', 'Business metrics'], target: '3 projects' },
    ],
  },
  {
    track: 'Full Stack Dev',
    tag: 'fs',
    color: '#FF8C5A',
    dur: '12 weeks',
    phases: [
      { name: 'Frontend', weeks: 'Weeks 1-2', topics: ['HTML/CSS', 'JavaScript ES6+', 'React fundamentals', 'Tailwind CSS'], target: '' },
      { name: 'State and routing', weeks: 'Weeks 3-4', topics: ['React Router', 'Redux Toolkit', 'React Query', 'Forms and validation'], target: '' },
      { name: 'Backend and database', weeks: 'Weeks 5-8', topics: ['Express REST APIs', 'MongoDB and Mongoose', 'JWT auth', 'OAuth and RBAC'], target: '' },
      { name: 'Advanced and deploy', weeks: 'Weeks 9-12', topics: ['Socket.io', 'Cloudinary', 'Payments', 'CI/CD and deployment'], target: '' },
    ],
  },
  {
    track: 'Machine Learning',
    tag: 'ml',
    color: '#5AB4FF',
    dur: '10 weeks',
    phases: [
      { name: 'Python for ML', weeks: 'Weeks 1-2', topics: ['Python OOP', 'NumPy', 'Pandas cleaning'], target: '' },
      { name: 'Math and preprocessing', weeks: 'Weeks 3-5', topics: ['Linear algebra', 'Probability', 'Statistics', 'Feature engineering'], target: 'Frequently asked' },
      { name: 'Supervised learning', weeks: 'Weeks 6-8', topics: ['Regression', 'Classification', 'Trees and forests', 'Metrics'], target: 'Core ML' },
      { name: 'Advanced ML', weeks: 'Weeks 9-10', topics: ['Clustering', 'PCA', 'XGBoost', 'MLOps basics'], target: '' },
    ],
  },
]

export const PROJ_MODS = [
  { id: 'auth', name: '1. Authentication System', time: '1 week', features: ['JWT register/login', 'Refresh tokens', 'Google OAuth', 'Password reset', 'Role access'] },
  { id: 'feed', name: '2. Post and Feed Module', time: '1 week', features: ['Post CRUD', 'Markdown editor', 'Tags', 'Infinite scroll', 'Bookmarks'] },
  { id: 'comments', name: '3. Comments and Discussions', time: '4 days', features: ['Nested comments', 'Votes', 'Mentions', 'Real-time updates'] },
  { id: 'search', name: '4. Search and Discovery', time: '4 days', features: ['Full-text search', 'Tag filters', 'Trending posts', 'Profiles'] },
  { id: 'notifs', name: '5. Notifications', time: '3 days', features: ['In-app alerts', 'Email digest', 'Real-time bell', 'Preferences'] },
  { id: 'ai', name: '6. AI Assistant Chatbot', time: '1 week', features: ['Chat widget', 'Express AI route', 'MongoDB history', 'RAG over posts', 'Feedback analytics'] },
  { id: 'payment', name: '7. Payment Gateway', time: '1 week', features: ['Checkout', 'Subscriptions', 'Webhooks', 'Invoices', 'Refunds'] },
  { id: 'upload', name: '8. Media Uploads', time: '2 days', features: ['Cloudinary', 'Profile photos', 'Cover images', 'Validation'] },
  { id: 'admin', name: '9. Admin Dashboard', time: '5 days', features: ['Users', 'Moderation', 'Analytics', 'Restrictions', 'AI usage stats'] },
  { id: 'api', name: '10. Public API and Docs', time: '3 days', features: ['REST API', 'Swagger docs', 'Rate limits', 'API keys'] },
  { id: 'deploy', name: '11. Deployment and DevOps', time: '2 days', features: ['Vercel', 'Railway', 'MongoDB Atlas', 'GitHub Actions'] },
]
