import fs from 'fs';

const ServiceAccount = {}

ServiceAccount.readData = () => {
    try {
      const data = fs.readFileSync('./db.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading file:', error);
      return { accounts: [] }; 
    }
  };
  


export default ServiceAccount