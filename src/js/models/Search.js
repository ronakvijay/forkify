import axios from 'axios';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        const key= '221b5bc838aa93cb1491ac93b5bc795b'; 
        try {
            const result = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = result.data.recipes;   
        } catch(err) {
            alert(err)
        }
        
    }
}
