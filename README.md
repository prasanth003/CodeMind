# CodeMind AI

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## SonarQube Integration

This project is integrated with SonarQube for continuous code quality monitoring, security vulnerability detection, and technical debt tracking.

### Prerequisites

You need access to a SonarQube server. Choose one of the following options:

1. **SonarCloud** (Recommended for open source): Sign up at [https://sonarcloud.io](https://sonarcloud.io)
2. **Local Docker Instance**:
   ```bash
   docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
   ```
   Access at [http://localhost:9000](http://localhost:9000) (default credentials: admin/admin)
3. **Self-hosted Server**: Use your organization's SonarQube instance

### Setup

1. **Configure Environment Variables**

   Copy the example environment file and add your SonarQube credentials:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your SonarQube server details:
   ```bash
   SONAR_HOST_URL=https://sonarcloud.io  # or your server URL
   SONAR_TOKEN=your_sonarqube_token_here
   ```

   To generate a token:
   - **SonarCloud**: Account > Security > Generate Tokens
   - **Local/Self-hosted**: My Account > Security > Generate Tokens

2. **Install Dependencies**

   ```bash
   npm install
   ```

### Usage

#### Local Analysis

Run SonarQube analysis locally:

```bash
npm run sonar
```

View results at your SonarQube server dashboard.

#### CI/CD Integration

The project includes a GitHub Actions workflow (`.github/workflows/sonarqube.yml`) that automatically runs SonarQube analysis on:
- Push to `main` or `develop` branches
- Pull requests

**Required GitHub Secrets:**
- `SONAR_TOKEN`: Your SonarQube authentication token
- `SONAR_HOST_URL`: Your SonarQube server URL

To add secrets:
1. Go to your GitHub repository
2. Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add both `SONAR_TOKEN` and `SONAR_HOST_URL`

### Quality Gates

The project is configured with quality gates to ensure code quality standards. Analysis results include:
- **Code Smells**: Maintainability issues
- **Bugs**: Potential runtime errors
- **Vulnerabilities**: Security issues
- **Security Hotspots**: Security-sensitive code requiring review
- **Coverage**: Code coverage metrics (when tests are added)
- **Duplications**: Duplicate code detection

### Configuration

SonarQube settings are defined in `sonar-project.properties`. Key configurations:

- **Sources**: `app`, `components`, `contexts`, `lib`
- **Exclusions**: Test files, config files, `.next`, `node_modules`
- **Language**: TypeScript/JavaScript
- **Coverage**: Prepared for LCOV reports

### Troubleshooting

**Issue**: `SONAR_TOKEN` or `SONAR_HOST_URL` not found
- **Solution**: Ensure environment variables are set in `.env.local` for local runs, or as GitHub Secrets for CI/CD

**Issue**: Analysis fails with authentication error
- **Solution**: Verify your SonarQube token is valid and has the necessary permissions

**Issue**: No analysis results appear
- **Solution**: Check that your SonarQube project key matches the one in `sonar-project.properties` (`codemind-ai`)

**Issue**: Scanner not found
- **Solution**: Run `npm install` to ensure `sonarqube-scanner` is installed

For more help, visit the [SonarQube documentation](https://docs.sonarqube.org/).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

