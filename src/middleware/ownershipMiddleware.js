



export const checkRestaurantOwnership = (req, res, next) => {
    try {

        if (req.user.role === "super_admin") {
            return next()
        }


        const targetedRestaurant = req.params.restaurantId

        if (!req.user.restaurantId || req.user.restaurantId.toString() !== targetRestaurantId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You are not authorized to manage or access another restaurant\'s data.'
            });
        }


        next()

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Ownership verification failed.',
            error: err.message
        });
    }
}