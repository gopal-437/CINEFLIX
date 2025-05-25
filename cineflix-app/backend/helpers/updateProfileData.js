const { MongoClient, ObjectId } = require('mongodb');


async function updateProfileData(userData) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('local');
        const user_collection = db.collection('user_collection');

        // console.log("at baclksd ",userData);

        // Check if email, phone, or username already exists for other users
        const existingUser = await user_collection.findOne({
            _id: { $ne: new ObjectId(userData._id) }, // Exclude current user
            $or: [
                { email: userData.email },
                { phone: userData.phone },
                { username: userData.username }
            ]
        });

        if (existingUser) {
            if (existingUser.email === userData.email) {
                return { success: false, message: 'Email already exist' }
            }
            if (existingUser.phone === userData.phone) {
                return { success: false, message: 'phone already exist' }
            }
            if (existingUser.username === userData.username) {
                return { success: false, message: 'username already exist' }
            }
        }

        // Prepare update object
        const updateFields = {
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            username: userData.username,
            updatedAt: new Date()
        };

        // Only update password if it's provided and not empty
        if (userData.password && userData.password.trim() !== '') {
            updateFields.password = userData.password;
        }

        // Update the user
        const result = await user_collection.updateOne(
            { _id: new ObjectId(userData._id) },
            { $set: updateFields }
        );

        const user = await user_collection.findOne({ email: userData.email });

        if (result.modifiedCount === 0) {
            throw new Error('User not found or no changes made');
        }

        return {userData:user, success: true, message: 'Profile updated successfully' };

    } catch (error) {
        console.error('Error in editprofiledata:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { updateProfileData };