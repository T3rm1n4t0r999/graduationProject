#!/bin/bash

# Laravel Production Deployment Script for Ubuntu
# Run this script on your Ubuntu server after purchasing it

set -e

# ============================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================
APP_NAME="your-app-name"
APP_DIR="/var/www/$APP_NAME"
DOMAIN="your-domain.com"
DB_NAME="your_production_db_name"
DB_USER="your_db_username"
DB_PASSWORD="your_strong_db_password"
EMAIL="your-email@example.com"

echo "=========================================="
echo "Laravel Production Deployment Script"
echo "=========================================="
echo ""

# ============================================
# 1. SYSTEM UPDATES AND BASIC INSTALLATIONS
# ============================================
echo "[1/12] Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "[2/12] Installing required system packages..."
sudo apt install -y \
    git \
    curl \
    wget \
    unzip \
    supervisor \
    nginx \
    postgresql \
    postgresql-contrib \
    libpq-dev \
    python3-certbot-nginx \
    build-essential \
    pkg-config \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zlib1g-dev \
    libicu-dev \
    g++ \
    nodejs \
    npm

# ============================================
# 2. INSTALL PHP 8.4
# ============================================
echo "[3/12] Installing PHP 8.4..."
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.4 php8.4-fpm php8.4-cli php8.4-pgsql php8.4-mbstring \
    php8.4-xml php8.4-zip php8.4-curl php8.4-gd php8.4-intl php8.4-bcmath \
    php8.4-tokenizer php8.4-fileinfo

# Disable default PHP and enable 8.4
sudo systemctl disable php*-fpm 2>/dev/null || true
sudo systemctl enable php8.4-fpm
sudo systemctl start php8.4-fpm

# ============================================
# 3. INSTALL COMPOSER
# ============================================
echo "[4/12] Installing Composer..."
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version

# ============================================
# 4. SETUP POSTGRESQL DATABASE
# ============================================
echo "[5/12] Setting up PostgreSQL database..."
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF

# ============================================
# 5. CLONE YOUR APPLICATION
# ============================================
echo "[6/12] Cloning application from Git..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
cd $APP_DIR

# Replace with your Git repository URL
git clone https://github.com/your-username/your-repo.git .
# Or if you already cloned:
# git pull origin main

# ============================================
# 6. INSTALL DEPENDENCIES
# ============================================
echo "[7/12] Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "[8/12] Installing Node.js dependencies and building assets..."
npm ci --production
npm run build

# ============================================
# 7. CONFIGURE ENVIRONMENT
# ============================================
echo "[9/12] Configuring environment..."
cp .env.example .env

# Generate APP_KEY
php artisan key:generate

# Update .env with production values (use sed or manually edit)
sed -i "s|APP_ENV=local|APP_ENV=production|g" .env
sed -i "s|APP_DEBUG=true|APP_DEBUG=false|g" .env
sed -i "s|APP_URL=http://localhost|APP_URL=https://$DOMAIN|g" .env
sed -i "s|DB_DATABASE=.*|DB_DATABASE=$DB_NAME|g" .env
sed -i "s|DB_USERNAME=.*|DB_USERNAME=$DB_USER|g" .env
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|g" .env
sed -i "s|LOG_LEVEL=debug|LOG_LEVEL=error|g" .env

# Run migrations
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# ============================================
# 8. SETUP FILE PERMISSIONS
# ============================================
echo "[10/12] Setting up file permissions..."
sudo chown -R www-data:www-data $APP_DIR/storage $APP_DIR/bootstrap/cache
sudo chmod -R 775 $APP_DIR/storage $APP_DIR/bootstrap/cache

# ============================================
# 9. CONFIGURE NGINX
# ============================================
echo "[11/12] Configuring Nginx..."
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/$APP_NAME
sudo sed -i "s|your-domain.com|$DOMAIN|g" /etc/nginx/sites-available/$APP_NAME
sudo sed -i "s|your-app-name|$APP_NAME|g" /etc/nginx/sites-available/$APP_NAME

sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# ============================================
# 10. SETUP SSL WITH LET'S ENCRYPT
# ============================================
echo "[12/12] Setting up SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# ============================================
# 11. CONFIGURE SUPERVISOR FOR QUEUE WORKERS
# ============================================
echo "Setting up Supervisor for queue workers..."
sudo cp deploy/supervisor-laravel-worker.conf.example /etc/supervisor/conf.d/laravel-worker.conf
sudo sed -i "s|your-app-name|$APP_NAME|g" /etc/supervisor/conf.d/laravel-worker.conf

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*

# ============================================
# 12. SETUP LARAVEL SCHEDULER
# ============================================
echo "Setting up Laravel Scheduler..."
sudo cp deploy/laravel-scheduler.service.example /etc/systemd/system/laravel-scheduler.service
sudo sed -i "s|your-app-name|$APP_NAME|g" /etc/systemd/system/laravel-scheduler.service

sudo systemctl daemon-reload
sudo systemctl enable laravel-scheduler
sudo systemctl start laravel-scheduler

# Setup cron job as alternative
(crontab -l 2>/dev/null; echo "* * * * * cd $APP_DIR && php artisan schedule:run >> /dev/null 2>&1") | crontab -

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Your application is now running at: https://$DOMAIN"
echo ""
echo "Important commands:"
echo "  - Check status: sudo supervisorctl status"
echo "  - Restart workers: sudo supervisorctl restart laravel-worker:*"
echo "  - View logs: tail -f $APP_DIR/storage/logs/laravel.log"
echo "  - Restart scheduler: sudo systemctl restart laravel-scheduler"
echo "  - Renew SSL: sudo certbot renew"
echo ""
echo "Next steps:"
echo "  1. Update your .env file with actual mail credentials"
echo "  2. Create an admin user in Filament"
echo "  3. Test your application"
echo ""
