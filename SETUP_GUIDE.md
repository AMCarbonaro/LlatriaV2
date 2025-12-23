# Llatria Setup Guide - Local Development & AWS Migration

This guide covers setup for both **local development/testing** and **AWS production deployment**.

## Quick Start: Local Development

### Option 1: Docker Compose (Recommended - Easiest)

1. **Start database:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Set up backend:**
   ```bash
   cd backend
   cp .env.local.example .env
   # Edit .env with your settings (DATABASE_URL is already correct for Docker)
   npm install
   npm run db:migrate
   npm run dev
   ```

3. **Set up frontend:**
   ```bash
   cd desktop
   npm install
   npm run dev
   ```

That's it! Database runs in Docker, backend on port 3000, frontend on port 3000 (or next available).

### Option 2: Local PostgreSQL Installation

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Create database
   createdb llatria
   ```

2. **Set up backend:**
   ```bash
   cd backend
   cp .env.local.example .env
   # Update DATABASE_URL: postgresql://your-username@localhost:5432/llatria
   npm install
   npm run db:migrate
   npm run dev
   ```

3. **Set up frontend:**
   ```bash
   cd desktop
   npm install
   npm run dev
   ```

## Environment Configuration

### Local Development

Use `.env.local.example` as a template:

```bash
cd backend
cp .env.local.example .env
```

Key variables for local:
- `DATABASE_URL` - Points to local PostgreSQL (Docker or installed)
- `NODE_ENV=development` - Enables dev features
- `CORS_ORIGIN=http://localhost:3000` - Allows frontend access

### AWS Production

When ready to migrate, use `.env.aws.example` as reference. Set these in:
- **AWS Systems Manager Parameter Store** (for non-sensitive)
- **AWS Secrets Manager** (for secrets like JWT keys, DB passwords)
- **ECS Task Definition** (for containerized deployment)
- **Lambda Environment Variables** (for serverless)

## AWS Migration Path

### Phase 1: Database Migration

**Option A: AWS RDS PostgreSQL**
1. Create RDS PostgreSQL instance
2. Update `DATABASE_URL` in AWS environment
3. Run migrations: `npm run db:migrate` (pointed at RDS)
4. Migrate data from local DB (if needed)

**Option B: Keep Local for Dev, RDS for Prod**
- Use different `.env` files
- Local: `.env.local` → local PostgreSQL
- Production: AWS env vars → RDS

### Phase 2: Application Deployment

**Option A: AWS ECS (Containerized)**
- Build Docker image
- Push to ECR
- Deploy to ECS Fargate/EC2
- Use Application Load Balancer

**Option B: AWS Lambda (Serverless)**
- Use AWS SAM or Serverless Framework
- Deploy as Lambda functions
- Use API Gateway

**Option C: AWS EC2 (Traditional)**
- Deploy Node.js app to EC2
- Use PM2 or systemd
- Use Nginx as reverse proxy

### Phase 3: File Storage

**Current:** Local file system (for development)

**AWS Migration:** 
- Use **S3** for image storage
- Use **CloudFront** for CDN
- Update `backend/src/services/storage.service.ts` to use AWS SDK

### Phase 4: Additional Services

**Redis (Caching/Sessions):**
- Local: Docker Compose includes Redis
- AWS: Use ElastiCache for Redis

**Monitoring:**
- Add Sentry for error tracking
- Use CloudWatch for logs
- Set up alarms

## Recommended AWS Architecture

```
┌─────────────────┐
│  CloudFront CDN  │ (Static assets, images)
└────────┬────────┘
         │
┌────────▼────────┐
│  Application    │
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼───┐
│  ECS  │ │ ECS  │ (Backend API containers)
│ Task  │ │ Task │
└───┬───┘ └──┬───┘
    │        │
    └───┬────┘
        │
┌───────▼────────┐
│   RDS          │ (PostgreSQL)
│   PostgreSQL   │
└────────────────┘

┌──────────────┐
│  ElastiCache │ (Redis - optional)
│  Redis        │
└──────────────┘

┌──────────────┐
│  S3 Bucket   │ (Image storage)
└──────────────┘
```

## Migration Checklist

### Pre-Migration
- [ ] Test all features locally
- [ ] Set up AWS account
- [ ] Create IAM roles and policies
- [ ] Set up VPC and security groups

### Database
- [ ] Create RDS PostgreSQL instance
- [ ] Configure security groups (allow app access)
- [ ] Run migrations on RDS
- [ ] Test connection from local app

### Application
- [ ] Set up ECR repository
- [ ] Build and push Docker image
- [ ] Create ECS cluster and service
- [ ] Configure environment variables
- [ ] Set up Application Load Balancer
- [ ] Configure health checks

### Storage
- [ ] Create S3 bucket
- [ ] Set up CloudFront distribution
- [ ] Update code to use S3 for images
- [ ] Migrate existing images (if any)

### Security
- [ ] Store secrets in AWS Secrets Manager
- [ ] Configure SSL/TLS certificates
- [ ] Set up WAF rules (optional)
- [ ] Enable CloudWatch logging
- [ ] Set up IAM roles with least privilege

### Monitoring
- [ ] Set up CloudWatch alarms
- [ ] Configure Sentry (if using)
- [ ] Set up log aggregation
- [ ] Create dashboards

## Development Workflow

### Local Development
```bash
# Start services
docker-compose up -d

# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd desktop
npm run dev
```

### Testing AWS Connection Locally
You can test AWS services from local development:

```bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_REGION=us-east-1

# Use AWS services in local dev
# Code will automatically use AWS if credentials are set
```

### Database Migrations

**Local:**
```bash
cd backend
npm run db:migrate
```

**Production (after RDS setup):**
```bash
# Set DATABASE_URL to RDS endpoint
export DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/llatria
npm run db:migrate
```

## Environment-Specific Code

The codebase is designed to work with both local and AWS:

```typescript
// Example: Storage service
const useS3 = process.env.AWS_S3_BUCKET !== undefined;
if (useS3) {
  // Use S3
} else {
  // Use local file system
}
```

## Troubleshooting

### Local Development

**Database connection issues:**
- Check Docker is running: `docker ps`
- Verify DATABASE_URL in `.env`
- Check PostgreSQL logs: `docker-compose logs postgres`

**Port conflicts:**
- Backend default: 3000
- PostgreSQL: 5432
- Redis: 6379
- Change ports in docker-compose.yml if needed

### AWS Migration

**RDS connection:**
- Check security group allows your IP/ECS tasks
- Verify VPC configuration
- Test connection from EC2 instance in same VPC

**ECS deployment:**
- Check task definition environment variables
- Verify IAM roles have correct permissions
- Check CloudWatch logs for errors

## Next Steps

1. **Start local development** using Docker Compose
2. **Test all features** locally
3. **When ready for AWS:**
   - Set up RDS instance
   - Create ECR repository
   - Build and deploy to ECS
   - Migrate images to S3

The codebase is structured to work seamlessly in both environments!






