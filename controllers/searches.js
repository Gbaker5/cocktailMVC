const User = require("../models/User")
const Lists = require("../models/Lists")
const Favorites = require("../models/Favorites")
const axios = require('axios')

module.exports = {
getLetterSearch: async (req,res) => {

         ///CREATE TWO ARRAYS TO SPLIT INGREDIENTS INTO TWO COLUMNS
            const ingredientsOne = [];
            const ingredientsTwo = [];

        try {

            //GET INGREDIENT LIST FOR SIDEBAR same as home controller

             //IngredientList
        const ingredientResponse = await axios.get(
        'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list'
      )

        const rawIngredients = ingredientResponse.data.drinks || []
        
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

       

      const letter = req.params.letter

      const response = await axios.get(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`
      )

       const rawDrinks = response.data.drinks || []

      const drinks = rawDrinks.map(drink => {

        // INGREDIENTS
        let ingredientList = []
        const keys = Object.keys(drink)

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


        // COMBINED INGREDIENT + MEASUREMENT
        const ingredients = ingredientList.map((ingredient, i) => ({
          ingredient,
          measurement: measurementList[i] || ''
        }))


        return {
          idDrink: drink.idDrink,
          name: drink.strDrink,
          image: drink.strDrinkThumb,
          alcoholic: drink.strAlcoholic,
          glass: drink.strGlass,
          instructions: drink.strInstructions,
          ingredients,
          favorited: false // Placeholder for favorite status, to be updated later
        }

      })

      //LOGIC TO CHECK FAVORITES - AND ADD FAVORITE STATUS TO EACH DRINK OBJECT --- IGNORE FOR NOW ---

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

        //console.log(drinks)


        
        //Load names of lists
        const drinkLists = await Lists.find({ user: req.user.id }).lean()

        const drinkListsWithFlags = drinkLists.map(list => ({
          ...list,
          drinkSet: new Set(list.drinkIds) // faster lookup
        }))

        const formatLetter = letter.toUpperCase()


      res.render('searches.ejs', { 
        drinks: drinksWithFavorites, 
        ingredientsOne: ingredientsOne || [], 
        ingredientsTwo: ingredientsTwo || [], 
        drinkLists: drinkListsWithFlags || [],
        inputValue: formatLetter || ''
    })
    } catch (err) {
  console.error(err)
  res.render('searches.ejs', { 
    drinks: [],
    ingredientsOne: [],
    ingredientsTwo: [],
    drinkLists: [],
    inputValue: ''
  })
}

  

    },
redirectIngredient: (req, res) => {

    const inputValue = req.query.ingredient

   const formatStr = inputValue
  .trim()              // removes leading + trailing spaces
  .split(/\s+/)        // handles multiple spaces between words
  .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
  .join(" ");          // keeps a single space between words

    res.redirect(`/search/ingredient/${formatStr}`)
    },

    /////Ingredient search, two step fetch first to get drink IDs, second to get drink details in parallel, then transform data same as letter controller
    getIngredientSearch: async (req,res) => {

         ///CREATE TWO ARRAYS TO SPLIT INGREDIENTS INTO TWO COLUMNS
            const ingredientsOne = [];
            const ingredientsTwo = [];

        try {

            //GET INGREDIENT LIST FOR SIDEBAR same as home controller

              //GET INGREDIENT LIST FOR SIDEBAR same as home controller

             //IngredientList
        const ingredientResponse = await axios.get(
        'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list'
      )

        const rawIngredients = ingredientResponse.data.drinks || []
        
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

        //console.log(ingredientsOne.length, ingredientsTwo.length)

        // END SIDEBAR INGREDIENT FETCH

      const inputValue = req.params.ingredient
            //console.log("Raw input:", inputValue)

      // format input (same as your frontend)
      const formatStr = inputValue
        .split(" ")
        .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")


      // FIRST FETCH (ingredient filter)
      const filterResponse = await axios.get(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${formatStr}`
      )

      const drinkIdArr = (filterResponse.data.drinks || []).map(d => d.idDrink)

      

      // SECOND FETCH (parallel lookup)
      const requests = drinkIdArr.map(id =>
        axios
          .get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
          .then(res => res.data.drinks?.[0])
          .catch(err => {
            console.error(`Error fetching ${id}`, err)
            return null
          })
      )

      const rawDrinks = (await Promise.all(requests)).filter(Boolean)


      // SAME TRANSFORMATION AS LETTER CONTROLLER
      const drinks = rawDrinks.map(drink => {

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

        


        return {
          idDrink: drink.idDrink,
          name: drink.strDrink,
          image: drink.strDrinkThumb,
          alcoholic: drink.strAlcoholic,
          glass: drink.strGlass,
          instructions: drink.strInstructions,
          ingredients
        }

      })

       //LOGIC TO CHECK FAVORITES - AND ADD FAVORITE STATUS TO EACH DRINK OBJECT --- IGNORE FOR NOW ---

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

        //console.log(drinks)


        //Load names of lists
        const drinkLists = await Lists.find({ user: req.user.id }).lean()

        const drinkListsWithFlags = drinkLists.map(list => ({
          ...list,
          drinkSet: new Set(list.drinkIds) // faster lookup
        }))


      res.render('searches.ejs', { 
        drinks: drinksWithFavorites, 
        ingredientsOne: ingredientsOne || [], 
        ingredientsTwo: ingredientsTwo || [] , 
        drinkLists: drinkListsWithFlags || [],
        inputValue: formatStr || '' 
    })

    } catch (err) {
  console.error(err)
  res.render('searches.ejs', { 
    drinks: [],
    ingredientsOne: [],
    ingredientsTwo: [],
    drinkLists: [],
    inputValue: ''
  })
}


    },

}