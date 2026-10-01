const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    department: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    arrears: { type: Number, required: true, min: 0 },
    companies: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: {
        validator: (companies) => companies.length === 4,
        message: 'Select exactly four companies.',
      },
    },
  },
  { timestamps: true },
)

const Student = mongoose.model('Student', studentSchema)

app.get('/', (_request, response) => {
  response.json({ message: 'Pathway registration API is running', students: '/api/students' })
})

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.get('/api/students', async (_request, response) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean()
    response.json(students)
  } catch (error) {
    console.error('Could not load students:', error.message)
    response.status(500).json({ message: 'Could not load student registrations.' })
  }
})

app.post('/api/students', async (request, response) => {
  try {
    const studentId = String(request.body.studentId || '').trim().toUpperCase()
    const student = await Student.findOneAndUpdate(
      { studentId },
      { ...request.body, studentId },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
    response.status(200).json(student)
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
      response.status(400).json({ message: error.message })
      return
    }
    console.error('Could not save student:', error.message)
    response.status(500).json({ message: 'Could not save the student registration.' })
  }
})

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it to server/.env.')
  }

  await mongoose.connect(process.env.MONGO_URI)
  app.listen(port, () => {
    console.log(`MongoDB connected. Server running at http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exit(1)
})