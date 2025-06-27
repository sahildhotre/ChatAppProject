# 📱 Real-Time Chat Application (React Native + Node.js + Socket.IO)

A **WhatsApp-like real-time group chat app** built using **React Native** for mobile devices and **Node.js + Socket.IO** for the backend.

This project enables users to exchange real-time messages through a Node.js server, which broadcasts messages to all connected users, replicating group chat functionality similar to WhatsApp.

<p align="center">
  <img src="https://github.com/user-attachments/assets/cabe463c-5588-485e-95d3-ab6e56df8e79" width="250">
</p>

---

## 🚀 How It Works

✅ Users enter their username and join the chat  
✅ Messages are sent to the **Node.js + Socket.IO** server  
✅ The server receives and broadcasts messages to all connected devices  
✅ Messages instantly appear for all participants in real time  

---

## 🔧 Tech Stack Used

| Technology      | Purpose                                  |
|-----------------|------------------------------------------|
| **React Native** | Cross-platform mobile app development   |
| **Node.js**      | Backend runtime environment             |
| **Express.js**   | Lightweight server framework            |
| **Socket.IO**    | Real-time bidirectional communication   |
| **TypeScript**   | Strong typing for React Native components |

---

## ✨ Features

✅ Real-time, bidirectional group chat  
✅ Clean, responsive chat UI similar to WhatsApp  
✅ Group chat functionality - All users in one common chat room  
✅ Displays sender name and message timestamp  
✅ Sent messages right-aligned, received messages left-aligned  
✅ Optimized chat scroll with FlatList  
✅ Keyboard-aware message input for smooth typing experience  
✅ **User typing indicator**  
✅ Displays when a user connects or disconnects  
✅ Message validation to avoid sending empty messages  
✅ Server logs every incoming message in JSON format  
✅ Lightweight, efficient socket management  
✅ Works completely over Wi-Fi after app installation  

---

## 📂 Project Structure
```
ChatAppProject/
├── MobileApp/ # React Native mobile application
│ ├── android/ # Android-specific files
│ ├── ios/ # iOS-specific files (optional)
│ ├── App.tsx # Main mobile application logic
│ ├── package.json # Mobile app dependencies
│ └── ...
│
├── server/ # Node.js backend server
│ ├── index.js # Main server entry point
│ ├── package.json # Server dependencies
│ └── ...
│
├── README.md # Project documentation
└── .gitignore # Files excluded from version control
```
---
## 🔌 Precautions Before Running the Project

### 🔗 Connectivity Requirements:
Your **Mobile Device** and **PC (Server Machine)** must be connected to the same **Wi-Fi network** for socket communication to work.

---

### 🛠️ Mobile Device Setup:
- Enable **Developer Options** on your Android device  
- Enable **USB Debugging**  

Run the following command:

```bash
adb devices

const socket = io('http://YOUR_PC_IP:3000');

with your actual IP, e.g., 192.168.0.103

```
✅ You should see your device listed. If it shows "unauthorized", accept the popup on your mobile.

### 📡 Server IP Address:

Find your PC's local IPv4 address using:

```bash
ipconfig
```
In MobileApp/app.tsx, replace:
```
const socket = io('http://YOUR_PC_IP:3000');
```
---
## 📲 How to Run the Project

Follow these steps to get the server and the mobile application running.

### 1️⃣ Start the Backend Server

First, start the Node.js server which will handle all the real-time communication.

```bash
cd server
npm install
node index.js
```
### 2️⃣ Run the Mobile Application
- Connect your Android device via USB (only for the first install)

- Navigate to your project:
```
cd MobileApp
npm install
```
###  Build & run the app:
```
npx react-native run-android
```
- Once the app is installed, disconnect USB. The app works over Wi-Fi.
---

## 🖼️ Screenshots

---
## 🎯 Conclusion
This project demonstrates a complete, real-time group chat solution using modern technologies. 

It's lightweight, user-friendly, and ideal for understanding:

✅ Mobile development with React Native

✅ Real-time communication using Socket.IO

✅ Event-driven server architecture with Node.js




