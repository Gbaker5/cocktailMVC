const User = require("../models/User")
const Lists = require("../models/Lists")
const Favorites = require("../models/Favorites")
const axios = require('axios')


module.exports = {
    getIndex: (req,res)=>{
        res.render('index.ejs')
    },

    getHome: async (req,res) => {

        ///CREATE TWO ARRAYS TO SPLIT INGREDIENTS INTO TWO COLUMNS
            const ingredientsOne = [];
            const ingredientsTwo = [];


        try{
        //IngredientList
        const response = await axios.get(
        'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list'
      )

        const rawIngredients = response.data.drinks || []
        
        const ingredients = [];
        rawIngredients.forEach(item => {   
        ingredients.push(item.strIngredient1);
        })

        //console.log(ingredients)

       
        for (let i = 0; i < ingredients.length; i++) {
            if (i < ingredients.length / 2) {
                ingredientsOne.push(ingredients[i]);
            } else {
                ingredientsTwo.push(ingredients[i]);
            }
        }

        console.log(ingredientsOne.length, ingredientsTwo.length)

       

        }catch(err){
            console.error(err)
        }



        res.render('home.ejs', { ingredientsOne, ingredientsTwo})
    },
    

    

    
}