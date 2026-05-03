# Laravel Production Deployment Guide

This guide explains how to deploy this Laravel 13 application with Filament, Inertia+React, and PostgreSQL to an Ubuntu cloud server.

## Prerequisites

- Ubuntu 22.04 or 24.04 LTS server
- Domain name pointing to your server's IP address
- SSH access to your server
- Git repository with your code

## Quick Deploy (Automated)

1. **Update configuration in `deploy/deploy.sh`:**
   ```bash
   APP_NAME="your-app-name"
   DOMAIN="your-domain.com"
   DB_NAME="your_production_db_name"
   DB_USER="your_db_username"
   DB_PASSWORD="your_strong_db_password"
   EMAIL="your-email@example.com"
   ```

2. **Upload files to your server:**
   ```bash
   # On your local machine
   scp -r deploy/ user@your-server-ip:/tmp/
   ```

3. **Run the deployment script:**
   ```bash
   # On your server
   cd /tmp/deploy
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Manual Deployment Steps

### 1. Connect to Your Server

```bash
ssh user@your-server-ip
```

### 2. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Required Packages

```bash
sudo apt install -y git curl wget unzip supervisor nginx postgresql postgresql-contrib \
    libpq-dev python3-certbot-nginx build-essential pkg-config libonig-dev libxml2-dev \
    libzip-dev zlib1g-dev libicu-dev g++ nodejs npm
```

### 4. Install PHP 8.4

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.4 php8.4-fpm php8.4-cli php8.4-pgsql php8.4-mbstring \
    php8.4-xml php8.4-zip php8.4-curl php8.4-gd php8.4-intl php8.4-bcmath \
    php8.4-tokenizer php8.4-fileinfo

sudo systemctl enable php8.4-fpm
sudo systemctl start php8.4-fpm
```

### 5. Install Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 6. Setup PostgreSQL Database

```bash
sudo -u postgres psql
```

Inside PostgreSQL:
```sql
CREATE DATABASE your_production_db_name;
CREATE USER your_db_username WITH PASSWORD 'your_strong_db_password';
GRANT ALL PRIVILEGES ON DATABASE your_production_db_name TO your_db_username;
\c your_production_db_name
GRANT ALL ON SCHEMA public TO your_db_username;
\q
```

### 7. Clone Your Application

```bash
sudo mkdir -p /var/www/your-app-name
sudo chown $USER:$USER /var/www/your-app-name
cd /var/www/your-app-name
git clone https://github.com/your-username/your-repo.git .
```

### 8. Install Dependencies

```bash
composer install --no-dev --optimize-autoloader --no-interaction
npm ci --production
npm run build
```

### 9. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` file:
```bash
nano .env
```

Update these values:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=pgsql
DB_DATABASE=your_production_db_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_strong_db_password

LOG_LEVEL=error

MAIL_MAILER=smtp
MAIL_HOST=smtp.your-mail-provider.com
MAIL_PORT=587
MAIL_USERNAME=your_mail_username
MAIL_PASSWORD=your_mail_password
MAIL_FROM_ADDRESS=noreply@your-domain.com
```

Run migrations:
```bash
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 10. Set File Permissions

```bash
sudo chown -R www-data:www-data /var/www/your-app-name/storage /var/www/your-app-name/bootstrap/cache
sudo chmod -R 775 /var/www/your-app-name/storage /var/www/your-app-name/bootstrap/cache
```

### 11. Configure Nginx

Copy the Nginx configuration:
```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/your-app-name
```

Edit the configuration:
```bash
sudo nano /etc/nginx/sites-available/your-app-name
```

Replace `your-domain.com` and `your-app-name` with your actual values.

Enable the site:
```bash
sudo ln -sf /etc/nginx/sites-available/your-app-name /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 12. Setup SSL with Let's Encrypt

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com --non-interactive --agree-tos --email your-email@example.com
```

### 13. Configure Supervisor for Queue Workers

```bash
sudo cp deploy/supervisor-laravel-worker.conf.example /etc/supervisor/conf.d/laravel-worker.conf
sudo nano /etc/supervisor/conf.d/laravel-worker.conf
```

Update the path to your application, then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

### 14. Setup Laravel Scheduler

Option A - Using systemd:
```bash
sudo cp deploy/laravel-scheduler.service.example /etc/systemd/system/laravel-scheduler.service
sudo nano /etc/systemd/system/laravel-scheduler.service
```

Update the path, then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable laravel-scheduler
sudo systemctl start laravel-scheduler
```

Option B - Using cron:
```bash
(crontab -l 2>/dev/null; echo "* * * * * cd /var/www/your-app-name && php artisan schedule:run >> /dev/null 2>&1") | crontab -
```

## Post-Deployment

### Create Admin User

Access your Filament admin panel:
```bash
php artisan make:filament-user
```

### Verify Services

```bash
# Check Nginx status
sudo systemctl status nginx

# Check PHP-FPM status
sudo systemctl status php8.4-fpm

# Check Supervisor workers
sudo supervisorctl status

# Check Scheduler
sudo systemctl status laravel-scheduler

# View application logs
tail -f /var/www/your-app-name/storage/logs/laravel.log
```

### Useful Commands

```bash
# Restart queue workers
sudo supervisorctl restart laravel-worker:*

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run migrations
php artisan migrate --force

# Renew SSL certificate
sudo certbot renew

# Test Nginx configuration
sudo nginx -t
```

## Troubleshooting

### Permission Issues
```bash
sudo chown -R www-data:www-data /var/www/your-app-name/storage
sudo chmod -R 775 /var/www/your-app-name/storage
```

### Queue Not Processing
```bash
sudo supervisorctl status
sudo supervisorctl restart laravel-worker:*
tail -f /var/www/your-app-name/storage/logs/worker.log
```

### Database Connection Error
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `.env`
- Check database exists: `sudo -u postgres psql -l`

## Security Recommendations

1. Configure firewall (UFW):
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. Setup automatic security updates:
   ```bash
   sudo apt install unattended-upgrades
   ```

3. Use strong passwords for database and admin users

4. Regularly update dependencies:
   ```bash
   composer update --no-dev
   npm update
   ```

5. Monitor logs regularly

## Support

For issues, check:
- Laravel logs: `/var/www/your-app-name/storage/logs/laravel.log`
- Nginx logs: `/var/log/nginx/error.log`
- PHP-FPM logs: `/var/log/php8.4-fpm.log`
- Supervisor logs: `/var/www/your-app-name/storage/logs/worker.log`
