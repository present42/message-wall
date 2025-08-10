#!/bin/bash

# AWS Deployment Script for Message Wall
# This script helps deploy the application to AWS

set -e

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_info "Checking requirements..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Build the application locally first
build_app() {
    print_info "Building application locally..."
    
    # Install dependencies
    npm ci
    
    # Generate Prisma client for PostgreSQL
    npm run db:generate
    
    # Build Next.js application
    npm run build
    
    print_success "Application built successfully!"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    print_info "Deploying AWS infrastructure..."
    
    cd terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    print_info "Planning infrastructure deployment..."
    terraform plan -var="db_password=$DB_PASSWORD" -var="domain_name=$DOMAIN_NAME"
    
    # Ask for confirmation
    read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled."
        exit 0
    fi
    
    # Apply infrastructure
    print_info "Applying infrastructure changes..."
    terraform apply -var="db_password=$DB_PASSWORD" -var="domain_name=$DOMAIN_NAME" -auto-approve
    
    # Get outputs
    ALB_DNS_NAME=$(terraform output -raw alb_dns_name)
    RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
    S3_BUCKET=$(terraform output -raw s3_bucket_name)
    
    print_success "Infrastructure deployed successfully!"
    print_info "Load Balancer DNS: $ALB_DNS_NAME"
    
    cd ..
}

# Set up environment variables
setup_environment() {
    print_info "Setting up environment variables..."
    
    # Ask for required inputs
    if [ -z "$DB_PASSWORD" ]; then
        read -s -p "Enter database password: " DB_PASSWORD
        echo
    fi
    
    if [ -z "$DOMAIN_NAME" ]; then
        read -p "Enter domain name (optional): " DOMAIN_NAME
    fi
    
    if [ -z "$NEXTAUTH_SECRET" ]; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        print_info "Generated NextAuth secret"
    fi
    
    export DB_PASSWORD
    export DOMAIN_NAME
    export NEXTAUTH_SECRET
}

# Update DNS records (if using Route 53)
setup_dns() {
    if [ -n "$DOMAIN_NAME" ] && [ "$DOMAIN_NAME" != "" ]; then
        print_info "Setting up DNS records..."
        print_warning "Please manually update your DNS records to point to: $ALB_DNS_NAME"
        print_info "If using Route 53, you can create an alias record pointing to the ALB."
    fi
}

# Main deployment function
main() {
    print_info "🚀 Starting AWS deployment for Message Wall..."
    
    # Check if we're in the correct directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    check_requirements
    setup_environment
    build_app
    deploy_infrastructure
    setup_dns
    
    print_success "🎉 Deployment completed successfully!"
    
    echo ""
    echo "Next steps:"
    echo "1. Wait for the EC2 instances to fully initialize (5-10 minutes)"
    echo "2. Access your application at: http://$ALB_DNS_NAME"
    if [ -n "$DOMAIN_NAME" ]; then
        echo "3. Update DNS records to point $DOMAIN_NAME to $ALB_DNS_NAME"
        echo "4. Set up SSL certificate using AWS Certificate Manager"
    fi
    echo "5. Monitor the application using AWS CloudWatch"
    echo ""
    echo "Useful commands:"
    echo "  terraform output                 # View all outputs"
    echo "  aws ec2 describe-instances       # Check EC2 status"
    echo "  aws logs tail /aws/ec2/user-data # View deployment logs"
}

# Run main function
main "$@"
