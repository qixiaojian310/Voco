

![icon](./report/icon.png) (HKU7506) This is a Android app for improving your memory in vocabulary. 

# How to setup it

## (For usage)
Download APK in the release

## (For development) Just setup frontend

### prerequisite
- Have Java 23
- Have NodeJS >= 18
- Download Android SDK > 25

### Step 1 Download all package
Input these commands in your root path
```shell
npm install -g yarn
yarn install
yarn android
```
if every thing setup well, you can see a emulator or if you have real android smart phone and setup adb, you can see a package install in there
![first page](./report/Screenshot_2025-05-04-13-28-26-17_252b32529fff5119fd2770dbc3524f79.jpg)

## (For development) setup backend

Backend is written in Python, so you need to setup Python in your IDE, my environment is python3.8, you can use miniconda to setup it.

### prerequisite
- Have Python 3.8
- Have pip

```shell
cd backend
pip install fastapi uvicorn mysql-connector-python # maybe more package
# if you can run this command, you can see a server start
python app.py
```

### Change file link

1. Find your IP address with `ipconfig` command
2. Setup your database, you can use our sql script in `backend/sql` folder
3. Add a `.env` file like
```plaintext
MYSQL_PASSWORD=Your password
MYSQL_DATABASE=voco
MYSQL_HOST=127.0.0.1
```
in your backend folder

4. Change `frontend/request/requestWrapper.ts` change backend to your backend address
