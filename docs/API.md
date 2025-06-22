# API Documentation

## Endpoints

### POST /api/chat
- **Description**: Send a message to the AI chatbot
- **Body**: `{ message: string, context?: object }`
- **Response**: `{ response: string, messageId: string }`