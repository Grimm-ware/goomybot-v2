const {
	MongoClient
} = require("mongodb");
const config = require('../config/botConfig.json')

	class DatabaseManager {
	constructor() {
		this.url = config.dev.mongoConnection;
		this.client = new MongoClient(this.url, {
				//useNewUrlParser: true, useUnifiedTopology: true
			});
	}
	async upsertBulkObject(collectionName, array, queryField) {
		try {
			//console.log(`Collection: ${collectionName}\narray[0]: ${array[0]}\nquery: ${queryField}`)
			//await this.connect()
			const database = this.client.db();
			const collection = database.collection(collectionName);
			var upsertOperation = {}
			var update = {}
			var bulkOperation = []
			var filter = {}
			for (var i = 0; i < array.length; i++) {
				update = {
					$set: {
						...array[i]
					} // Set the entire document to the new object
				};
				filter = {
					[queryField]: array[i][queryField]
				}
				upsertOperation = {
					updateOne: {
						filter,
						update,
						upsert: true, // Perform an upsert (insert if not exists, update if exists)
					},
				};
				bulkOperation.push(upsertOperation)
			}

			// Upsert the object based on the "_id" field
			const result = await collection.bulkWrite(bulkOperation)
				//await this.disconnect()
				return result;
		} catch (error) {
			console.error('Error upserting object:', error);
			this.disconnect()
			throw error;
		}
	}

	async upsertObject(collectionName, object, query) {
		try {
			//await this.connect()
			const database = this.client.db();
			const collection = database.collection(collectionName);

			// Upsert the object based on the "_id" field
			const result = await collection.updateOne(
					query, {
					$set: object
				}, {
					upsert: true
				});
			//await this.disconnect()
			return result;
		} catch (error) {
			console.error('Error upserting object:', error);
			this.disconnect()
			throw error;
		}
	}
	async deleteFromCollectionByField(collectionName, filter) {
		try {
			const database = this.client.db();
			const collection = database.collection(collectionName);
			const result = await collection.deleteMany(filter);
			console.log(`${result.deletedCount} documents deleted`);
		} catch (error) {
			console.error('Error deleting object:', error);
			this.disconnect()
			throw error;
		}

	}

	async getFromCollectionByField(collection, field) {
		try {
			//await this.connect()
			var database = this.client.db();
			var collection = database.collection(collection);
			// Upsert the object based on the "_id" field
			const result = await collection.find(field).toArray();
			//await this.disconnect()
			return result;
		} catch (error) {
			console.error('Error upserting object:', error);
			this.disconnect()
			throw error;
		}
	}

	//used for creating user views, generally to get pokemon but in future can be used for items or whatever else
	async getFromCollectionByFieldsWithPagination(collectionName, fields, pageNumber, itemsPerPage, projection) {
		try {
			// Connect to the database
			var database = this.client.db();
			var collection = database.collection(collectionName);

			// Calculate the skip value based on the page number and items per page
			var skip = (pageNumber - 1) * itemsPerPage;

			// Define the projection to specify the fields to return
			var projectionFields = {};
			if (projection) {
				projection.forEach(field => {
					projectionFields[field] = 1;
				});
			}

			// Perform the query with pagination and projection
			const result = await collection
				.find(fields)
				.project(projectionFields) // Apply the projection
				.skip(skip)
				.limit(itemsPerPage)
				.toArray();

			return result;
		} catch (error) {
			console.error('Error querying collection with pagination:', error);
			this.disconnect();
			throw error;
		}
	}

	async getRaidPokemonByName(name) {
		try {
			//await this.connect()
			const database = this.client.db();
			const collection = database.collection("raidPokemon");

			// Upsert the object based on the "_id" field
			const result = await collection.find({
					name: name
				});
			//await this.disconnect()
			return result;
		} catch (error) {
			console.error('Error upserting object:', error);
			this.disconnect()
			throw error;
		}
	}

	async connect() {
		try {
			await this.client.connect();
			//console.log("Connected to MongoDB");
			this.db = this.client.db(); // Get the default database
		} catch (error) {
			console.error("Error connecting to MongoDB:", error);
		}
	}

	async disconnect() {
		try {
			await this.client.close();
			//console.log("Disconnected from MongoDB");
		} catch (error) {
			console.error("Error disconnecting from MongoDB:", error);
		}
	}

}

module.exports = DatabaseManager;