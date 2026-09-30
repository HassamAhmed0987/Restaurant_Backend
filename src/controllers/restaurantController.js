import Restaurant from "../models/restaurant.js";

export const createRestaurant = async (req, res) => {
    try {
        const {
            name,
            description,
            phone,
            email,
            address,
            city,
            openingTime,
            closingTime
        } = req.body


        if (!name || !email || !address || !city || !phone){
            return res.status(400).json({
                success: false,
                message: "Name, email, address, city and phone are required fields"
            })
        }

        // don't check existing restaurant because email is unique.

        const restaurant = await Restaurant.create({
            name,
            description,
            owner: req.user._id,
            phone,
            email,
            address,
            city,
            openingTime,
            closingTime
        })

        return res.status(201).json({
            success: true,
            message: "Restaurant created successfully!",
            data: restaurant
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const getAllRestaurants = async (req, res) => {
    try {
        const filter = req.user?.role === 'super_admin' ? {} : { isActive: true };
        const restaurants = await Restaurant.find(filter)
            .populate('owner', 'name email role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id).populate('owner', 'name email role');

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            });
        }

        // Agar restaurant inactive hai aur request Super Admin/Assigned Admin ki taraf se nahi hai
        if (!restaurant.isActive && req.user?.role !== 'SUPER_ADMIN' && req.user?.restaurantId?.toString() !== id) {
            return res.status(403).json({
                success: false,
                message: "This restaurant is currently inactive."
            });
        }

        return res.status(200).json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            });
        }

        // Authorization Check: Only Super Admin OR the assigned Restaurant Admin can update
        const isSuperAdmin = req.user.role === 'super_admin';
        const isAssignedAdmin = req.user.role === 'admin' && req.user.restaurantId?.toString() === id;

        if (!isSuperAdmin && !isAssignedAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this restaurant."
            });
        }

        // Prevent ADMIN from changing sensitive fields like `isActive`
        if (!isSuperAdmin && req.body.isActive !== undefined) {
            delete req.body.isActive;
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Restaurant updated successfully!",
            data: updatedRestaurant
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const toggleRestaurantStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body; 

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "Please provide 'isActive' as a boolean field (true or false)."
            });
        }

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            });
        }

        restaurant.isActive = isActive;
        await restaurant.save();

        return res.status(200).json({
            success: true,
            message: `Restaurant ${isActive ? 'activated' : 'deactivated'} successfully!`,
            data: {
                id: restaurant._id,
                name: restaurant.name,
                isActive: restaurant.isActive
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};