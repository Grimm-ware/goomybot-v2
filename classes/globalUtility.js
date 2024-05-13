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
   
   static capitalizeWords(str) {
       // Check if the input is a string
       if (typeof str !== 'string') {
           // If not a string, return an empty string or throw an error
           return ''; // or throw new Error('Input must be a string');
       }

       // Split the string into an array of words
       const words = str.split(/\s+/);

       // Capitalize each word and handle hyphens
       const capitalizedWords = words.map(word => {
           // If the word contains a hyphen
           if (word.includes('-')) {
               // Split the word by hyphen and capitalize each part
               return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
           } else {
               // Capitalize the word
               return word.charAt(0).toUpperCase() + word.slice(1);
           }
       });

       // Join the capitalized words into a single string
       return capitalizedWords.join(' ');
   }
   
   static convertToCalcFormat(inputObj) {
    // Define the mapping between input and output property names
    const propertyMapping = {
        hp: 'hp',
        attack: 'atk',
        defense: 'def',
        specialAttack: 'spa',
        specialDefense: 'spd',
        speed: 'spe'
    };

    // Initialize an empty output object
    const outputObj = {};

    // Iterate over the properties of the input object
    for (const prop in inputObj) {
        if (inputObj.hasOwnProperty(prop)) {
            // Get the corresponding property name in the output format
            const outputProp = propertyMapping[prop];

            // If a corresponding property exists in the mapping, assign the value to the output object
            if (outputProp) {
                outputObj[outputProp] = inputObj[prop];
            }
        }
    }

    // Return the output object
    return outputObj;
   }
   
   static valuesToArray(obj) {
    const result = [];

    // Iterate over the keys and push their values into the array
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            result.push(obj[key]);
        }
    }

    return result;
}
}
module.exports = GlobalUtility;