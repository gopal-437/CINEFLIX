const fs = require('fs').promises;

async function readJSONFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        // console.log('JSON content:', jsonData);
        return jsonData;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error; // or handle it as needed
    }
}

// Usage
const getCitiesData = async () => {
    const filePath = './helpers/data/cities.json'; // Adjust path as needed
    const jsonData = await readJSONFile(filePath);
    
    const cities = jsonData.map(city => {
        return {id : city.id, label: city.name};
    });

    return cities;
};

module.exports = {getCitiesData};



