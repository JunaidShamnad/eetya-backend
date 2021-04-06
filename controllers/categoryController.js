const Category = require('../models/category');

module.exports = {
    getCategories:()=>{
        return new Promise((resolve, reject) => {
            Category.find({}).then((data)=>{
                console.log(data);
                resolve(data)
            })            
        })
        
    }
};
