import User from "../models/user.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.json({
                message: "name email and password required"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        res.status(201).json({
            message: "User successfully created",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}



export const userlogin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.json({
                message: "email and password required"
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: "Invalid email or password"
            })
        }

        const passwordMatched = await bcrypt.compare(password, user.password)

        if (!passwordMatched) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn : process.env.JWT_EXPIRES_IN
            }
        )

        res.json({
            success: true,
            message: "Login successfull",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                accessToken: token
            }
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}





















