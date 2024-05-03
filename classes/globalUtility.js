const { v4: uuidv4 } = require('uuid');

class GlobalUtility {
	static parseJSON(obj) {
		if (typeof obj === 'string') {
			try {
				// Attempt to parse the string as JSON
				return JSON.parse(obj);
			} catch (error) {
				// Handle parsing errors gracefully
				return obj;
			}
		} else if (Array.isArray(obj)) {
			// Recursively parse arrays
			return obj.map((item) => GlobalUtility.parseJSON(item));
		} else if (typeof obj === 'object' && obj !== null) {
			// Recursively parse objects
			for (const key in obj) {
				if (obj[key] === null || obj[key] === undefined) {
					obj[key] = ""
				} else {
					obj[key] = GlobalUtility.parseJSON(obj[key]);
				}
			}
		}
		// Return the parsed object
		return obj;
	}
   
   static getuuid(){
      return uuidv4();
   }

	static sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}
   
   static getRandomRange(limit){
		// Generate a random index between 0 and limit length minus 1
      return Math.floor(Math.random() * limit);
   }

	static getRandomFromArray(arr) {
		// Generate a random index between 0 and the array length minus 1
		const randomIndex = Math.floor(Math.random() * arr.length);

		// Return the element at the randomly generated index
		return arr[randomIndex];
	}

	static getRandomDistinctElements(arr, x) {
		if (x > arr.length) {
			throw new Error("Cannot select more elements than available in the array");
		}

		const shuffledArray = arr.slice(); // Create a copy of the array
		for (let i = shuffledArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
		}

		return shuffledArray.slice(0, x); // Select the first x elements
	}

}
module.exports = GlobalUtility;