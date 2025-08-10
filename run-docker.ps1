# PowerShell script to run the application locally with Docker

param(
    [switch]$Build,
    [switch]$Stop,
    [switch]$Logs,
    [switch]$Clean,
    [switch]$FreeTier,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Local Docker Deployment for Message Wall

Usage: .\run-docker.ps1 [options]

Options:
  -Build      Build and start the containers
  -Stop       Stop all containers
  -Logs       Show container logs
  -Clean      Clean up containers and volumes
  -FreeTier   Use free tier configuration (SQLite instead of PostgreSQL)
  -Help       Show this help message

Examples:
  .\run-docker.ps1 -Build              # Build and start (full version)
  .\run-docker.ps1 -Build -FreeTier    # Build and start (free tier version)
  .\run-docker.ps1 -Stop               # Stop containers
  .\run-docker.ps1 -Logs               # View logs
  .\run-docker.ps1 -Clean              # Clean everything

Free Tier version:
  - Uses SQLite instead of PostgreSQL
  - Mirrors AWS Free Tier deployment
  - Lighter resource usage
"@
    exit 0
}

# Color functions
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH"
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Compose is not installed or not in PATH"
    exit 1
}

# Build and start containers
if ($Build) {
    if ($FreeTier) {
        Write-Info "Building and starting containers (Free Tier configuration)..."
        $composeFile = "docker-compose.freetier.yml"
        $dbInfo = "SQLite database (file-based)"
    } else {
        Write-Info "Building and starting containers (Full configuration)..."
        $composeFile = "docker-compose.yml"
        $dbInfo = "PostgreSQL database"
    }
    
    # Create .env file for Docker Compose
    if ($FreeTier) {
        $envContent = @"
DATABASE_URL=file:/app/database/messagewall.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secure-secret-key-here
"@
    } else {
        $envContent = @"
DB_PASSWORD=secure_password_123
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secure-secret-key-here
"@
    }
    
    $envContent | Out-File -FilePath ".env" -Encoding utf8
    
    # Create directories for free tier
    if ($FreeTier) {
        New-Item -ItemType Directory -Force -Path "database", "uploads", "logs" | Out-Null
    }
    
    docker-compose -f $composeFile up --build -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Containers started successfully!"
        Write-Info "Configuration: $dbInfo"
        Write-Info "Application will be available at: http://localhost:3000"
        if ($FreeTier) {
            Write-Info "Nginx proxy available at: http://localhost:80"
        }
        Write-Info "Admin login: username: admin, password: admin123"
        Write-Info "Use 'docker-compose -f $composeFile logs -f' to view logs"
    } else {
        Write-Error "Failed to start containers"
    }
}

# Stop containers
if ($Stop) {
    Write-Info "Stopping containers..."
    
    # Try both compose files
    docker-compose -f docker-compose.yml down 2>$null
    docker-compose -f docker-compose.freetier.yml down 2>$null
    
    Write-Success "Containers stopped successfully!"
}

# Show logs
if ($Logs) {
    Write-Info "Showing container logs..."
    docker-compose logs -f
}

# Clean up
if ($Clean) {
    Write-Warning "This will remove all containers, networks, and volumes!"
    $response = Read-Host "Are you sure? (y/N)"
    
    if ($response -match '^[Yy]$') {
        Write-Info "Cleaning up..."
        docker-compose down -v --rmi all
        docker system prune -f
        
        if (Test-Path ".env") {
            Remove-Item ".env"
        }
        
        Write-Success "Cleanup completed!"
    }
}

# If no parameters provided, show status
if (-not ($Build -or $Stop -or $Logs -or $Clean)) {
    Write-Info "Container Status:"
    docker-compose ps
}
