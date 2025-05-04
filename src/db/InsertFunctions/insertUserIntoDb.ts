
import db from '../index';
import { InsertUser, usersTable } from './../schema';

const InsertUserIntoDb = async(user:InsertUser) => {
    try {
        if (!user) {
            throw new Error("Invalid user data: Expected InsertUser type");
        }
        const res = await db.insert(usersTable).values(user).returning().get()
        if(!res) {
            throw new Error("Failed to insert user into the database")
        }
        return res;
    } catch (error) {
        console.error("Error inserting user:", error);
        return null;
    }
}

export default InsertUserIntoDb; 
