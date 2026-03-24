# Repair System Tracking Web App

A comprehensive full-stack platform designed to streamline operations for repair shops. 

This application provides an end-to-end solution for managing client appointments, tracking repair statuses, generating automated invoices, and facilitating seamless real-time communication between customers and administration through an integrated Live WebSockets chat and Google Gemini AI Agent.

## Features
- **Client & Admin Dashboards**: Role-based access control with specialized interfaces.
- **Repair Tracking**: Real-time status updates from ticket creation to completion.
- **Live Support Chat**: Instant bidirectional WebSocket messaging.
- **AI Chatbot Assistant**: Automated initial triaging using Gemini AI.
- **Invoice Management**: Automated PDF invoice generation and download capabilities.
- **Dynamic Notifications**: In-app toasts and email alerting system.

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Zustand, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, bcrypt
