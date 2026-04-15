# 🚀 Full Stack Project Setup Guide

## 📦 Installation

Download the project as a ZIP file and extract it into a separate folder.
Ensure the extracted folder structure is correct and does not cause any path or traversal errors.

---

## 🖥️ Running the Project

### 🔹 Frontend Setup

1. Open Command Prompt / Terminal in the `frontend` folder
2. Run the following commands:

```
npm install
npm run dev
```

✅ The frontend will start successfully.

---

### 🔹 Backend Setup

1. Open Command Prompt / Terminal in the `backend` folder
2. Run:

```
npm install
node server.js
```

✅ The backend server will start.

---

### 🤖 Machine Learning Model

1. Open Command Prompt / Terminal in the ML model folder (`DWDM model`)
2. Run the Python file:

```
python api_recommend.py
```

✅ The ML model service will start.

---

## ⚠️ Notes

* Refer to `package.json` for required dependencies
* If you modify `package.json`, run:

```
npm install
```

* Ensure Node.js and Python are installed on your system
* Recommended versions:

  * Node.js ≥ 16
  * Python ≥ 3.8

---

## 📁 Project Structure

```
project-root/
├── frontend/
├── backend/
├── DWDM model/
└── README.md
```

---

## ✅ Summary

* Install dependencies using `npm install`
* Run frontend and backend separately
* Start ML model using Python script
* Ensure correct folder structure before running

---
