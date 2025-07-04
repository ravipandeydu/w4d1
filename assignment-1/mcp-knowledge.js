// Comprehensive MCP (Model Context Protocol) Knowledge Base
const mcpKnowledgeBase = {
    concepts: {
        "what is mcp": {
            title: "What is MCP (Model Context Protocol)?",
            content: `MCP (Model Context Protocol) is a standardized protocol designed to enable seamless communication between AI models and external systems. It provides a structured way for AI applications to access and interact with various data sources, tools, and services.

**Key Features:**
• **Standardized Communication**: Provides a consistent interface for AI-system interactions
• **Tool Integration**: Enables AI models to use external tools and APIs
• **Context Management**: Efficiently manages context and state across interactions
• **Security**: Built-in security features for safe AI-system communication
• **Extensibility**: Modular design allows for custom extensions

**Use Cases:**
• Connecting AI models to databases
• Integrating with external APIs
• Tool execution and automation
• Multi-modal AI applications
• Enterprise AI system integration`
        },
        "mcp architecture": {
            title: "MCP Architecture Overview",
            content: `MCP follows a client-server architecture with well-defined components:

**Core Components:**

1. **MCP Server**
   • Hosts tools, resources, and capabilities
   • Handles client requests and responses
   • Manages authentication and authorization
   • Implements protocol-specific handlers

2. **MCP Client**
   • Initiates connections to MCP servers
   • Sends requests and processes responses
   • Manages session state and context
   • Handles error recovery and retries

3. **Transport Layer**
   • HTTP/HTTPS for web-based communication
   • WebSocket for real-time interactions
   • gRPC for high-performance scenarios
   • Custom transports for specialized needs

4. **Message Format**
   • JSON-based message structure
   • Request/response patterns
   • Event-driven notifications
   • Error handling mechanisms`
        },
        "mcp vs other protocols": {
            title: "MCP vs Other Protocols",
            content: `**MCP vs REST APIs:**
• MCP: AI-optimized, context-aware, stateful
• REST: General-purpose, stateless, resource-oriented

**MCP vs GraphQL:**
• MCP: Tool-focused, AI-specific features
• GraphQL: Data-focused, flexible querying

**MCP vs gRPC:**
• MCP: Higher-level abstraction, AI-centric
• gRPC: Lower-level, performance-focused

**MCP vs OpenAPI:**
• MCP: Runtime protocol with AI features
• OpenAPI: Documentation and specification format

**Why Choose MCP:**
• Built specifically for AI applications
• Context preservation across interactions
• Standardized tool integration patterns
• Security features for AI systems
• Extensible for custom AI workflows`
        }
    },
    
    implementation: {
        "how to implement an mcp server": {
            title: "Implementing an MCP Server",
            content: `Here's a step-by-step guide to implement an MCP server:

**1. Setup and Dependencies**
\`\`\`javascript
npm install @modelcontextprotocol/sdk
// or
pip install mcp-sdk
\`\`\`

**2. Basic Server Structure**
\`\`\`javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

class MyMCPServer {
  constructor() {
    this.server = new Server({
      name: 'my-mcp-server',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      }
    });
    
    this.setupHandlers();
  }
  
  setupHandlers() {
    // Tool handlers
    this.server.setRequestHandler('tools/list', this.listTools.bind(this));
    this.server.setRequestHandler('tools/call', this.callTool.bind(this));
    
    // Resource handlers
    this.server.setRequestHandler('resources/list', this.listResources.bind(this));
    this.server.setRequestHandler('resources/read', this.readResource.bind(this));
  }
}
\`\`\`

**3. Implementing Tool Handlers**
\`\`\`javascript
async listTools() {
  return {
    tools: [
      {
        name: 'calculate',
        description: 'Perform mathematical calculations',
        inputSchema: {
          type: 'object',
          properties: {
            expression: { type: 'string' }
          }
        }
      }
    ]
  };
}

async callTool(request) {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'calculate':
      return this.handleCalculate(args);
    default:
      throw new Error(\`Unknown tool: \${name}\`);
  }
}
\`\`\`

**4. Starting the Server**
\`\`\`javascript
async function main() {
  const server = new MyMCPServer();
  const transport = new StdioServerTransport();
  await server.server.connect(transport);
}

main().catch(console.error);
\`\`\``
        },
        "mcp client implementation": {
            title: "MCP Client Implementation",
            content: `**Basic MCP Client Setup:**

\`\`\`javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class MCPClient {
  constructor() {
    this.client = new Client({
      name: 'my-mcp-client',
      version: '1.0.0'
    }, {
      capabilities: {
        roots: {
          listChanged: true
        },
        sampling: {}
      }
    });
  }
  
  async connect(serverPath) {
    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath]
    });
    
    await this.client.connect(transport);
  }
  
  async listTools() {
    return await this.client.request({
      method: 'tools/list'
    });
  }
  
  async callTool(name, args) {
    return await this.client.request({
      method: 'tools/call',
      params: {
        name,
        arguments: args
      }
    });
  }
}
\`\`\`

**Usage Example:**
\`\`\`javascript
const client = new MCPClient();
await client.connect('./my-server.js');

const tools = await client.listTools();
console.log('Available tools:', tools);

const result = await client.callTool('calculate', {
  expression: '2 + 2'
});
console.log('Result:', result);
\`\`\``
        },
        "mcp configuration": {
            title: "MCP Configuration and Setup",
            content: `**Server Configuration:**

\`\`\`json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./dist/server.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
\`\`\`

**Environment Variables:**
\`\`\`bash
# .env file
MCP_SERVER_PORT=3000
MCP_LOG_LEVEL=info
MCP_AUTH_TOKEN=your-auth-token
MCP_CORS_ORIGIN=http://localhost:3000
\`\`\`

**TypeScript Configuration:**
\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

**Package.json Scripts:**
\`\`\`json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts",
    "test": "jest"
  }
}
\`\`\``
        }
    },
    
    bestPractices: {
        "mcp best practices": {
            title: "MCP Best Practices",
            content: `**1. Error Handling**
\`\`\`javascript
try {
  const result = await server.callTool(name, args);
  return { success: true, data: result };
} catch (error) {
  return {
    success: false,
    error: {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message,
      details: error.details
    }
  };
}
\`\`\`

**2. Input Validation**
\`\`\`javascript
function validateToolInput(schema, input) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  
  if (!validate(input)) {
    throw new Error(\`Invalid input: \${ajv.errorsText(validate.errors)}\`);
  }
}
\`\`\`

**3. Logging and Monitoring**
\`\`\`javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'mcp-server.log' })
  ]
});

// Log all requests
server.setRequestHandler('tools/call', async (request) => {
  logger.info('Tool call', { tool: request.params.name, args: request.params.arguments });
  // ... handle request
});
\`\`\`

**4. Security Considerations**
• Always validate and sanitize inputs
• Implement proper authentication
• Use HTTPS in production
• Rate limiting for API calls
• Audit logging for security events

**5. Performance Optimization**
• Implement caching for frequently accessed data
• Use connection pooling for database connections
• Implement request timeouts
• Monitor memory usage and optimize
• Use streaming for large data transfers`
        },
        "mcp security": {
            title: "MCP Security Considerations",
            content: `**Authentication & Authorization:**

\`\`\`javascript
// Token-based authentication
class SecureMCPServer extends MCPServer {
  constructor(authToken) {
    super();
    this.authToken = authToken;
    this.setupAuthMiddleware();
  }
  
  setupAuthMiddleware() {
    this.server.setRequestHandler('*', async (request, next) => {
      const token = request.headers?.authorization?.replace('Bearer ', '');
      
      if (token !== this.authToken) {
        throw new Error('Unauthorized');
      }
      
      return next();
    });
  }
}
\`\`\`

**Input Sanitization:**
\`\`\`javascript
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

function sanitizeInput(input) {
  if (typeof input === 'string') {
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    return purify.sanitize(input);
  }
  return input;
}
\`\`\`

**Rate Limiting:**
\`\`\`javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
\`\`\`

**Security Checklist:**
• ✅ Implement authentication for all endpoints
• ✅ Validate and sanitize all inputs
• ✅ Use HTTPS in production
• ✅ Implement rate limiting
• ✅ Log security events
• ✅ Regular security audits
• ✅ Keep dependencies updated
• ✅ Implement CORS properly
• ✅ Use environment variables for secrets
• ✅ Implement request timeouts`
        }
    },
    
    troubleshooting: {
        "mcp troubleshooting": {
            title: "MCP Troubleshooting Guide",
            content: `**Common Issues and Solutions:**

**1. Connection Issues**
\`\`\`
Error: Failed to connect to MCP server
\`\`\`
**Solutions:**
• Check if server is running: \`ps aux | grep mcp\`
• Verify port availability: \`netstat -an | grep :3000\`
• Check firewall settings
• Validate server configuration

**2. Authentication Errors**
\`\`\`
Error: Unauthorized - Invalid token
\`\`\`
**Solutions:**
• Verify auth token is correct
• Check token expiration
• Ensure proper header format: \`Authorization: Bearer <token>\`
• Review server auth middleware

**3. Tool Execution Failures**
\`\`\`
Error: Tool 'calculate' not found
\`\`\`
**Solutions:**
• Verify tool is registered: \`server.listTools()\`
• Check tool name spelling
• Ensure tool handler is implemented
• Review tool schema validation

**4. Performance Issues**
**Symptoms:** Slow response times, timeouts
**Solutions:**
• Monitor server resources: \`top\`, \`htop\`
• Check database connection pool
• Implement caching strategies
• Optimize database queries
• Add request timeouts

**5. Memory Leaks**
**Symptoms:** Increasing memory usage over time
**Solutions:**
• Use memory profiling tools
• Check for unclosed connections
• Review event listener cleanup
• Implement proper garbage collection

**Debugging Tools:**
\`\`\`javascript
// Enable debug logging
process.env.DEBUG = 'mcp:*';

// Memory monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', usage);
}, 30000);

// Request tracing
server.setRequestHandler('*', (request, next) => {
  console.log(\`[\${new Date().toISOString()}] \${request.method}\`, request.params);
  return next();
});
\`\`\``
        },
        "mcp error codes": {
            title: "MCP Error Codes Reference",
            content: `**Standard MCP Error Codes:**

**Client Errors (4xx):**
• \`400\` - Bad Request: Invalid request format
• \`401\` - Unauthorized: Authentication required
• \`403\` - Forbidden: Access denied
• \`404\` - Not Found: Resource/tool not found
• \`422\` - Unprocessable Entity: Invalid input data
• \`429\` - Too Many Requests: Rate limit exceeded

**Server Errors (5xx):**
• \`500\` - Internal Server Error: Unexpected server error
• \`501\` - Not Implemented: Feature not implemented
• \`502\` - Bad Gateway: Upstream service error
• \`503\` - Service Unavailable: Server overloaded
• \`504\` - Gateway Timeout: Upstream timeout

**Custom MCP Error Codes:**
• \`MCP_TOOL_ERROR\` - Tool execution failed
• \`MCP_VALIDATION_ERROR\` - Input validation failed
• \`MCP_RESOURCE_ERROR\` - Resource access failed
• \`MCP_TRANSPORT_ERROR\` - Transport layer error
• \`MCP_PROTOCOL_ERROR\` - Protocol violation

**Error Response Format:**
\`\`\`json
{
  "error": {
    "code": "MCP_TOOL_ERROR",
    "message": "Tool execution failed",
    "details": {
      "tool": "calculate",
      "reason": "Division by zero"
    }
  }
}
\`\`\``
        }
    },
    
    advanced: {
        "mcp performance optimization": {
            title: "MCP Performance Optimization",
            content: `**1. Caching Strategies**
\`\`\`javascript
import NodeCache from 'node-cache';

class OptimizedMCPServer extends MCPServer {
  constructor() {
    super();
    this.cache = new NodeCache({ stdTTL: 600 }); // 10 minutes
  }
  
  async callTool(request) {
    const cacheKey = \`tool_\${request.params.name}_\${JSON.stringify(request.params.arguments)}\`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Execute tool
    const result = await super.callTool(request);
    
    // Cache result
    this.cache.set(cacheKey, result);
    return result;
  }
}
\`\`\`

**2. Connection Pooling**
\`\`\`javascript
import { Pool } from 'pg';

const dbPool = new Pool({
  host: 'localhost',
  database: 'mydb',
  user: 'user',
  password: 'password',
  max: 20, // maximum number of clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
\`\`\`

**3. Streaming for Large Data**
\`\`\`javascript
async function streamLargeResource(resourceId) {
  const stream = new ReadableStream({
    start(controller) {
      // Initialize stream
    },
    pull(controller) {
      // Fetch next chunk
      const chunk = getNextChunk(resourceId);
      if (chunk) {
        controller.enqueue(chunk);
      } else {
        controller.close();
      }
    }
  });
  
  return stream;
}
\`\`\`

**4. Monitoring and Metrics**
\`\`\`javascript
import prometheus from 'prom-client';

const requestDuration = new prometheus.Histogram({
  name: 'mcp_request_duration_seconds',
  help: 'Duration of MCP requests in seconds',
  labelNames: ['method', 'tool']
});

const requestCounter = new prometheus.Counter({
  name: 'mcp_requests_total',
  help: 'Total number of MCP requests',
  labelNames: ['method', 'status']
});
\`\`\`

**Performance Tips:**
• Use async/await properly to avoid blocking
• Implement request timeouts
• Use compression for large responses
• Optimize database queries
• Monitor memory usage
• Use clustering for CPU-intensive tasks`
        },
        "mcp scaling": {
            title: "Scaling MCP Servers",
            content: `**Horizontal Scaling with Load Balancer:**

\`\`\`nginx
# nginx.conf
upstream mcp_servers {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    location / {
        proxy_pass http://mcp_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
\`\`\`

**Docker Deployment:**
\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["node", "dist/server.js"]
\`\`\`

**Docker Compose:**
\`\`\`yaml
version: '3.8'
services:
  mcp-server-1:
    build: .
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
  
  mcp-server-2:
    build: .
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - mcp-server-1
      - mcp-server-2
\`\`\`

**Kubernetes Deployment:**
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      containers:
      - name: mcp-server
        image: my-mcp-server:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: mcp-server-service
spec:
  selector:
    app: mcp-server
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
\`\`\``
        }
    }
};

// Search function to find relevant knowledge
function searchKnowledge(query) {
    const normalizedQuery = query.toLowerCase();
    const results = [];
    
    // Search through all categories
    Object.values(mcpKnowledgeBase).forEach(category => {
        Object.entries(category).forEach(([key, item]) => {
            const score = calculateRelevanceScore(normalizedQuery, key, item);
            if (score > 0) {
                results.push({ ...item, score, key });
            }
        });
    });
    
    // Sort by relevance score
    return results.sort((a, b) => b.score - a.score);
}

// Calculate relevance score based on query matching
function calculateRelevanceScore(query, key, item) {
    let score = 0;
    
    // Exact key match gets highest score
    if (key.includes(query)) {
        score += 100;
    }
    
    // Title match
    if (item.title.toLowerCase().includes(query)) {
        score += 50;
    }
    
    // Content match
    const contentWords = query.split(' ');
    contentWords.forEach(word => {
        if (word.length > 2 && item.content.toLowerCase().includes(word)) {
            score += 10;
        }
    });
    
    // Keyword matching
    const keywords = {
        'implementation': ['implement', 'setup', 'create', 'build', 'code'],
        'troubleshooting': ['error', 'problem', 'issue', 'debug', 'fix', 'troubleshoot'],
        'security': ['auth', 'secure', 'token', 'permission', 'safety'],
        'performance': ['optimize', 'fast', 'slow', 'performance', 'speed'],
        'best practices': ['best', 'practice', 'recommend', 'should', 'guide']
    };
    
    Object.entries(keywords).forEach(([category, words]) => {
        words.forEach(word => {
            if (query.includes(word) && key.includes(category.replace(' ', ' '))) {
                score += 25;
            }
        });
    });
    
    return score;
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mcpKnowledgeBase, searchKnowledge };
}