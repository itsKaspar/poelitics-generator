// Require the Express module
const express = require('express')

// Create an instance of an Express app
const app = express()

// Define the port number as a variable
const PORT = 1234

// Serve static files from the 'public' directory
app.use(express.static('public'))

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
