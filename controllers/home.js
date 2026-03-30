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
    

    

     putFavorites: async (req,res) =>{

    const favDrinkId = req.params.id
    const userId = req.user.id

    try {

        // create favorites document if it doesn't exist
        const favDrinkId = req.params.id
        const userId = req.user.id


        let favorites = await Favorites.findOne({ user: userId })
        console.log("Current favorites document:", favorites)

        if (!favorites) {
            favorites = new Favorites(
                { user: userId, drinkIds: [favDrinkId] })
            await favorites.save()
            //console.log("Created new favorites document:", favorites)
        }

        if (favorites.drinkIds.includes(favDrinkId)) {

            await Favorites.findOneAndUpdate(
                { user: userId },
                { $pull: { drinkIds: favDrinkId } },
                { new: true }
            )

            return res.json({
                status: "removed",
                message: `Drink ${favDrinkId} removed from favorites`
            })

        } else {

            await Favorites.findOneAndUpdate(
                { user: userId },
                { $push: { drinkIds: favDrinkId } },
                { new: true }
            ) 

   
   
        res.json({
            status: "success",
            message: `Drink ${favDrinkId} added to favorites`
        })

    }

    } catch (err) {

        console.error(err)
        res.status(500).json({
            status: "error",
            message: err.message
        })  
    }

    },
     



    
   

   
   

    getFavorites: async (req,res) =>{
        let drinks = [];
        try{
            
       
        const favesIdArr = await Favorites.findOne({ user: req.user.id })
        console.log("FAVORITES DOCUMENT:", favesIdArr)
        

        if (!favesIdArr) {
            return  res.render('favorites.ejs', {drinks: []})
            }
        else if (favesIdArr.drinkIds.length === 0) {
            return res.render('favorites.ejs', {drinks: []})
        }else{
            const requests = favesIdArr.drinkIds.map(id =>
                axios
                  .get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
                  .then(res => res.data.drinks?.[0])
                  .catch(err => {
                    console.error(`Error fetching ${id}`, err)
                    return null
                  })
              )

              const rawDrinks = (await Promise.all(requests)).filter(Boolean)
              //console.log("RAW DRINKS FROM FAVORITES:", rawDrinks)


               drinks = rawDrinks.map(drink => {

                const keys = Object.keys(drink)

                // INGREDIENTS
                let ingredientList = []

                const ingredientKeys = keys.filter(key =>
                  key.includes("strIngredient")
                )

                ingredientKeys.forEach(key => {
                  const value = drink[key]
                  if (value) ingredientList.push(value)
                })    
                // MEASUREMENTS
                let measurementList = []

                const measurementKeys = keys.filter(key =>
                  key.includes("strMeasure")
                )

                measurementKeys.forEach(key => {
                  const value = drink[key]
                  if (value) measurementList.push(value)
                })  

                 // COMBINE
                const ingredients = ingredientList.map((ingredient, i) => ({
                  ingredient,
                  measurement: measurementList[i] || ''
                }))

                console.log(drinks)
            
                return {
                    idDrink: drink.idDrink,
                    name: drink.strDrink,
                    image: drink.strDrinkThumb,
                    alcoholic: drink.strAlcoholic,
                    glass: drink.strGlass,
                    instructions: drink.strInstructions,
                    ingredients,
                
                }
            }   //end of drinks map    
        
        
            )}//end of conditional
        
        
             //LOGIC TO CHECK FAVORITES - AND ADD FAVORITE STATUS TO EACH DRINK OBJECT
        
              //check existing ids on page
              //check user's favorites list
              //add boolean to each drink - favorited: true/false 

        
                const favorites = await Favorites.findOne({ user: req.user.id })
        
                // fallback to empty array if none
                const favoriteIds = favorites?.drinkIds || []
        
                // convert to Set for O(1) lookup
                const favoriteSet = new Set(favoriteIds)
        
                // map over drinks and add favorited flag
                const drinksWithFavorites = drinks.map(drink => {
                  return {
                    ...drink,
                    favorited: favoriteSet.has(drink.idDrink)
                  }
                })

                //Load names of lists
                const drinkLists = await Lists.find({ user: req.user.id }).lean()

                const drinkListsWithFlags = drinkLists.map(list => ({
                  ...list,
                  drinkSet: new Set(list.drinkIds) // faster lookup
                }))

           




            
                res.render('favorites.ejs', {drinks: drinksWithFavorites || [], drinkLists: drinkListsWithFlags || []})
          

            }catch(err){
                console.error(err)
                res.render('favorites.ejs', {drinks: []})
            }


               },
    

   

    deleteFavorites: async (req,res) =>{

        res.render('favorites.ejs', {})

    }   
}