## cmd lines used during development

```bash
docker run --name yourcontainername -e POSTGRES_USER=yourusernamewithoutspace -e POSTGRES_PASSWORD=yourpasswordwithoutspecialcharacters -
```

To migrate prisma file, 
```bash
npx prisma generate
```
To migrate prisma file

```bash
npx prisma migrate dev
```
```bash
npx prisma db push
```
To generate random key
```bash
openssl rand -hex 32
```

if any changes made in model file, we follow these cmd line to generate and migrate prisma files
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db push
```

# 🚀 Judge0 Installation Guide using WSL and Docker
This guide walks you through setting up Judge0 v1.13.1 inside WSL (Windows Subsystem for Linux) with Docker and Docker Compose.

### 🧰 Prerequisites
Windows 10/11 with WSL enabled

```bash
# Install Windows Subsystem for Linux (WSL)
wsl --install

# Launch the Ubuntu distribution within WSL
wsl -d Ubuntu

# Update and upgrade system packages
sudo apt update && sudo apt upgrade -y

# (Optional) Edit GRUB configuration if required by Judge0 documentation
sudo nano /etc/default/grub

# Install Docker in the Linux environment (WSL)
sudo apt install -y docker.io

# Install Docker Compose to manage multiple containers
sudo apt install -y docker-compose

# Download the Judge0 release archive
wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip

# Unzip the downloaded archive
unzip judge0-v1.13.1.zip

# Navigate into the extracted Judge0 directory
cd judge0-v1.13.1

# Generate a strong random password for Redis and PostgreSQL
# Visit: https://www.random.org/passwords/?num=1&len=32&format=plain&rnd=new

# Edit the configuration file to set Redis and PostgreSQL credentials
nano judge0.conf
# (In nano: Ctrl+O to save, Enter to confirm, Ctrl+X to exit)

# Start only the 'db' and 'redis' services defined in docker-compose.yml
sudo docker-compose up -d db redis

# Wait for 10s so that redis and db can initialize because we'll require this in later work
sleep 10s

# Start all other service that are in docker-compose.yaml file in detach mode
sudo docker-compose up -d

# Verify that the services are running
sudo docker ps

# (Optional) Stop and remove the running containers
sudo docker-compose down/stop

# Exit the WSL environment
exit

go to this folder: /mnt/c/Users/iamas/judge0-v1.13.1
sudo docker-compose up -d db redis
sleep 10s
sudo docker-compose up -d
sleep 5s
```

## steps follow to run the project from local machine docker, judge0 
```bash
# go to wsl -d Ubuntu and run these cmd line so that judge0 and related db can run there in there docker
sudo docker-compose up -d db redis
sleep 10s  # Wait for services to initialize

sudo docker-compose up -d
sleep 5s  # Wait for services to fully start


# keep up local machine docker where you're using your database

# Node.js:
npm run dev

```



We can also use the judge0 which is hosted on rapid api, sulu judge0 or other platform to get access directly from and send our code to them and execute it.