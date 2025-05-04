import db from "../index";
import { booksTable, InsertBook, InsertStationary, InsertUniforms, InsertUser, StationaryTable, UniformsTable } from "../schema";

// Type guard functions
const isBook = (item: InsertBook | InsertStationary | InsertUniforms): item is InsertBook => {
    return 'fileData' in item;
};

const isStationary = (item: InsertBook | InsertStationary | InsertUniforms): item is InsertStationary => {
    return 'additionalImgs' in item;
};

const isUniform = (item: InsertBook | InsertStationary | InsertUniforms): item is InsertUniforms => {
    return 'size' in item;
};

const insertItem = async (
    typeOfItem: "book" | "stationary" | "uniforms",
    item: InsertBook | InsertStationary | InsertUniforms,
) => {
    try {
        if (typeOfItem === "book" && !isBook(item)) {
            throw new Error("Invalid item type: Expected Book");
        }
        if (typeOfItem === "stationary" && !isStationary(item)) {
            throw new Error("Invalid item type: Expected Stationary");
        }
        if (typeOfItem === "uniforms" && !isUniform(item)) {
            throw new Error("Invalid item type: Expected Uniform");
        }
        const res = await db.insert(typeOfItem === "book" ? booksTable : typeOfItem === "stationary" ? StationaryTable : UniformsTable).values(item).returning().get();
        if (!res) {
            throw new Error("Failed to insert item into the database");
        }
        return res;
    }catch(error) {
        console.error("Error inserting item:", error);
        return null
    }
}

export default insertItem;