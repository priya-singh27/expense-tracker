# Expense Splitter API

A RESTful API for managing shared expenses and splitting bills among friends. Built with Node.js and Express.

## Features

- User Authentication with OTP Verification
- Password Reset/Recovery System
- Friend Management System
- Expense Tracking
- Bill Splitting
- Multiple Split Bill Methodologies

## Getting Started

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
node index.js
```

## API Documentation

All endpoints return responses in the following format:
```javascript
// Success Response
{
    "code": 200,
    "data": {}, // Response data
    "message": "Success message"
}

// Error Response
{
    "code": 500, // or 400, 404, etc.
    "message": "Error message"
}
```

### User Authentication & Management

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/user/sendotp` | POST | No | Send OTP for registration |
| `/api/user/verifyotp` | POST | No | Verify OTP |
| `/api/user/login` | POST | No | User login |
| `/api/user/forgotpassword` | POST | No | Initiate password recovery |
| `/api/user/changepassword` | POST | No | Change password with recovery token |
| `/api/user/resetpassword` | POST | Yes | Generate reset token |
| `/api/user/newpassword` | POST | Reset Token | Set new password |

### Friend Management

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/user/searchuser` | POST | Yes | Search for users |
| `/api/user/addfriend` | POST | Yes | Send friend request |
| `/api/user/myfriendrequests` | GET | Yes | View received friend requests |
| `/api/user/mysentrequests` | GET | Yes | View sent friend requests |
| `/api/user/acceptfriendrequest/:id` | POST | Yes | Accept friend request |
| `/api/user/rejectfriendrequest/:id` | POST | Yes | Reject friend request |

### Expense Management

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/expense/addexpense` | POST | Yes | Add new expense |
| `/api/expense/updateexpense/:id` | POST | Yes | Update existing expense |
| `/api/expense/deleteexpense/:id` | POST | Yes | Delete expense |
| `/api/expense/allexpenses` | GET | Yes | Get all expenses |

### Split Bill Management

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/splitbill/addparticipants` | POST | Yes | Create new split bill with participants |
| `/api/splitbill/updatebill/:id` | POST | Yes | Update split bill details |
| `/api/splitbill/addcreator/:id` | POST | Yes | Add bill creator as participant |
| `/api/splitbill/addamount/:id` | POST | Yes | Add amount to split bill |
| `/api/splitbill/remove/:id` | POST | Yes | Remove participant from split bill |

## Authentication

The API uses token-based authentication. Protected routes require a valid authentication token to be included in the request header as `x-auth-token`.

## Error Handling

The API implements comprehensive error handling with appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Dependencies

- express - Web framework
- mongoose - MongoDB object modeling
- bcrypt - Password hashing
- joi - Request validation
- jsonwebtoken - JWT authentication

## Environment Variables

Create a `.env` file in the root directory with the following:
```
MONGODB_URI=your_mongodb_connection_string
JWT_PRIVATE_KEY=your_jwt_secret
# Add other required environment variables
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
