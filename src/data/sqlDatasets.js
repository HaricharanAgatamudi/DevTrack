// Built-in datasets for SQL practice
export const SQL_DATASETS = {
  employees: {
    name: 'HR Database',
    description: 'Classic HR schema — employees, departments, salaries',
    tables: {
      employees: [
        { emp_id: 1,  name: 'Alice Johnson',  dept_id: 1, salary: 90000, hire_date: '2020-01-15', manager_id: null  },
        { emp_id: 2,  name: 'Bob Smith',      dept_id: 2, salary: 75000, hire_date: '2019-03-10', manager_id: 1    },
        { emp_id: 3,  name: 'Carol Lee',      dept_id: 1, salary: 85000, hire_date: '2021-07-22', manager_id: 1    },
        { emp_id: 4,  name: 'David Park',     dept_id: 3, salary: 60000, hire_date: '2022-02-01', manager_id: 2    },
        { emp_id: 5,  name: 'Eve Wang',       dept_id: 2, salary: 95000, hire_date: '2018-11-05', manager_id: 1    },
        { emp_id: 6,  name: 'Frank Müller',   dept_id: 3, salary: 55000, hire_date: '2023-04-18', manager_id: 2    },
        { emp_id: 7,  name: 'Grace Patel',    dept_id: 1, salary: 72000, hire_date: '2020-09-30', manager_id: 3    },
        { emp_id: 8,  name: 'Hiro Tanaka',    dept_id: 4, salary: 110000,hire_date: '2017-06-12', manager_id: null  },
        { emp_id: 9,  name: 'Ivy Chen',       dept_id: 4, salary: 98000, hire_date: '2019-08-25', manager_id: 8    },
        { emp_id: 10, name: 'Jack Wilson',    dept_id: 2, salary: 67000, hire_date: '2022-12-01', manager_id: 5    },
      ],
      departments: [
        { dept_id: 1, dept_name: 'Engineering',  budget: 500000, location: 'Hyderabad' },
        { dept_id: 2, dept_name: 'Marketing',    budget: 200000, location: 'Bangalore' },
        { dept_id: 3, dept_name: 'Operations',   budget: 150000, location: 'Chennai'   },
        { dept_id: 4, dept_name: 'Data Science', budget: 350000, location: 'Pune'      },
      ],
      salaries: [
        { emp_id: 1, year: 2022, salary: 85000 }, { emp_id: 1, year: 2023, salary: 90000 },
        { emp_id: 2, year: 2022, salary: 70000 }, { emp_id: 2, year: 2023, salary: 75000 },
        { emp_id: 3, year: 2022, salary: 80000 }, { emp_id: 3, year: 2023, salary: 85000 },
        { emp_id: 4, year: 2022, salary: 58000 }, { emp_id: 4, year: 2023, salary: 60000 },
        { emp_id: 5, year: 2022, salary: 90000 }, { emp_id: 5, year: 2023, salary: 95000 },
      ],
    },
    sampleQueries: [
      'SELECT name, salary FROM employees WHERE salary > 80000 ORDER BY salary DESC',
      'SELECT d.dept_name, COUNT(*) as headcount, AVG(e.salary) as avg_salary FROM employees e JOIN departments d ON e.dept_id = d.dept_id GROUP BY d.dept_name ORDER BY avg_salary DESC',
      'SELECT name, salary, RANK() OVER (ORDER BY salary DESC) as salary_rank FROM employees',
      'WITH dept_avg AS (SELECT dept_id, AVG(salary) as avg_sal FROM employees GROUP BY dept_id) SELECT e.name, e.salary, da.avg_sal FROM employees e JOIN dept_avg da ON e.dept_id = da.dept_id WHERE e.salary > da.avg_sal',
    ]
  },
  ecommerce: {
    name: 'E-Commerce Database',
    description: 'Orders, products, customers — real-world analytics',
    tables: {
      customers: [
        { customer_id: 1, name: 'Priya Sharma',   city: 'Delhi',     joined: '2021-01-10' },
        { customer_id: 2, name: 'Rahul Gupta',    city: 'Mumbai',    joined: '2021-03-22' },
        { customer_id: 3, name: 'Sneha Nair',     city: 'Bangalore', joined: '2020-11-05' },
        { customer_id: 4, name: 'Arjun Reddy',    city: 'Hyderabad', joined: '2022-06-15' },
        { customer_id: 5, name: 'Meera Iyer',     city: 'Chennai',   joined: '2021-09-01' },
        { customer_id: 6, name: 'Vikram Singh',   city: 'Pune',      joined: '2020-07-20' },
      ],
      orders: [
        { order_id: 101, customer_id: 1, product_id: 1, quantity: 2, order_date: '2023-01-15', status: 'delivered' },
        { order_id: 102, customer_id: 2, product_id: 3, quantity: 1, order_date: '2023-01-20', status: 'delivered' },
        { order_id: 103, customer_id: 1, product_id: 2, quantity: 1, order_date: '2023-02-05', status: 'shipped'   },
        { order_id: 104, customer_id: 3, product_id: 1, quantity: 3, order_date: '2023-02-10', status: 'delivered' },
        { order_id: 105, customer_id: 4, product_id: 4, quantity: 1, order_date: '2023-03-01', status: 'pending'   },
        { order_id: 106, customer_id: 2, product_id: 2, quantity: 2, order_date: '2023-03-15', status: 'delivered' },
        { order_id: 107, customer_id: 5, product_id: 3, quantity: 1, order_date: '2023-04-01', status: 'cancelled' },
        { order_id: 108, customer_id: 6, product_id: 5, quantity: 4, order_date: '2023-04-10', status: 'delivered' },
        { order_id: 109, customer_id: 3, product_id: 4, quantity: 2, order_date: '2023-04-20', status: 'shipped'   },
        { order_id: 110, customer_id: 1, product_id: 5, quantity: 1, order_date: '2023-05-01', status: 'delivered' },
      ],
      products: [
        { product_id: 1, name: 'Laptop',     category: 'Electronics', price: 55000 },
        { product_id: 2, name: 'Phone',      category: 'Electronics', price: 25000 },
        { product_id: 3, name: 'Headphones', category: 'Electronics', price: 3500  },
        { product_id: 4, name: 'T-Shirt',    category: 'Apparel',     price: 800   },
        { product_id: 5, name: 'Running Shoes', category: 'Footwear', price: 4500  },
      ],
    },
    sampleQueries: [
      'SELECT c.name, COUNT(o.order_id) as total_orders, SUM(p.price * o.quantity) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN products p ON o.product_id = p.product_id GROUP BY c.name ORDER BY total_spent DESC',
      'SELECT p.category, SUM(o.quantity * p.price) as revenue FROM orders o JOIN products p ON o.product_id = p.product_id WHERE o.status = "delivered" GROUP BY p.category',
      'SELECT name, price, AVG(price) OVER (PARTITION BY category) as category_avg FROM products',
    ]
  }
}

// ─── Simple SQL interpreter (client-side) ────────────────────────────────────
// Supports: SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY, LIMIT, basic aggregates
export function runSQL(query, dataset) {
  try {
    const tables = SQL_DATASETS[dataset]?.tables || {}
    return executeQuery(query.trim(), tables)
  } catch (e) {
    return { error: e.message }
  }
}

function executeQuery(query, tables) {
  const q = query.replace(/\s+/g, ' ').trim()
  const upper = q.toUpperCase()

  if (!upper.startsWith('SELECT')) return { error: 'Only SELECT queries are supported' }

  // Extract parts
  const fromMatch = q.match(/\bFROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/i)
  if (!fromMatch) return { error: 'Missing FROM clause' }

  const tableName = fromMatch[1].toLowerCase()
  if (!tables[tableName]) return { error: `Table "${tableName}" not found. Available: ${Object.keys(tables).join(', ')}` }

  let rows = [...tables[tableName]]

  // Handle simple JOIN
  const joinMatch = q.match(/\b(?:INNER\s+)?JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+(.+?)(?:\s+WHERE|\s+GROUP|\s+ORDER|\s+LIMIT|$)/i)
  if (joinMatch) {
    const joinTable = joinMatch[1].toLowerCase()
    if (!tables[joinTable]) return { error: `Table "${joinTable}" not found` }
    const onClause = joinMatch[3].trim()
    const [left, right] = onClause.split('=').map(s => s.trim())
    const lKey = left.split('.')[1] || left
    const rKey = right.split('.')[1] || right
    rows = rows.flatMap(r => {
      const matches = tables[joinTable].filter(jr => String(r[lKey]) === String(jr[rKey]))
      return matches.length ? matches.map(jr => ({ ...r, ...jr })) : []
    })
  }

  // WHERE
  const whereMatch = q.match(/\bWHERE\s+(.+?)(?:\s+GROUP|\s+ORDER|\s+LIMIT|$)/i)
  if (whereMatch) {
    rows = applyWhere(rows, whereMatch[1].trim())
  }

  // GROUP BY
  const groupMatch = q.match(/\bGROUP\s+BY\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i)
  let isGrouped = false
  if (groupMatch) {
    const groupCols = groupMatch[1].split(',').map(s => s.trim().split('.').pop())
    rows = applyGroupBy(rows, groupCols, q)
    isGrouped = true
  }

  // SELECT columns
  const selMatch = q.match(/^SELECT\s+(.+?)\s+FROM/i)
  if (selMatch) {
    rows = applySelect(rows, selMatch[1], isGrouped)
  }

  // ORDER BY
  const orderMatch = q.match(/\bORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i)
  if (orderMatch) {
    const [col, dir] = orderMatch[1].trim().split(/\s+/)
    const colName = col.split('.').pop()
    rows.sort((a, b) => {
      const va = a[colName], vb = b[colName]
      const cmp = isNaN(va) ? String(va).localeCompare(String(vb)) : va - vb
      return dir?.toUpperCase() === 'DESC' ? -cmp : cmp
    })
  }

  // LIMIT
  const limitMatch = q.match(/\bLIMIT\s+(\d+)/i)
  if (limitMatch) rows = rows.slice(0, parseInt(limitMatch[1]))

  return { rows, columns: rows.length ? Object.keys(rows[0]) : [] }
}

function applyWhere(rows, condition) {
  return rows.filter(row => {
    try {
      // Handle basic comparisons: col > val, col = 'val', col LIKE '%x%'
      const likeMatch = condition.match(/(\w+)\s+LIKE\s+'([^']+)'/i)
      if (likeMatch) {
        const [, col, pattern] = likeMatch
        const regex = new RegExp('^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i')
        return regex.test(String(row[col] || ''))
      }
      // Replace column refs with values
      let expr = condition
        .replace(/(\w+\.)?\b(\w+)\b/g, (m, prefix, col) => {
          if (['AND','OR','NOT','NULL','TRUE','FALSE','IS'].includes(col.toUpperCase())) return m
          const val = row[col]
          if (val === undefined) return m
          return typeof val === 'string' ? `"${val}"` : val
        })
        .replace(/\s*=\s*/g, '===')
        .replace(/\s+AND\s+/gi, ' && ')
        .replace(/\s+OR\s+/gi, ' || ')
      return Function(`"use strict"; return (${expr})`)()
    } catch { return true }
  })
}

function applyGroupBy(rows, groupCols, query) {
  const groups = {}
  rows.forEach(row => {
    const key = groupCols.map(c => row[c]).join('|')
    if (!groups[key]) groups[key] = { _rows: [], ...Object.fromEntries(groupCols.map(c => [c, row[c]])) }
    groups[key]._rows.push(row)
  })
  // Apply aggregates
  return Object.values(groups).map(g => {
    const result = { ...g }
    delete result._rows
    // Parse SELECT for aggregates
    const selMatch = query.match(/^SELECT\s+(.+?)\s+FROM/i)
    if (selMatch) {
      const cols = selMatch[1].split(',')
      cols.forEach(col => {
        const trimmed = col.trim()
        const aggMatch = trimmed.match(/(COUNT|SUM|AVG|MAX|MIN)\s*\(\s*\*?\s*(\w+)?\s*\)(?:\s+(?:AS\s+)?(\w+))?/i)
        if (aggMatch) {
          const [, fn, field, alias] = aggMatch
          const vals = g._rows.map(r => field ? r[field] : 1).filter(v => v !== null && v !== undefined)
          const outKey = alias || `${fn.toLowerCase()}${field ? '_' + field : ''}`
          if (fn.toUpperCase() === 'COUNT') result[outKey] = vals.length
          else if (fn.toUpperCase() === 'SUM') result[outKey] = vals.reduce((a, b) => a + Number(b), 0)
          else if (fn.toUpperCase() === 'AVG') result[outKey] = Math.round(vals.reduce((a, b) => a + Number(b), 0) / vals.length)
          else if (fn.toUpperCase() === 'MAX') result[outKey] = Math.max(...vals.map(Number))
          else if (fn.toUpperCase() === 'MIN') result[outKey] = Math.min(...vals.map(Number))
        }
      })
    }
    return result
  })
}

function applySelect(rows, selectClause) {
  if (selectClause.trim() === '*') return rows
  const cols = selectClause.split(',').map(s => s.trim())
  const keyMap = {}
  cols.forEach(col => {
    // Remove table alias prefix
    const cleaned = col.replace(/\w+\./g, '').trim()
    // Handle AS alias
    const asMatch = cleaned.match(/^(.+?)\s+(?:AS\s+)?(\w+)$/i)
    if (asMatch && !asMatch[1].match(/^(COUNT|SUM|AVG|MAX|MIN)\s*\(/i)) {
      const src = asMatch[1].trim(); const dest = asMatch[2].trim()
      keyMap[src] = dest
    } else {
      const bare = cleaned.replace(/\s*\(.*?\)\s*/g, '').replace(/^(COUNT|SUM|AVG|MAX|MIN)\s*/i, '').trim()
      if (bare && !bare.match(/^(COUNT|SUM|AVG|MAX|MIN)/i)) keyMap[bare] = bare
    }
  })
  return rows.map(row => {
    const out = {}
    Object.entries(keyMap).forEach(([src, dest]) => { if (src in row) out[dest] = row[src] })
    // Copy aggregate keys
    Object.keys(row).forEach(k => {
      if (!Object.values(keyMap).includes(k) && (k.match(/^(count|sum|avg|max|min)/) || cols.some(c => c.toLowerCase().includes(k)))) out[k] = row[k]
    })
    return Object.keys(out).length ? out : row
  })
}
