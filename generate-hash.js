import bcrypt from 'bcryptjs'

async function hashPassword() {
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Password:', password)
    console.log('Hashed:', hashedPassword)
}

hashPassword()
